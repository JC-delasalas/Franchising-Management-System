# FranchiseHub API Documentation

This document provides comprehensive documentation for all API modules in the FranchiseHub system.

## Table of Contents

1. [PaymentMethodsAPI](#paymentmethodsapi)
2. [AddressesAPI](#addressesapi)
3. [CartAPI](#cartapi)
4. [ProductsAPI](#productsapi)
5. [ReorderTemplatesAPI](#reordertemplatesapi)
6. [OrdersAPI](#ordersapi)
7. [Common Patterns](#common-patterns)
8. [Error Handling](#error-handling)

---

## PaymentMethodsAPI

Manages user payment methods including bank transfers, credit/debit cards, GCash, and cash on delivery.

### Methods

#### `getPaymentMethods(): Promise<PaymentMethod[]>`
Retrieves all payment methods for the current user.

**Returns:** Array of payment methods ordered by default status and creation date.

#### `getPaymentMethod(id: string): Promise<PaymentMethod | null>`
Retrieves a specific payment method by ID.

**Parameters:**
- `id` - Payment method ID

**Returns:** Payment method object or null if not found.

#### `createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethod>`
Creates a new payment method.

**Parameters:**
- `data.payment_type` - Type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'gcash' | 'cash_on_delivery'
- `data.nickname` - Optional display name
- `data.is_default` - Whether this is the default payment method
- Additional fields based on payment type

**Returns:** Created payment method object.

#### `updatePaymentMethod(id: string, updates: Partial<CreatePaymentMethodData>): Promise<PaymentMethod>`
Updates an existing payment method.

#### `deletePaymentMethod(id: string): Promise<void>`
Deletes a payment method.

#### `setDefaultPaymentMethod(id: string): Promise<PaymentMethod>`
Sets a payment method as the default.

#### `getDefaultPaymentMethod(): Promise<PaymentMethod | null>`
Retrieves the user's default payment method.

#### `validatePaymentMethodData(data: CreatePaymentMethodData): string[]`
Validates payment method data and returns array of error messages.

#### `getPaymentMethodDisplay(paymentMethod: PaymentMethod): DisplayInfo`
Returns formatted display information for UI rendering.

---

## AddressesAPI

Manages billing and shipping addresses with Philippine address validation.

### Methods

#### `getAddresses(addressType?: 'billing' | 'shipping' | 'both'): Promise<Address[]>`
Retrieves user addresses, optionally filtered by type.

#### `getAddress(id: string): Promise<Address | null>`
Retrieves a specific address by ID.

#### `createAddress(data: CreateAddressData): Promise<Address>`
Creates a new address.

**Parameters:**
- `data.address_type` - 'billing' | 'shipping' | 'both'
- `data.recipient_name` - Recipient name
- `data.address_line_1` - Primary address line
- `data.city` - City name
- `data.state_province` - Province/state
- `data.postal_code` - 4-digit postal code
- Additional optional fields

#### `updateAddress(id: string, updates: Partial<CreateAddressData>): Promise<Address>`
Updates an existing address.

#### `deleteAddress(id: string): Promise<void>`
Deletes an address.

#### `setDefaultAddress(id: string, addressType: 'billing' | 'shipping' | 'both'): Promise<Address>`
Sets an address as default for the specified type.

#### `getDefaultAddress(addressType: 'billing' | 'shipping'): Promise<Address | null>`
Retrieves the default address for the specified type.

#### `validateAddressData(data: CreateAddressData): string[]`
Validates address data with Philippine-specific validation.

#### `formatAddressDisplay(address: Address): DisplayInfo`
Returns formatted address information for UI display.

#### `getPhilippineProvinces(): string[]`
Returns array of Philippine provinces for dropdown selection.

---

## CartAPI

Manages shopping cart operations with real-time calculations and validation.

### Methods

#### `getCartItems(): Promise<CartItemWithProduct[]>`
Retrieves all cart items with product details.

#### `addToCart(productId: string, quantity: number): Promise<CartItemWithProduct>`
Adds a product to the cart or updates quantity if already exists.

#### `updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItemWithProduct>`
Updates the quantity of a cart item.

#### `removeFromCart(cartItemId: string): Promise<void>`
Removes an item from the cart.

#### `clearCart(): Promise<void>`
Removes all items from the cart.

#### `getCartSummary(): Promise<CartSummary>`
Returns cart summary with calculations:
- Items array with product details
- Item count
- Subtotal
- Tax amount (12% VAT)
- Shipping cost (free over ₱5,000)
- Total amount

#### `getCartItemCount(): Promise<number>`
Returns total number of items in cart.

#### `isProductInCart(productId: string): Promise<boolean>`
Checks if a product is in the cart.

#### `getCartItemForProduct(productId: string): Promise<CartItemWithProduct | null>`
Retrieves cart item for a specific product.

#### `validateCart(): Promise<ValidationResult>`
Validates cart contents and returns validation status with errors/warnings.

#### `syncCart(): Promise<SyncResult>`
Synchronizes cart with product updates (removes inactive products).

#### `saveAsReorderTemplate(name: string, description?: string): Promise<void>`
Saves current cart as a reorder template.

---

## ProductsAPI

Manages product catalog with search, filtering, and cart integration.

### Methods

#### `getCatalogProducts(filters?: ProductFilters): Promise<ProductCatalogItem[]>`
Retrieves products for catalog display with cart information.

**Filters:**
- `category` - Product category
- `subcategory` - Product subcategory
- `brand` - Product brand
- `search` - Search term (name, description, SKU)
- `min_price` / `max_price` - Price range

#### `getProducts(filters?: ProductFilters): Promise<Product[]>`
Retrieves products without cart information.

#### `getProductById(id: string): Promise<Product | null>`
Retrieves a specific product by ID.

#### `getProductBySku(sku: string): Promise<Product | null>`
Retrieves a product by SKU.

#### `getCategories(): Promise<string[]>`
Returns array of available product categories.

#### `getSubcategories(category: string): Promise<string[]>`
Returns subcategories for a specific category.

#### `getBrands(): Promise<string[]>`
Returns array of available product brands.

#### `searchProducts(searchTerm: string, limit?: number): Promise<Product[]>`
Searches products by name, description, or SKU.

#### `getFeaturedProducts(limit?: number): Promise<Product[]>`
Returns featured products (newest products).

#### `getProductsByCategory(category: string, page?: number, limit?: number): Promise<PaginatedResult>`
Returns paginated products for a category.

#### `getRecentlyViewedProducts(productIds: string[]): Promise<Product[]>`
Returns products from a list of IDs (for recently viewed).

#### `getRecommendedProducts(productId: string, limit?: number): Promise<Product[]>`
Returns recommended products based on category similarity.

---

## ReorderTemplatesAPI

Manages saved order templates for quick reordering.

### Methods

#### `getReorderTemplates(): Promise<ReorderTemplateWithProducts[]>`
Retrieves all user templates with product details.

#### `getReorderTemplate(id: string): Promise<ReorderTemplateWithProducts | null>`
Retrieves a specific template with product details.

#### `createReorderTemplate(data: CreateReorderTemplateData): Promise<ReorderTemplate>`
Creates a new reorder template.

**Parameters:**
- `data.name` - Template name
- `data.description` - Optional description
- `data.template_data` - Array of {product_id, quantity}
- `data.is_favorite` - Whether template is favorited

#### `updateReorderTemplate(id: string, updates: Partial<CreateReorderTemplateData>): Promise<ReorderTemplate>`
Updates an existing template.

#### `deleteReorderTemplate(id: string): Promise<void>`
Deletes a template.

#### `toggleFavorite(id: string): Promise<ReorderTemplate>`
Toggles the favorite status of a template.

#### `useTemplate(id: string): Promise<UseTemplateResult>`
Marks template as used and returns items for adding to cart.

#### `getFavoriteTemplates(): Promise<ReorderTemplateWithProducts[]>`
Returns only favorited templates.

#### `createTemplateFromOrder(orderId: string, name: string, description?: string): Promise<ReorderTemplate>`
Creates a template from an existing order.

#### `validateTemplate(id: string): Promise<ValidationResult>`
Validates template (checks if products are still active).

---

## Common Patterns

### Authentication
All API methods automatically handle user authentication through Supabase Auth. Methods will throw an error if the user is not authenticated.

### Error Handling
All methods use consistent error handling:
- Database errors are caught and re-thrown with descriptive messages
- Validation errors return arrays of error messages
- Not found scenarios return null rather than throwing errors

### Data Types
```typescript
interface PaymentMethod {
  id: string;
  user_id: string;
  payment_type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'gcash' | 'cash_on_delivery';
  nickname?: string;
  is_default: boolean;
  // Type-specific fields...
}

interface Address {
  id: string;
  user_id: string;
  address_type: 'billing' | 'shipping' | 'both';
  recipient_name: string;
  address_line_1: string;
  city: string;
  state_province: string;
  postal_code: string;
  // Additional fields...
}

interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
}
```

### Validation
All APIs include comprehensive validation:
- Client-side validation for immediate feedback
- Server-side validation for security
- Philippine-specific validation for addresses and phone numbers
- Business rule validation (min/max quantities, etc.)

---

## Error Handling

### Common Error Types
- `Authentication Error`: User not logged in
- `Permission Error`: User lacks required permissions
- `Validation Error`: Invalid input data
- `Not Found Error`: Resource doesn't exist
- `Database Error`: Database operation failed

### Error Response Format
```typescript
{
  message: string;
  code?: string;
  details?: any;
}
```

### Best Practices
- Always wrap API calls in try-catch blocks
- Display user-friendly error messages
- Log detailed errors for debugging
- Implement retry logic for transient failures
- Validate data before API calls when possible
