# Real-Time API Design for Franchise Management System

## Overview

This document outlines the API design for implementing real-time synchronization, POS integration, and notification systems in the franchise management platform.

## Real-Time Architecture

### 1. **Event-Driven Synchronization**

```typescript
// Event types for real-time sync
export enum SyncEventType {
  INVENTORY_UPDATE = 'inventory.update',
  POS_TRANSACTION = 'pos.transaction',
  ORDER_STATUS_CHANGE = 'order.status_change',
  APPROVAL_DECISION = 'approval.decision',
  INVOICE_GENERATED = 'invoice.generated',
  STOCK_ALERT = 'stock.alert'
}

// Sync event structure
interface SyncEvent {
  id: string
  eventType: SyncEventType
  entityType: string
  entityId: string
  changeData: Record<string, any>
  sourceSystem: string
  targetSystems: string[]
  timestamp: Date
  metadata?: Record<string, any>
}
```

### 2. **Real-Time Subscription Management**

```typescript
// Supabase real-time subscription service
export class RealtimeService {
  private subscriptions = new Map<string, RealtimeChannel>()

  // Subscribe to franchise-specific events
  subscribeToFranchise(franchiseId: string, callback: (event: SyncEvent) => void) {
    const channel = supabase
      .channel(`franchise:${franchiseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sync_events',
        filter: `entity_id=eq.${franchiseId}`
      }, callback)
      .subscribe()

    this.subscriptions.set(`franchise:${franchiseId}`, channel)
  }

  // Subscribe to location-specific events
  subscribeToLocation(locationId: string, callback: (event: SyncEvent) => void) {
    const channel = supabase
      .channel(`location:${locationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pos_transactions',
        filter: `location_id=eq.${locationId}`
      }, callback)
      .subscribe()

    this.subscriptions.set(`location:${locationId}`, channel)
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.subscriptions.forEach(channel => {
      supabase.removeChannel(channel)
    })
    this.subscriptions.clear()
  }
}
```

## POS Integration Framework

### 1. **POS System Registration**

```typescript
// POS system configuration
interface POSSystemConfig {
  locationId: string
  systemType: 'square' | 'clover' | 'toast' | 'custom'
  apiEndpoint: string
  credentials: {
    apiKey: string
    secretKey: string
    merchantId?: string
  }
  syncSettings: {
    enabled: boolean
    frequencyMinutes: number
    autoSync: boolean
  }
}

// Register POS system
export async function registerPOSSystem(config: POSSystemConfig) {
  const { data, error } = await supabase
    .from('pos_systems')
    .insert({
      location_id: config.locationId,
      system_type: config.systemType,
      api_endpoint: config.apiEndpoint,
      api_credentials: encrypt(config.credentials),
      sync_enabled: config.syncSettings.enabled,
      sync_frequency_minutes: config.syncSettings.frequencyMinutes
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 2. **Transaction Synchronization**

```typescript
// POS transaction sync service
export class POSTransactionSync {
  async syncTransactions(posSystemId: string, since?: Date) {
    const posSystem = await this.getPOSSystem(posSystemId)
    const transactions = await this.fetchTransactionsFromPOS(posSystem, since)
    
    for (const transaction of transactions) {
      await this.processTransaction(posSystemId, transaction)
    }
  }

  private async processTransaction(posSystemId: string, transaction: any) {
    try {
      // Insert transaction
      const { data: posTransaction } = await supabase
        .from('pos_transactions')
        .insert({
          pos_system_id: posSystemId,
          external_transaction_id: transaction.id,
          transaction_timestamp: transaction.timestamp,
          total_amount: transaction.total,
          payment_method: transaction.paymentMethod,
          metadata: transaction.metadata
        })
        .select()
        .single()

      // Insert line items
      for (const item of transaction.items) {
        await supabase
          .from('pos_transaction_items')
          .insert({
            transaction_id: posTransaction.id,
            product_id: await this.mapProductId(item.sku),
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice
          })

        // Update inventory
        await this.updateInventory(posTransaction.location_id, item)
      }

      // Trigger real-time event
      await this.triggerSyncEvent({
        eventType: SyncEventType.POS_TRANSACTION,
        entityType: 'pos_transaction',
        entityId: posTransaction.id,
        changeData: posTransaction,
        sourceSystem: 'pos'
      })

    } catch (error) {
      console.error('Transaction sync error:', error)
      await this.logSyncError(posSystemId, transaction.id, error)
    }
  }
}
```

## Inventory Management API

### 1. **Real-Time Stock Updates**

```typescript
// Inventory service with real-time updates
export class InventoryService {
  async updateStock(locationId: string, productId: string, change: StockChange) {
    const { data: inventoryItem, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('location_id', locationId)
      .eq('product_id', productId)
      .single()

    if (error) throw error

    const newStock = inventoryItem.current_stock + change.quantity
    
    // Update inventory
    await supabase
      .from('inventory_items')
      .update({ 
        current_stock: newStock,
        last_restocked_at: change.type === 'in' ? new Date() : inventoryItem.last_restocked_at
      })
      .eq('id', inventoryItem.id)

    // Log stock movement
    await supabase
      .from('stock_movements')
      .insert({
        inventory_item_id: inventoryItem.id,
        movement_type: change.type,
        quantity: Math.abs(change.quantity),
        reference_type: change.referenceType,
        reference_id: change.referenceId,
        performed_by: change.userId
      })

    // Check for low stock alerts
    if (newStock <= inventoryItem.reorder_level) {
      await this.triggerLowStockAlert(inventoryItem)
    }

    // Trigger real-time update
    await this.triggerSyncEvent({
      eventType: SyncEventType.INVENTORY_UPDATE,
      entityType: 'inventory_item',
      entityId: inventoryItem.id,
      changeData: { 
        previous_stock: inventoryItem.current_stock,
        new_stock: newStock,
        change: change.quantity
      }
    })
  }

  private async triggerLowStockAlert(inventoryItem: any) {
    const product = await this.getProduct(inventoryItem.product_id)
    const location = await this.getLocation(inventoryItem.location_id)
    
    await supabase
      .from('notification_queue')
      .insert({
        recipient_id: location.franchisee_id,
        notification_type: 'stock_alert',
        title: 'Low Stock Alert',
        message: `${product.name} is running low at ${location.name}. Current stock: ${inventoryItem.current_stock}`,
        data: {
          product_id: product.id,
          location_id: location.id,
          current_stock: inventoryItem.current_stock,
          reorder_level: inventoryItem.reorder_level
        },
        priority: 3
      })
  }
}
```

### 2. **Automated Reordering**

```typescript
// Automated purchase order generation
export class AutoReorderService {
  async checkAndCreateReorders(locationId: string) {
    const lowStockItems = await supabase
      .from('inventory_items')
      .select(`
        *,
        products (*, product_suppliers (*))
      `)
      .eq('location_id', locationId)
      .lte('current_stock', 'reorder_level')

    if (lowStockItems.data?.length) {
      await this.createPurchaseOrder(locationId, lowStockItems.data)
    }
  }

  private async createPurchaseOrder(locationId: string, items: any[]) {
    const orderNumber = await this.generateOrderNumber()
    
    const { data: purchaseOrder } = await supabase
      .from('purchase_orders')
      .insert({
        location_id: locationId,
        order_number: orderNumber,
        status: 'draft',
        created_by: 'system'
      })
      .select()
      .single()

    for (const item of items) {
      const supplier = item.products.product_suppliers.find(ps => ps.is_primary)
      const reorderQuantity = item.max_stock_level - item.current_stock

      await supabase
        .from('purchase_order_items')
        .insert({
          purchase_order_id: purchaseOrder.id,
          product_id: item.product_id,
          quantity: reorderQuantity,
          unit_price: supplier?.cost_price || item.products.cost_price,
          total_price: reorderQuantity * (supplier?.cost_price || item.products.cost_price)
        })
    }

    // Trigger approval workflow
    await this.triggerApprovalWorkflow(purchaseOrder.id, 'order')
  }
}
```

## Notification System

### 1. **Real-Time Notifications**

```typescript
// Notification service
export class NotificationService {
  async sendNotification(notification: NotificationRequest) {
    // Insert into queue
    const { data } = await supabase
      .from('notification_queue')
      .insert({
        recipient_id: notification.recipientId,
        notification_type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        delivery_method: notification.deliveryMethod,
        priority: notification.priority
      })
      .select()
      .single()

    // Send immediately for high priority
    if (notification.priority <= 3) {
      await this.processNotification(data.id)
    }

    return data
  }

  async processNotification(notificationId: string) {
    const notification = await this.getNotification(notificationId)
    const preferences = await this.getUserPreferences(notification.recipient_id)

    // Send via enabled channels
    if (preferences.email_enabled && notification.delivery_method === 'email') {
      await this.sendEmail(notification)
    }
    
    if (preferences.push_enabled && notification.delivery_method === 'push') {
      await this.sendPushNotification(notification)
    }

    // Always send in-app notification
    await this.sendInAppNotification(notification)
  }

  private async sendInAppNotification(notification: any) {
    // Trigger real-time update to user's dashboard
    await supabase
      .channel(`user:${notification.recipient_id}`)
      .send({
        type: 'broadcast',
        event: 'notification',
        payload: notification
      })
  }
}
```

### 2. **Workflow Notifications**

```typescript
// Approval workflow notifications
export class WorkflowNotificationService {
  async notifyApprovalRequired(approvalInstance: any) {
    const workflow = await this.getWorkflow(approvalInstance.workflow_id)
    const currentStep = workflow.workflow_config.steps[approvalInstance.current_step - 1]
    
    for (const approverId of currentStep.approvers) {
      await this.notificationService.sendNotification({
        recipientId: approverId,
        type: 'approval_required',
        title: `Approval Required: ${workflow.name}`,
        message: `A ${approvalInstance.entity_type} requires your approval`,
        data: {
          approval_instance_id: approvalInstance.id,
          entity_type: approvalInstance.entity_type,
          entity_id: approvalInstance.entity_id
        },
        deliveryMethod: 'in_app',
        priority: 2
      })
    }
  }

  async notifyApprovalDecision(approvalInstance: any, decision: string) {
    const entityOwner = await this.getEntityOwner(
      approvalInstance.entity_type, 
      approvalInstance.entity_id
    )

    await this.notificationService.sendNotification({
      recipientId: entityOwner.id,
      type: 'approval_decision',
      title: `Approval ${decision}`,
      message: `Your ${approvalInstance.entity_type} has been ${decision}`,
      data: {
        approval_instance_id: approvalInstance.id,
        decision: decision,
        entity_type: approvalInstance.entity_type,
        entity_id: approvalInstance.entity_id
      },
      deliveryMethod: 'email',
      priority: 1
    })
  }
}
```

## Conflict Resolution

### 1. **Optimistic Locking**

```typescript
// Optimistic locking for concurrent updates
export class ConflictResolutionService {
  async updateWithConflictDetection(
    table: string, 
    id: string, 
    updates: any, 
    expectedVersion: number
  ) {
    const { data: current } = await supabase
      .from(table)
      .select('*, version')
      .eq('id', id)
      .single()

    if (current.version !== expectedVersion) {
      // Conflict detected
      await this.logConflict({
        entityType: table,
        entityId: id,
        conflictType: 'concurrent_update',
        sourceData: updates,
        targetData: current
      })
      
      throw new ConflictError('Data has been modified by another user')
    }

    // Update with version increment
    const { data, error } = await supabase
      .from(table)
      .update({
        ...updates,
        version: current.version + 1,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq('version', expectedVersion)
      .select()
      .single()

    if (error) throw error
    return data
  }

  private async logConflict(conflict: any) {
    await supabase
      .from('sync_conflicts')
      .insert(conflict)
  }
}
```

This API design provides a comprehensive framework for real-time synchronization, POS integration, inventory management, and notification systems that can scale to handle high-volume franchise operations while maintaining data consistency and user experience.
