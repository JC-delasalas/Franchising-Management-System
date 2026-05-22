// Complete Database Types - Generated from Complete Schema
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'franchisee' | 'franchisor' | 'admin' | null
          status: 'active' | 'inactive' | 'suspended'
          metadata: Record<string, any>
          timezone: string
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'franchisee' | 'franchisor' | 'admin' | null
          status?: 'active' | 'inactive' | 'suspended'
          metadata?: Record<string, any>
          timezone?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'franchisee' | 'franchisor' | 'admin' | null
          status?: 'active' | 'inactive' | 'suspended'
          metadata?: Record<string, any>
          timezone?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          address: Record<string, any>
          type: 'franchisor' | 'management_company' | 'investor'
          status: 'active' | 'inactive' | 'suspended'
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: Record<string, any>
          type?: 'franchisor' | 'management_company' | 'investor'
          status?: 'active' | 'inactive' | 'suspended'
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: Record<string, any>
          type?: 'franchisor' | 'management_company' | 'investor'
          status?: 'active' | 'inactive' | 'suspended'
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      franchises: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          category: string | null
          investment_range_min: number | null
          investment_range_max: number | null
          franchise_fee: number | null
          royalty_rate: number | null
          marketing_fee_rate: number | null
          territory: string | null
          support_provided: string[]
          requirements: string[]
          contact_email: string | null
          contact_phone: string | null
          website_url: string | null
          logo_url: string | null
          images: string[]
          status: 'active' | 'inactive' | 'pending' | 'suspended'
          featured: boolean
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          category?: string | null
          investment_range_min?: number | null
          investment_range_max?: number | null
          franchise_fee?: number | null
          royalty_rate?: number | null
          marketing_fee_rate?: number | null
          territory?: string | null
          support_provided?: string[]
          requirements?: string[]
          contact_email?: string | null
          contact_phone?: string | null
          website_url?: string | null
          logo_url?: string | null
          images?: string[]
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          featured?: boolean
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          category?: string | null
          investment_range_min?: number | null
          investment_range_max?: number | null
          franchise_fee?: number | null
          royalty_rate?: number | null
          marketing_fee_rate?: number | null
          territory?: string | null
          support_provided?: string[]
          requirements?: string[]
          contact_email?: string | null
          contact_phone?: string | null
          website_url?: string | null
          logo_url?: string | null
          images?: string[]
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          featured?: boolean
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      franchise_packages: {
        Row: {
          id: string
          franchise_id: string
          name: string
          description: string | null
          initial_fee: number
          monthly_royalty_rate: number
          marketing_fee_rate: number
          included_products: string[]
          max_locations: number
          territory_size: string | null
          support_level: string
          training_hours: number
          equipment_included: boolean
          marketing_materials_included: boolean
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          franchise_id: string
          name: string
          description?: string | null
          initial_fee: number
          monthly_royalty_rate: number
          marketing_fee_rate?: number
          included_products?: string[]
          max_locations?: number
          territory_size?: string | null
          support_level?: string
          training_hours?: number
          equipment_included?: boolean
          marketing_materials_included?: boolean
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string
          name?: string
          description?: string | null
          initial_fee?: number
          monthly_royalty_rate?: number
          marketing_fee_rate?: number
          included_products?: string[]
          max_locations?: number
          territory_size?: string | null
          support_level?: string
          training_hours?: number
          equipment_included?: boolean
          marketing_materials_included?: boolean
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      franchise_applications: {
        Row: {
          id: string
          franchise_id: string | null
          package_id: string | null
          applicant_id: string
          status: 'pending' | 'approved' | 'rejected'
          application_data: Record<string, any>
          initial_payment_amount: number | null
          monthly_royalty_amount: number | null
          business_plan: string | null
          financial_statements: Record<string, any>
          references: Record<string, any>
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          submitted_at: string
          reviewed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          franchise_id?: string | null
          package_id?: string | null
          applicant_id: string
          status?: 'pending' | 'approved' | 'rejected'
          application_data?: Record<string, any>
          initial_payment_amount?: number | null
          monthly_royalty_amount?: number | null
          business_plan?: string | null
          financial_statements?: Record<string, any>
          references?: Record<string, any>
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string | null
          package_id?: string | null
          applicant_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          application_data?: Record<string, any>
          initial_payment_amount?: number | null
          monthly_royalty_amount?: number | null
          business_plan?: string | null
          financial_statements?: Record<string, any>
          references?: Record<string, any>
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      franchise_locations: {
        Row: {
          id: string
          franchise_id: string | null
          franchisee_id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          email: string | null
          status: 'planning' | 'construction' | 'training' | 'open' | 'closed' | 'sold'
          opening_date: string | null
          closing_date: string | null
          operating_hours: Record<string, any>
          manager_id: string | null
          square_footage: number | null
          seating_capacity: number | null
          parking_spaces: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          franchise_id?: string | null
          franchisee_id: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          status?: 'planning' | 'construction' | 'training' | 'open' | 'closed' | 'sold'
          opening_date?: string | null
          closing_date?: string | null
          operating_hours?: Record<string, any>
          manager_id?: string | null
          square_footage?: number | null
          seating_capacity?: number | null
          parking_spaces?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string | null
          franchisee_id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          status?: 'planning' | 'construction' | 'training' | 'open' | 'closed' | 'sold'
          opening_date?: string | null
          closing_date?: string | null
          operating_hours?: Record<string, any>
          manager_id?: string | null
          square_footage?: number | null
          seating_capacity?: number | null
          parking_spaces?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      // Product & Inventory Tables
      product_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          sku: string
          category_id: string | null
          price: number
          cost: number | null
          unit_of_measure: string
          weight: number | null
          dimensions: Record<string, any>
          images: string[]
          tags: string[]
          active: boolean
          featured: boolean
          minimum_order_quantity: number
          maximum_order_quantity: number | null
          reorder_level: number
          supplier_info: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sku: string
          category_id?: string | null
          price: number
          cost?: number | null
          unit_of_measure?: string
          weight?: number | null
          dimensions?: Record<string, any>
          images?: string[]
          tags?: string[]
          active?: boolean
          featured?: boolean
          minimum_order_quantity?: number
          maximum_order_quantity?: number | null
          reorder_level?: number
          supplier_info?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sku?: string
          category_id?: string | null
          price?: number
          cost?: number | null
          unit_of_measure?: string
          weight?: number | null
          dimensions?: Record<string, any>
          images?: string[]
          tags?: string[]
          active?: boolean
          featured?: boolean
          minimum_order_quantity?: number
          maximum_order_quantity?: number | null
          reorder_level?: number
          supplier_info?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string
          manager_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string
          manager_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string
          manager_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          warehouse_id: string
          product_id: string
          quantity_on_hand: number
          reserved_quantity: number
          available_quantity: number
          reorder_level: number
          max_stock_level: number | null
          last_restocked_at: string | null
          last_counted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          warehouse_id: string
          product_id: string
          quantity_on_hand?: number
          reserved_quantity?: number
          reorder_level?: number
          max_stock_level?: number | null
          last_restocked_at?: string | null
          last_counted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          warehouse_id?: string
          product_id?: string
          quantity_on_hand?: number
          reserved_quantity?: number
          reorder_level?: number
          max_stock_level?: number | null
          last_restocked_at?: string | null
          last_counted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Payment & Address Tables
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'gcash' | 'cash_on_delivery'
          provider: string
          provider_payment_method_id: string
          is_default: boolean
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'gcash' | 'cash_on_delivery'
          provider: string
          provider_payment_method_id: string
          is_default?: boolean
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'bank_transfer' | 'credit_card' | 'debit_card' | 'gcash' | 'cash_on_delivery'
          provider?: string
          provider_payment_method_id?: string
          is_default?: boolean
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          address_type: 'billing' | 'shipping' | 'both'
          recipient_name: string
          company_name: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state_province: string
          postal_code: string
          country: string
          phone_number: string | null
          delivery_instructions: string | null
          nickname: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address_type?: 'billing' | 'shipping' | 'both'
          recipient_name: string
          company_name?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          state_province: string
          postal_code: string
          country?: string
          phone_number?: string | null
          delivery_instructions?: string | null
          nickname?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address_type?: 'billing' | 'shipping' | 'both'
          recipient_name?: string
          company_name?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state_province?: string
          postal_code?: string
          country?: string
          phone_number?: string | null
          delivery_instructions?: string | null
          nickname?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Shopping Cart Tables
      shopping_cart: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          quantity: number
          added_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          quantity: number
          added_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          quantity?: number
          added_at?: string | null
          updated_at?: string | null
        }
      }
      // Order Management Tables
      orders: {
        Row: {
          id: string
          order_number: string
          franchise_location_id: string | null
          created_by: string | null
          status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_type: 'inventory' | 'equipment' | 'marketing' | 'maintenance'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          payment_method_id: string | null
          billing_address_id: string | null
          shipping_address_id: string | null
          carrier: string | null
          tracking_number: string | null
          shipping_method: string | null
          estimated_delivery_date: string | null
          shipped_date: string | null
          delivered_date: string | null
          approved_by: string | null
          approved_at: string | null
          approval_comments: string | null
          rejection_reason: string | null
          order_notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          franchise_location_id?: string | null
          created_by?: string | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_type?: 'inventory' | 'equipment' | 'marketing' | 'maintenance'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method_id?: string | null
          billing_address_id?: string | null
          shipping_address_id?: string | null
          carrier?: string | null
          tracking_number?: string | null
          shipping_method?: string | null
          estimated_delivery_date?: string | null
          shipped_date?: string | null
          delivered_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          approval_comments?: string | null
          rejection_reason?: string | null
          order_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          franchise_location_id?: string | null
          created_by?: string | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_type?: 'inventory' | 'equipment' | 'marketing' | 'maintenance'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method_id?: string | null
          billing_address_id?: string | null
          shipping_address_id?: string | null
          carrier?: string | null
          tracking_number?: string | null
          shipping_method?: string | null
          estimated_delivery_date?: string | null
          shipped_date?: string | null
          delivered_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          approval_comments?: string | null
          rejection_reason?: string | null
          order_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          line_total: number
          delivered_quantity: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          delivered_quantity?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          delivered_quantity?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          previous_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
          new_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          previous_status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
          new_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          previous_status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
          new_status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      order_approvals: {
        Row: {
          id: string
          order_id: string
          approver_id: string | null
          approval_level: number
          action: string
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          approver_id?: string | null
          approval_level?: number
          action: string
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          approver_id?: string | null
          approval_level?: number
          action?: string
          comments?: string | null
          created_at?: string
        }
      }
      // Notification Tables
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: 'order_approved' | 'order_rejected' | 'order_shipped' | 'order_delivered' | 'order_created' | 'system_announcement' | 'low_stock_alert' | 'payment_reminder'
          title: string
          message: string
          related_order_id: string | null
          action_url: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          is_read: boolean
          read_at: string | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: 'order_approved' | 'order_rejected' | 'order_shipped' | 'order_delivered' | 'order_created' | 'system_announcement' | 'low_stock_alert' | 'payment_reminder'
          title: string
          message: string
          related_order_id?: string | null
          action_url?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_read?: boolean
          read_at?: string | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          type?: 'order_approved' | 'order_rejected' | 'order_shipped' | 'order_delivered' | 'order_created' | 'system_announcement' | 'low_stock_alert' | 'payment_reminder'
          title?: string
          message?: string
          related_order_id?: string | null
          action_url?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_read?: boolean
          read_at?: string | null
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      user_notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          order_updates: boolean
          system_announcements: boolean
          marketing_notifications: boolean
          low_stock_alerts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          order_updates?: boolean
          system_announcements?: boolean
          marketing_notifications?: boolean
          low_stock_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          order_updates?: boolean
          system_announcements?: boolean
          marketing_notifications?: boolean
          low_stock_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      order_summary: {
        Row: {
          id: string
          order_number: string
          location_name: string
          franchise_name: string
          organization_name: string
          status: string
          total_amount: number
          order_date: string
          created_at: string
          item_count: number
        }
      }
      inventory_status: {
        Row: {
          warehouse_id: string
          warehouse_name: string
          product_id: string
          product_name: string
          sku: string
          category: string
          quantity_on_hand: number
          available_quantity: number
          reorder_level: number
          stock_status: string
          alert_level: string
        }
      }
      financial_summary: {
        Row: {
          location_id: string
          location_name: string
          franchise_name: string
          orders_last_30_days: number
          order_total_last_30_days: number
          sales_count_last_30_days: number
          sales_total_last_30_days: number
          pending_invoices: number
          pending_invoice_amount: number
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<string, never>
        Returns: string
      }
      generate_shipment_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_role: 'user' | 'franchisee' | 'franchisor' | 'admin'
      user_status: 'active' | 'inactive' | 'suspended'
      organization_type: 'franchisor' | 'management_company' | 'investor'
      franchise_status: 'active' | 'inactive' | 'pending' | 'suspended'
      order_status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
    }
  }
}

// Convenience types for common operations
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Franchise = Database['public']['Tables']['franchises']['Row']
export type FranchisePackage = Database['public']['Tables']['franchise_packages']['Row']
export type FranchiseApplication = Database['public']['Tables']['franchise_applications']['Row']
export type FranchiseLocation = Database['public']['Tables']['franchise_locations']['Row']

export type UserRole = Database['public']['Enums']['user_role']
export type UserStatus = Database['public']['Enums']['user_status']
export type FranchiseStatus = Database['public']['Enums']['franchise_status']
