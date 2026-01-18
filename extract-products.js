import fs from 'fs';

// Read categories.json
const data = JSON.parse(fs.readFileSync('public/categories.json', 'utf8'));

const result = {};

data.forEach(category => {
  result[category.name] = {};
  
  category.subcategories.forEach(subcategory => {
    const products = [];
    
    if (category.name === 'Vehicle Parts and Accessories' && subcategory.name === 'Truck Tires') {
      // For Truck Tires, get 10 products from different brands
      const brandMap = new Map();
      
      subcategory.products.forEach(product => {
        const brand = product.keyAttributes?.Brand || 'Unknown';
        if (!brandMap.has(brand)) {
          brandMap.set(brand, []);
        }
        brandMap.get(brand).push(product);
      });
      
      // Get products from different brands
      const brands = Array.from(brandMap.keys());
      let count = 0;
      let brandIndex = 0;
      
      while (count < 10 && count < subcategory.products.length) {
        const brand = brands[brandIndex % brands.length];
        const brandProducts = brandMap.get(brand);
        
        if (brandProducts && brandProducts.length > 0) {
          const product = brandProducts.shift();
          products.push({
            id: product.id,
            name: product.name,
            price: product.price,
            offerPrice: product.offerPrice,
            image: product.image,
            rating: product.userReviews && product.userReviews.length > 0 
              ? (product.userReviews.reduce((sum, r) => sum + r.rating, 0) / product.userReviews.length).toFixed(1)
              : null,
            brand: product.keyAttributes?.Brand
          });
          count++;
        }
        
        brandIndex++;
        
        // Safety check to avoid infinite loop
        if (brandIndex > brands.length * 100) break;
      }
    } else {
      // For other subcategories, get top 3 products based on ratings
      const sortedProducts = subcategory.products
        .map(product => {
          const avgRating = product.userReviews && product.userReviews.length > 0
            ? product.userReviews.reduce((sum, r) => sum + r.rating, 0) / product.userReviews.length
            : 0;
          
          return {
            ...product,
            avgRating
          };
        })
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 3);
      
      sortedProducts.forEach(product => {
        products.push({
          id: product.id,
          name: product.name,
          price: product.price,
          offerPrice: product.offerPrice,
          image: product.image,
          rating: product.avgRating > 0 ? product.avgRating.toFixed(1) : null,
          brand: product.keyAttributes?.Brand
        });
      });
    }
    
    result[category.name][subcategory.name] = products;
  });
});

// Save to popup.json
fs.writeFileSync('public/popup.json', JSON.stringify(result, null, 2));

console.log('Extraction complete! Results saved to popup.json');
console.log('\nSummary:');
Object.keys(result).forEach(category => {
  console.log(`\n${category}:`);
  Object.keys(result[category]).forEach(subcategory => {
    console.log(`  - ${subcategory}: ${result[category][subcategory].length} products`);
  });
});
