export const MOCK_RESTAURANT = {
  id: "menu-demo",
  name: "Bukka Express",
  tagline: "Authentic Nigerian delicacies, cooked fresh and hot daily!",
  logoUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=150&auto=format&fit=crop&q=80",
  whatsappNumber: "2348031234567",
  categories: [
    { id: "cat-rice", name: "Rice Dishes 🍚" },
    { id: "cat-swallows", name: "Soups & Swallows 🍲" },
    { id: "cat-sides", name: "Sides & Drinks 🍹" }
  ],
  items: [
    {
      id: "item-jollof",
      categoryId: "cat-rice",
      name: "Smoky Party Jollof Rice",
      priceNaira: 3500,
      description: "Rich party-style smoky Jollof rice served with sweet dodo (fried plantain) and grilled chicken leg.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80",
      available: true,
      tag: "Best Seller"
    },
    {
      id: "item-friedrice",
      categoryId: "cat-rice",
      name: "Special Fried Rice",
      priceNaira: 3800,
      description: "Savory fried rice loaded with veggies, liver bits, and served with peppered fish.",
      imageUrl: "https://images.unsplash.com/photo-1603133872878-685f5888c3c1?w=400&auto=format&fit=crop&q=80",
      available: true,
      tag: "New"
    },
    {
      id: "item-egusi",
      categoryId: "cat-swallows",
      name: "Efo Riro & Semo",
      priceNaira: 4200,
      description: "Rich Yoruba vegetable soup cooked with palm oil, iru, shaki, and kpomo, served with fluffy Semolina.",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",
      available: true,
      tag: ""
    },
    {
      id: "item-pounded-yam",
      categoryId: "cat-swallows",
      name: "Pounded Yam with Egusi",
      priceNaira: 4500,
      description: "Smooth, stretchy pounded yam paired with delicious melon seed soup cooked with spinach, stockfish, and assorted meat.",
      imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&auto=format&fit=crop&q=80",
      available: true,
      tag: "Popular"
    },
    {
      id: "item-zobo",
      categoryId: "cat-sides",
      name: "Chilled Zobo Drink",
      priceNaira: 1000,
      description: "Sweet hibiscus leaf extract infused with ginger, fresh cloves, and pineapple juice.",
      imageUrl: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&auto=format&fit=crop&q=80",
      available: true,
      tag: "Refreshing"
    },
    {
      id: "item-puffpuff",
      categoryId: "cat-sides",
      name: "Spicy Peppered Puff Puff (4pcs)",
      priceNaira: 1200,
      description: "Golden brown, spongy yeast dough balls with a hint of scotch bonnet pepper.",
      imageUrl: "https://images.unsplash.com/photo-1532980400857-e8d9d275d858?w=400&auto=format&fit=crop&q=80",
      available: true,
      tag: ""
    }
  ]
}

export function getMockOrders(menuId = "menu-demo") {
  return [
    {
      id: "order-demo-1",
      menuId: menuId,
      items: [
        { name: "Smoky Party Jollof Rice", qty: 2, priceNaira: 3500 },
        { name: "Chilled Zobo Drink", qty: 2, priceNaira: 1000 }
      ],
      total: 9000,
      customer_note: "Please make the jollof very smoky! Table 3.",
      status: "pending",
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: "order-demo-2",
      menuId: menuId,
      items: [
        { name: "Pounded Yam with Egusi Soup", qty: 1, priceNaira: 4500 },
        { name: "Spicy Peppered Puff Puff (4pcs)", qty: 1, priceNaira: 1200 }
      ],
      total: 5700,
      customer_note: "Extra shaki in the egusi please. Table 7.",
      status: "pending",
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "order-demo-3",
      menuId: menuId,
      items: [
        { name: "Efo Riro & Semo", qty: 1, priceNaira: 4200 },
        { name: "Chilled Zobo Drink", qty: 1, priceNaira: 1000 }
      ],
      total: 5200,
      customer_note: "Table 1.",
      status: "fulfilled",
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ]
}

export function seedMockData() {
  try {
    localStorage.setItem("qr-menu:restaurant", JSON.stringify(MOCK_RESTAURANT))
    localStorage.setItem("qr-menu:orders", JSON.stringify(getMockOrders(MOCK_RESTAURANT.id)))
    localStorage.setItem("qr-menu:simulated_login", "true")
    localStorage.removeItem("qr-menu:setup_wizard_step")
  } catch (e) {
    console.error("Failed to seed mock data:", e)
  }
}

export function clearMockData() {
  try {
    localStorage.removeItem("qr-menu:restaurant")
    localStorage.removeItem("qr-menu:orders")
    localStorage.removeItem("qr-menu:simulated_login")
    localStorage.removeItem("qr-menu:setup_wizard_step")
  } catch (e) {
    console.error("Failed to clear mock data:", e)
  }
}
