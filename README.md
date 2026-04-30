# 🛒 Osaid Mart

A full-stack grocery e-commerce app with user authentication, persistent shopping cart, and real-time order tracking.

**Live Demo**: [Coming Soon]

## Features

- 🛍️ Browse 28 grocery products across 6 categories
- 🔍 Real-time search & category filters
- 🔐 User registration & JWT login
- 🛒 Persistent shopping cart (survives logout/login)
- ✅ Checkout with order confirmation
- 📊 Admin order tracking API
- 💰 Indian Rupee (₹) pricing
- 📸 Real product images

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: JWT + bcrypt
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Images**: Unsplash

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/osaid-mart.git
   cd osaid-mart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_secret_key
   PORT=3000
   ```

4. Seed the database:
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products |
| GET | `/api/cart` | ✅ | View cart |
| POST | `/api/cart` | ✅ | Add to cart |
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/admin/orders` | — | All orders (admin) |

## Deploy on Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables: `DATABASE_URL`, `JWT_SECRET`
7. Deploy!

---

Built by Osaid ❤️
