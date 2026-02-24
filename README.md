# E-Commerce Checkout Preview API

## Project Overview
Production-ready backend for an E-Commerce Checkout Preview API with JWT authentication and transactional checkout preview logic. It uses a clean architecture with controllers, services, repositories, and Prisma for PostgreSQL.

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Prisma
- JWT
- bcrypt
- Joi
- Winston

## Architecture
- controllers: HTTP request/response orchestration
- services: business logic and validation flow
- repositories: Prisma data access and transactions
- routes: route definitions
- middlewares: auth, validation, error handling, logging
- utils: shared helpers (errors, validation schemas, currency)
- config: environment and Prisma client

## Database Schema
- User: id, email (unique), password, country, createdAt
- Product: id, name, priceINR, stock, isActive, createdAt
- Coupon: id, code (unique), type (PERCENTAGE | FLAT), value, expiry, usageLimit, usedCount, createdAt
- Wallet: id, userId (unique), balance
- Relations: User has one Wallet, Wallet belongs to User

## How to Run
1. Install dependencies
```bash
npm install
```
2. Configure environment
```bash
cp .env.example .env
```
3. Run migrations and generate Prisma client
```bash
npm run prisma:migrate
npm run prisma:generate
```
4. Seed data
```bash
npm run prisma:seed
```
5. Start the server
```bash
npm run dev
```

## How to Test the API
1. Login and get a token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"indian.user@example.in","password":"password-india"}'
```
2. Call the checkout preview endpoint
```bash
curl -X POST http://localhost:3000/api/v1/checkout/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"cartItems":[{"productId":1,"quantity":2}],"couponCode":"WELCOME10","walletAmountToUse":200}'
```

## Sample Request/Response
Request:
```json
{
  "cartItems": [
    { "productId": 1, "quantity": 2 }
  ],
  "couponCode": "WELCOME10",
  "walletAmountToUse": 200
}
```
Response:
```json
{
  "subtotal": 3000,
  "discount": 300,
  "walletDeduction": 200,
  "finalPayable": 2500,
  "currency": "INR"
}
```

## Concurrency Handling
The checkout preview uses a single Prisma transaction to ensure all reads and calculations are consistent. Without a transaction, multiple concurrent requests could read different states of product stock or coupon usage and produce inconsistent previews.

In a real order placement API, the stock decrement would happen inside the same transaction as the stock validation and order creation, using a conditional update (or row-level locking) to ensure the stock cannot drop below zero when multiple orders are processed simultaneously.

## Index Strategy
- coupon.code: used for fast coupon lookups during checkout preview
- wallet.userId: ensures one wallet per user and fast wallet retrieval
- product.isActive: used to quickly filter active products for checkout
