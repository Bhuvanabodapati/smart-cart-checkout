export interface Product {
  id: string;
  name: string;
  weight: number; // in grams
  price: number; // in INR
  category: string;
  icon: string;
}

export const products: Product[] = [
  { id: "P001", name: "Milk (1L)", weight: 1030, price: 60, category: "Dairy", icon: "🥛" },
  { id: "P002", name: "Bread", weight: 400, price: 45, category: "Bakery", icon: "🍞" },
  { id: "P003", name: "Rice (1kg)", weight: 1000, price: 85, category: "Grains", icon: "🍚" },
  { id: "P004", name: "Eggs (12pc)", weight: 720, price: 96, category: "Dairy", icon: "🥚" },
  { id: "P005", name: "Apple (1kg)", weight: 1000, price: 180, category: "Fruits", icon: "🍎" },
  { id: "P006", name: "Banana (1dz)", weight: 1200, price: 50, category: "Fruits", icon: "🍌" },
  { id: "P007", name: "Chips Pack", weight: 150, price: 30, category: "Snacks", icon: "🥔" },
  { id: "P008", name: "Chocolate Bar", weight: 100, price: 50, category: "Snacks", icon: "🍫" },
  { id: "P009", name: "Juice (1L)", weight: 1050, price: 120, category: "Beverages", icon: "🧃" },
  { id: "P010", name: "Butter (500g)", weight: 500, price: 270, category: "Dairy", icon: "🧈" },
  { id: "P011", name: "Cheese (200g)", weight: 200, price: 150, category: "Dairy", icon: "🧀" },
  { id: "P012", name: "Tomatoes (1kg)", weight: 1000, price: 40, category: "Vegetables", icon: "🍅" },
  { id: "P013", name: "Onions (1kg)", weight: 1000, price: 35, category: "Vegetables", icon: "🧅" },
  { id: "P014", name: "Potatoes (1kg)", weight: 1000, price: 30, category: "Vegetables", icon: "🥔" },
  { id: "P015", name: "Cookies Pack", weight: 250, price: 65, category: "Snacks", icon: "🍪" },
];

export interface CartItem extends Product {
  quantity: number;
}
