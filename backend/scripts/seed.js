require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

const sampleBooks = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", price: 14.99 },
  { title: "1984", author: "George Orwell", price: 12.99 },
  { title: "Pride and Prejudice", author: "Jane Austen", price: 9.99 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", price: 11.99 },
  { title: "Lord of the Flies", author: "William Golding", price: 10.99 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", price: 13.99 },
  { title: "Brave New World", author: "Aldous Huxley", price: 12.99 },
  { title: "Animal Farm", author: "George Orwell", price: 9.99 },
  { title: "The Alchemist", author: "Paulo Coelho", price: 11.99 },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", price: 16.99 },
  { title: "The Road", author: "Cormac McCarthy", price: 13.99 },
  { title: "The Kite Runner", author: "Khaled Hosseini", price: 14.99 },
  { title: "The Da Vinci Code", author: "Dan Brown", price: 12.99 },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", price: 15.99 }
];

const generateBooks = () => {
  const books = [];
  const genres = ['Fiction', 'Mystery', 'Science Fiction', 'Romance', 'Fantasy'];
  
  // Generate 100 books based on the sample books
  for (let i = 0; i < 100; i++) {
    const sampleBook = sampleBooks[i % sampleBooks.length];
    const genre = genres[i % genres.length];
    const volume = Math.floor(i / sampleBooks.length) + 1;
    
    books.push({
      isbn: `978-0-${String(i + 1).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${Math.floor(Math.random() * 10)}`,
      title: volume > 1 ? `${sampleBook.title} (Vol. ${volume})` : sampleBook.title,
      author: sampleBook.author,
      price: parseFloat((sampleBook.price + (Math.random() * 5)).toFixed(2)),
      stockQuantity: Math.floor(Math.random() * 50) + 10,
      genre: genre
    });
  }
  
  return books;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert new books
    const books = generateBooks();
    await Book.insertMany(books);
    console.log('Added sample books');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
