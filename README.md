# Sneaker Drop Backend

Real-time sneaker drop management system with atomic inventory reservations and automatic expiration handling.

## Features

- Real-time stock updates via WebSocket
- Transaction-based atomic reservations
- Automatic reservation expiration (60s)
- Race condition prevention with row-level locking
- Layered architecture (Controller → Service → Repository)

## Tech Stack

- **Node.js** + **Express.js**
- **PostgreSQL** + **Sequelize ORM**
- **Socket.IO** for real-time updates

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create `.env` file:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sneaker_drop
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. **Setup database**

   ```bash
   createdb sneaker_drop
   npm run seed
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

## API Endpoints

**Base URL:** `http://localhost:3000/api/drops`

### Create Drop

```http
POST /api/drops/create
{
  "name": "Air Jordan 1",
  "price": 180.00,
  "total_stock": 100,
  "start_time": "2026-02-20T10:00:00Z"
}
```

### Get All Drops

```http
GET /api/drops
```

### Reserve Item

```http
POST /api/drops/reserve
{
  "dropId": 1,
  "userId": 1
}
```

### Complete Purchase

```http
POST /api/drops/purchase
{
  "reservationId": 1
}
```

## WebSocket Events

```javascript
const socket = io("http://localhost:3000");

// Stock updated
socket.on("stock_update", (data) => {
  // { dropId, available_stock, reason }
});

// Purchase completed
socket.on("purchase_complete", (data) => {
  // { dropId, userId, purchaseId }
});
```

## How It Works

1. **Reserve** - User reserves item, stock is decremented atomically with row-level locking
2. **Purchase** - User completes purchase within 60 seconds or reservation expires
3. **Expire** - Background job auto-expires reservations and restores stock every 5 seconds

## Database Schema

- **Drop**: `id`, `name`, `price`, `total_stock`, `available_stock`, `start_time`, `image_url`
- **Reservation**: `id`, `UserId`, `DropId`, `expires_at`, `status`
- **Purchase**: `id`, `UserId`, `DropId`
- **User**: `id`, `username`

## License

ISC

## Author

Aminul Islam - a.soton7@gmail.com
