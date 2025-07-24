# 🍽️ RestroPro - SaaS POS Software for Restaurant, Cafe, Hotel, Food Truck

[![License](https://img.shields.io/badge/license-commercial-red.svg)]()
[![Built With](https://img.shields.io/badge/built%20with-Laravel-red)](https://laravel.com)
[![Demo](https://img.shields.io/badge/demo-live-blue)](#demo)

## 📦 Description

**RestroPro** is a powerful SaaS-based POS (Point of Sale) solution built for:
- Restaurants
- Cafes
- Hotels
- Food trucks
- Multi-branch franchises

It supports order management, inventory tracking, table booking, real-time sales reporting, and more — all in one intuitive interface.


---

## 🚀 Features

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

---

## ⚙️ Tech Stack

- **Backend:** Laravel 10+
- **Frontend:** Blade, Livewire
- **Database:** MySQL
- **Others:** Stripe, Razorpay, OneSignal, etc.

---

## 📂 Installation



---

## 📂 Installation Guide

### 🧾 Prerequisites

- Node.js v18+
- MySQL 5.7+
- Git
- npm or yarn

---

### 🛠️ Backend Setup (`/backend`)

```bash
git clone https://github.com/your-username/restropro.git
cd restropro/backend

npm install
cp .env.example .env
# Set DB credentials and secrets in .env

# Create MySQL database manually or use migration script if available
npm run migrate
npm run seed    # optional: populate with sample data

npm start       # or: npm run dev
an storage:link
