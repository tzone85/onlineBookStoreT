# Online Book Store

A simple online book store application built with Angular, Node.js, and MongoDB.

## Features

- View available books
- Place book orders
- View order history
- Basic authentication
- RESTful API

## Tech Stack

- Frontend: Angular 16
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: Basic Auth
- Deployment: AWS Free Tier

## Project Structure

```
.
├── backend/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   └── services/
│       └── ...
└── README.md
```

## Setup Instructions

1. Backend Setup:
   ```bash
   cd backend
   npm install
   # Create .env file from .env.example
   npm start
   ```

2. Frontend Setup:
   ```bash
   cd frontend
   npm install
   ng serve
   ```

3. Access the application:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## API Endpoints

- GET /api/books - Get all books
- POST /api/orders - Create a new order
- GET /api/orders - Get all orders

## Authentication

The API uses Basic Authentication:
- Username: admin
- Password: admin123

## AWS Deployment

The application is deployed on AWS Free Tier using:
- EC2 instance for hosting
- MongoDB Atlas for database

## Development

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Run the development servers
