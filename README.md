# Sneaker Drop Backend

A real-time sneaker drop management system with inventory reservation, race condition prevention, and automatic expiration handling.

## 🚀 Features

- **Real-time Stock Updates** - WebSocket-based live inventory tracking
- **Atomic Reservations** - Transaction-based stock management to prevent overselling
- **Auto-expiration** - Background job that expires reservations and restores stock
- **Race Condition Prevention** - Row-level locking during stock operations
- **Layered Architecture** - Clean separation of concerns (Controller → Service → Repository)
- **Global Error Handling** - Centralized error management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Real-time**: Socket.IO
- **Environment**: dotenv

## 📐 Architecture

```
┌─────────────┐
│ Controllers │  → HTTP Request/Response handling
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │  → Business logic, transactions, WebSocket broadcasts
└──────┬──────┘
       │
┌──────▼────────┐
│ Repositories  │  → Database operations
└───────────────┘
```

### Project Structure

```
src/
├── config/               # Configuration files
│   ├── constants.js      # Application constants
│   └── db.js             # Database connection
├── controllers/          # HTTP route handlers
│   └── dropController.js
├── services/             # Business logic layer
│   └── dropService.js
├── repositories/         # Data access layer
│   ├── dropRepository.js
│   ├── reservationRepository.js
│   └── purchaseRepository.js
├── models/               # Sequelize models
│   ├── Drop.js
│   ├── Reservation.js
│   ├── Purchase.js
│   └── User.js
├── routes/               # Express routes
│   └── dropRoutes.js
├── middleware/           # Express middlewares
│   └── errorHandler.js
├── jobs/                 # Background jobs
│   └── expirationJob.js
├── seeds/                # Database seeding
│   └── seed.js
├── server.js             # Application entry point
└── socket.js             # WebSocket configuration
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sneaker-drop-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sneaker_drop
   DB_USER=postgres
   DB_PASSWORD=your_password
   NODE_ENV=development
   ```

4. **Create the database**

   ```sql
   CREATE DATABASE sneaker_drop;
   ```

5. **Run database migrations**

   ```bash
   npm run dev
   # Database will auto-sync on first run
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## 🚀 Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Seed Database

```bash
npm run seed
```

## 📡 API Endpoints

### Base URL

```
http://localhost:3000/api/drops
```

### Endpoints

#### 1. Create Drop

```http
POST /api/drops/create
Content-Type: application/json

{
  "name": "Air Jordan 1",
  "price": 180.00,
  "total_stock": 100,
  "start_time": "2026-02-20T10:00:00Z"
}
```

#### 2. Get All Drops

```http
GET /api/drops

Response:
[
  {
    "id": 1,
    "name": "Air Jordan 1",
    "price": 180.00,
    "total_stock": 100,
    "available_stock": 95,
    "start_time": "2026-02-20T10:00:00Z",
    "Purchases": [
      {
        "id": 1,
        "User": {
          "username": "john_doe"
        }
      }
    ]
  }
]
```

#### 3. Reserve Item

```http
POST /api/drops/reserve
Content-Type: application/json

{
  "dropId": 1,
  "userId": 1
}

Response:
{
  "id": 1,
  "UserId": 1,
  "DropId": 1,
  "expires_at": "2026-02-15T10:01:00Z",
  "status": "active"
}
```

#### 4. Complete Purchase

```http
POST /api/drops/purchase
Content-Type: application/json

{
  "reservationId": 1
}

Response:
{
  "message": "Purchase successful",
  "purchase": {
    "id": 1,
    "UserId": 1,
    "DropId": 1
  }
}
```

## 🔌 WebSocket Events

### Client → Server

```javascript
// Connect to server
const socket = io("http://localhost:3000");
```

### Server → Client

#### `stock_update`

Emitted when stock changes (reservation or expiration)

```javascript
socket.on("stock_update", (data) => {
  console.log(data);
  // {
  //   dropId: 1,
  //   available_stock: 95,
  //   reason: "reservation_expired" // optional
  // }
});
```

#### `purchase_complete`

Emitted when a purchase is completed

```javascript
socket.on("purchase_complete", (data) => {
  console.log(data);
  // {
  //   dropId: 1,
  //   userId: 1,
  //   purchaseId: 1
  // }
});
```

## ⚙️ Configuration

### Constants (`src/config/constants.js`)

```javascript
{
  DROPS_ROOM: "drops",                      // Socket.IO room name
  ALLOWED_ORIGINS: ["..."],                 // CORS origins
  RESERVATION_DURATION_MS: 60000,           // 1 minute
  EXPIRATION_CHECK_INTERVAL_MS: 5000,       // 5 seconds
  TOP_BUYERS_LIMIT: 3                       // Top buyers to show
}
```

## 🔐 How It Works

### Reservation Flow

1. **User requests reservation**
   - System locks the drop row (prevents race conditions)
   - Checks available stock
   - Decrements stock atomically
   - Creates reservation with 1-minute expiration
   - Broadcasts stock update via WebSocket

2. **User completes purchase**
   - Validates reservation is active and not expired
   - Marks reservation as completed
   - Creates purchase record
   - Broadcasts purchase completion

3. **Reservation expires**
   - Background job runs every 5 seconds
   - Finds all expired active reservations
   - Restores stock for each expired reservation
   - Marks reservations as expired
   - Broadcasts stock updates

### Race Condition Prevention

```javascript
// Row-level locking ensures atomic operations
const drop = await Drop.findOne({
  where: { id: dropId },
  lock: transaction.LOCK.UPDATE, // Locks row until transaction completes
  transaction,
});
```

## 🧪 Database Schema

### Drop

```sql
- id (Primary Key)
- name (String)
- price (Float)
- total_stock (Integer)
- available_stock (Integer)
- start_time (DateTime)
```

### Reservation

```sql
- id (Primary Key)
- UserId (Foreign Key → User)
- DropId (Foreign Key → Drop)
- expires_at (DateTime)
- status (Enum: 'active', 'expired', 'completed')
```

### Purchase

```sql
- id (Primary Key)
- UserId (Foreign Key → User)
- DropId (Foreign Key → Drop)
```

### User

```sql
- id (Primary Key)
- username (String)
```

## 🐛 Error Handling

All errors are handled globally through middleware:

```javascript
// Custom errors with status codes
const error = new Error("Out of stock");
error.statusCode = 400;
throw error;

// Response format
{
  "error": "Error message"
}
```

## 📝 Development Notes

- Reservations expire after 1 minute
- Background job checks for expired reservations every 5 seconds
- All stock operations use database transactions
- WebSocket broadcasts are non-blocking
- Row-level locking prevents overselling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Aminul Islam -
a.soton7@gmail.com

## 🙏 Acknowledgments

- Express.js for the web framework
- Sequelize for ORM
- Socket.IO for real-time communication
- PostgreSQL for robust database management
