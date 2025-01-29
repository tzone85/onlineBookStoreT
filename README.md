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
