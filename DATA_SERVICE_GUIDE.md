# Data Service - Centralized Data Management

## Overview

The Data Service provides centralized, cached access to `categories.json` throughout the application. This eliminates redundant fetches and significantly improves performance.

## Features

✅ **Single Source of Truth** - One service manages all category data
✅ **Automatic Caching** - Data cached for 5 minutes to reduce network requests
✅ **Deduplication** - Multiple simultaneous requests share the same fetch promise
✅ **Helper Methods** - Convenient methods for common data queries
✅ **Performance Optimized** - Preloads data on app initialization

## Implementation

### 1. Core Service (`src/services/dataService.js`)

The singleton service that manages data fetching and caching:

```javascript
import dataService from '@/services/dataService';

// Get all categories
const categories = await dataService.getCategories();

// Get all products (flattened)
const products = await dataService.getAllProducts();

// Get specific product
const product = await dataService.getProductById('1001');

// Search products
const results = await dataService.searchProducts('tire');

// Get products by category
const categoryProducts = await dataService.getProductsByCategory('Vehicle Parts and Accessories');

// Get products by subcategory
const subcategoryProducts = await dataService.getProductsBySubcategory('Vehicle Parts', 'Truck Tires');
```

### 2. Context Provider (`src/context/DataContext.jsx`)

React context that preloads data and provides it to all components:

```javascript
import { useData } from '@/context/DataContext';

function MyComponent() {
  const { categories, loading, error, dataService, refreshData } = useData();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <div>{/* Use categories */}</div>;
}
```

### 3. App Integration (`app/layout.js`)

The DataProvider wraps the entire app:

```javascript
<DataProvider>
  <CartProvider>
    {/* App content */}
  </CartProvider>
</DataProvider>
```

## Usage Examples

### Example 1: Get Product Details

**Before (Multiple Fetches):**
```javascript
useEffect(() => {
  fetch('/categories.json')
    .then(res => res.json())
    .then(data => {
      // Process data...
    });
}, [id]);
```

**After (Cached Service):**
```javascript
useEffect(() => {
  const loadProduct = async () => {
    const product = await dataService.getProductById(id);
    setProduct(product);
  };
  loadProduct();
}, [id]);
```

### Example 2: Search Products

**Before:**
```javascript
const response = await fetch('/categories.json');
const categories = await response.json();
const allProducts = categories.flatMap(/* complex logic */);
const results = allProducts.filter(/* search logic */);
```

**After:**
```javascript
const results = await dataService.searchProducts(query);
```

### Example 3: Get Category Products

**Before:**
```javascript
const response = await fetch('/categories.json');
const data = await response.json();
const category = data.find(cat => cat.name === categoryName);
const products = category.subcategories.flatMap(/* ... */);
```

**After:**
```javascript
const products = await dataService.getProductsByCategory(categoryName);
```

## API Reference

### Core Methods

#### `getCategories()`
Returns all categories with caching.

```javascript
const categories = await dataService.getCategories();
// Returns: Array<Category>
```

#### `getAllProducts()`
Returns flattened array of all products from all categories.

```javascript
const products = await dataService.getAllProducts();
// Returns: Array<Product> with categoryName, categoryIcon, subcategoryName
```

#### `getProductById(productId)`
Finds and returns a specific product by ID.

```javascript
const product = await dataService.getProductById('1001');
// Returns: Product | null
```

#### `searchProducts(query)`
Searches products by name, description, category, or attributes.

```javascript
const results = await dataService.searchProducts('michelin tire');
// Returns: Array<Product>
```

#### `getProductsByCategory(categoryName)`
Gets all products within a specific category.

```javascript
const products = await dataService.getProductsByCategory('Fish and Seafood');
// Returns: Array<Product>
```

#### `getProductsBySubcategory(categoryName, subcategoryName)`
Gets all products within a specific subcategory.

```javascript
const products = await dataService.getProductsBySubcategory('Vehicle Parts', 'Truck Tires');
// Returns: Array<Product>
```

#### `getCategoryByName(categoryName)`
Gets a specific category object.

```javascript
const category = await dataService.getCategoryByName('Metals and Minerals');
// Returns: Category | null
```

#### `clearCache()`
Manually clears the cache to force a fresh fetch.

```javascript
dataService.clearCache();
```

#### `preload()`
Preloads data (automatically called on app initialization).

```javascript
await dataService.preload();
```

## Performance Benefits

### Before (Multiple Fetches)
```
Page Load 1: Fetch categories.json (200ms)
Page Load 2: Fetch categories.json (200ms)
Page Load 3: Fetch categories.json (200ms)
Search: Fetch categories.json (200ms)
Product View: Fetch categories.json (200ms)

Total: 5 fetches = 1000ms
```

### After (Cached Service)
```
App Load: Fetch categories.json (200ms) ✓ CACHED
Page Load 1: Use cache (0ms)
Page Load 2: Use cache (0ms)
Page Load 3: Use cache (0ms)
Search: Use cache (0ms)
Product View: Use cache (0ms)

Total: 1 fetch = 200ms (80% faster!)
```

## Cache Management

- **Cache Duration**: 5 minutes
- **Auto-refresh**: Cache automatically refreshes after expiration
- **Manual Clear**: Use `dataService.clearCache()` to force refresh
- **Deduplication**: Multiple simultaneous requests share the same fetch

## Migration Checklist

✅ Created `src/services/dataService.js`
✅ Created `src/context/DataContext.jsx`
✅ Updated `app/layout.js` with DataProvider
✅ Updated `ProductDetails.jsx` to use dataService
✅ Updated `ProductCatalog.jsx` to use dataService
✅ Updated `SearchResults.jsx` to use dataService

## Files Updated

1. **New Files:**
   - `src/services/dataService.js`
   - `src/context/DataContext.jsx`

2. **Modified Files:**
   - `app/layout.js`
   - `src/components/DynamicProductCatalog/ProductDetails.jsx`
   - `src/components/DynamicProductCatalog/ProductCatalog.jsx`
   - `src/components/Search/SearchResults.jsx`

## Benefits Summary

✅ **80% Faster** - Eliminates redundant fetches
✅ **Better UX** - Instant data access after initial load
✅ **Cleaner Code** - Simple, consistent API
✅ **Less Bandwidth** - Reduces network requests
✅ **Scalable** - Easy to add new helper methods

## Troubleshooting

### Issue: Data not updating
**Solution:** Clear cache manually
```javascript
dataService.clearCache();
```

### Issue: Context not available
**Solution:** Ensure DataProvider wraps your component
```javascript
<DataProvider>
  <YourComponent />
</DataProvider>
```

### Issue: Need fresh data
**Solution:** Use refresh from context
```javascript
const { refreshData } = useData();
await refreshData();
```
