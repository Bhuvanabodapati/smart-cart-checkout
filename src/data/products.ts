export interface Product {
  id: string;
  name: string;
  weight: number; // in grams
  price: number; // in INR
  category: string;
  icon: string;
  barcode: string;
}

export const products: Product[] = [
  // Original demo products
  { id: "P001", name: "Milk (1L)", weight: 1030, price: 60, category: "Dairy", icon: "🥛", barcode: "8901030865640" },
  { id: "P002", name: "Bread", weight: 400, price: 45, category: "Bakery", icon: "🍞", barcode: "8901063010123" },
  { id: "P003", name: "Rice (1kg)", weight: 1000, price: 85, category: "Grains", icon: "🍚", barcode: "8901725181234" },
  { id: "P004", name: "Eggs (12pc)", weight: 720, price: 96, category: "Dairy", icon: "🥚", barcode: "8904001234567" },
  { id: "P005", name: "Apple (1kg)", weight: 1000, price: 180, category: "Fruits", icon: "🍎", barcode: "8901234567890" },
  { id: "P006", name: "Banana (1dz)", weight: 1200, price: 50, category: "Fruits", icon: "🍌", barcode: "8902345678901" },
  { id: "P007", name: "Chips Pack", weight: 150, price: 30, category: "Snacks", icon: "🥔", barcode: "8903456789012" },
  { id: "P008", name: "Chocolate Bar", weight: 100, price: 50, category: "Snacks", icon: "🍫", barcode: "8904567890123" },
  { id: "P009", name: "Juice (1L)", weight: 1050, price: 120, category: "Beverages", icon: "🧃", barcode: "8905678901234" },
  { id: "P010", name: "Butter (500g)", weight: 500, price: 270, category: "Dairy", icon: "🧈", barcode: "8906789012345" },
  { id: "P011", name: "Cheese (200g)", weight: 200, price: 150, category: "Dairy", icon: "🧀", barcode: "8907890123456" },
  { id: "P012", name: "Tomatoes (1kg)", weight: 1000, price: 40, category: "Vegetables", icon: "🍅", barcode: "8908901234567" },
  { id: "P013", name: "Onions (1kg)", weight: 1000, price: 35, category: "Vegetables", icon: "🧅", barcode: "8909012345678" },
  { id: "P014", name: "Potatoes (1kg)", weight: 1000, price: 30, category: "Vegetables", icon: "🥔", barcode: "8900123456789" },
  { id: "P015", name: "Cookies Pack", weight: 250, price: 65, category: "Snacks", icon: "🍪", barcode: "8901234509876" },
  
  // Real product barcodes from user
  { id: "P016", name: "Grocery Item", weight: 300, price: 120, category: "Grocery", icon: "📦", barcode: "6203011060092" },
  { id: "P017", name: "Aashirvaad Product", weight: 500, price: 85, category: "Grocery", icon: "🌾", barcode: "8901725150129" },
  { id: "P018", name: "Aashirvaad Cloves (50g)", weight: 50, price: 45, category: "Spices", icon: "🌿", barcode: "8901725014834" },
  { id: "P019", name: "Beverage", weight: 350, price: 40, category: "Beverages", icon: "🥤", barcode: "8901058000269" },
  { id: "P020", name: "Cadbury Dairy Milk (180g)", weight: 180, price: 120, category: "Snacks", icon: "🍫", barcode: "7622201783297" },
  { id: "P021", name: "Snack Item", weight: 200, price: 55, category: "Snacks", icon: "🍿", barcode: "8904043901077" },
  { id: "P022", name: "Imported Product", weight: 400, price: 150, category: "Grocery", icon: "🛒", barcode: "6009510804782" },
  { id: "P023", name: "Grocery Pack", weight: 250, price: 75, category: "Grocery", icon: "📦", barcode: "8901764041259" },
  { id: "P024", name: "Coca-Cola (500ml)", weight: 550, price: 45, category: "Beverages", icon: "🥤", barcode: "5449000027559" },
];

// Find product by barcode
export function findProductByBarcode(barcode: string): Product | undefined {
  return products.find(p => p.barcode === barcode);
}

export interface CartItem extends Product {
  quantity: number;
}
