project:
  name: "🍽️ RestroPro - SaaS POS Software for Restaurant, Cafe, Hotel, Food Truck"
  badges:
    - label: "License"
      value: "commercial"
      color: "red"
    - label: "Built With"
      value: "React.js, Node.js"
      color: "red"
    - label: "Demo"
      value: "live"
      color: "blue"
  description: |
    RestroPro is a powerful SaaS-based POS (Point of Sale) solution built for:
      - Restaurants
      - Cafes
      - Hotels
      - Food trucks
      - Multi-branch franchises

    It supports order management, inventory tracking, table booking, real-time sales reporting, and more — all in one intuitive interface.

features:
  - 🔐 User and Role Management (Admin, Manager, Waiter, Cashier)
  - 🛒 Order Management (Dine-in, Takeaway, Delivery)
  - 🧾 POS System with Live Order Updates
  - 📦 Inventory & Ingredient Management
  - 🍴 Menu Builder with Categories and Variants
  - 💬 Customer & Feedback Module
  - 📊 Real-time Reports & Analytics
  - 🧾 Print/Export Receipts & Invoices
  - 🌐 Multi-language & Multi-currency Support
  - 🏪 Multi-restaurant SaaS with subscription plans
  - 💸 Integrated with Payment Gateways
  - 📱 Mobile Responsive (PWA compatible)

tech_stack:
  backend: "Node.js (Express)"
  frontend: "React.js, TailwindCSS"
  database: "MySQL"
  other: 
    - "Stripe"
    - "Razorpay"
    - "OneSignal"

installation:
  requirements:
    - "Node.js 18+"
    - "MySQL 5.7+"
    - "npm"
    - "Git"
  steps:
    - "git clone https://github.com/your-username/restropro-saas.git"
    - "cd restropro-saas"
    - "cd backend && npm install"
    - "cd ../frontend && npm install"
    - "Configure .env files in both folders"
    - "Run MySQL and create database"
    - "npm run dev (both frontend and backend)"
    - "Access the system at http://localhost:3000"

folders_structure:
  - frontend/: "React.js + Tailwind CSS"
  - backend/: "Express.js + API + Auth"
  - database/: "SQL dump or Prisma schema"
  - public/: "Assets and uploads"

license:
  type: "Commercial"
  note: "For commercial use only. Purchase required via CodeCanyon."

demo:
  url: "https://your-demo-link.com"
  credentials:
    email: "admin@example.com"
    password: "123456"
