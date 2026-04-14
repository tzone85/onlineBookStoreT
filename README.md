# Online Book Store

A full-stack web application for managing an online book store, built with Angular (frontend) and Node.js/Express (backend) with MongoDB Atlas as the database.

## Features

- Browse books with pagination (10 books per page)
- View book details (title, author, ISBN, price, stock)
- Place orders for books
- Admin authentication for API access
- RESTful API architecture
- Modern, responsive UI with Bootstrap

## Tech Stack

### Frontend
- Angular 16+
- Bootstrap 5
- TypeScript
- RxJS for state management

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM
- JWT for authentication
- Basic Auth for API protection

## Getting Started

### Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tzone85/onlineBookStoreT.git
cd onlineBookStoreT
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with your configuration:
```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend server:
```bash
cd backend
node server.js
```

2. Start the frontend development server:
```bash
cd frontend
ng serve --port 4204
```

3. Access the application at `http://localhost:4204`

### Approval Mode Configuration

The application supports different approval modes for order processing via the `--approval-mode` command-line argument:

#### Syntax
```bash
node backend/server.js --approval-mode <mode>
```

#### Available Modes

| Mode | Description | Order Behavior | Stock Updates | Use Case |
|------|-------------|----------------|---------------|----------|
| `auto` | Automatic approval (default) | Orders completed immediately | Stock updated on creation | Development, low-risk environments |
| `manual` | Manual approval required | Orders stay pending | Stock updated on approval | Standard production environments |
| `strict` | Strict manual approval | Orders require admin approval | Stock updated only after admin approval | High-security environments |

#### Examples

**Development (Auto Mode - Default)**:
```bash
node backend/server.js
# or explicitly
node backend/server.js --approval-mode auto
```

**Production (Manual Mode)**:
```bash
node backend/server.js --approval-mode manual
```

**High Security (Strict Mode)**:
```bash
node backend/server.js --approval-mode strict
```

#### Default Behavior
- **Default Mode**: `auto` when `--approval-mode` is not specified
- **Error Handling**: Application exits with error code 1 for invalid modes
- **Production Warning**: Using `auto` mode in production environments triggers security warnings

#### Order Management with Approval Modes

**Auto Mode**: Orders are immediately completed and stock is reduced
**Manual/Strict Modes**: Orders created as pending, use these endpoints:

- **Approve Order**: `PUT /api/orders/:id/approve`
- **Reject Order**: `PUT /api/orders/:id/reject`

Example approval:
```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID/approve \
  -H "Authorization: Basic <admin_credentials>"
```

### Seeding Sample Data

To populate the database with sample books:
```bash
cd backend/scripts
node seed.js
```

This will create 100 sample books in the database.

## API Endpoints

- `GET /api/books?page=1&limit=10` - Get paginated list of books
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get list of orders

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
