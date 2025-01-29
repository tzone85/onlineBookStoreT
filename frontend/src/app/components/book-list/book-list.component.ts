import { Component, OnInit } from '@angular/core';
import { BookService, Book } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styles: [`
    .card {
      height: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      transition: box-shadow 0.3s ease-in-out;
    }
    .pagination {
      margin-top: 20px;
      justify-content: center;
    }
    .page-link {
      cursor: pointer;
    }
  `]
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  quantities: { [key: string]: number } = {};
  currentPage = 1;
  totalPages = 1;
  totalBooks = 0;
  itemsPerPage = 10;
  Math = Math; // Make Math available in template

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.books = response.books;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalBooks = response.totalBooks;
        
        this.books.forEach(book => {
          if (!this.quantities[book.isbn]) {
            this.quantities[book.isbn] = 1;
          }
        });
      },
      error: (error) => console.error('Error loading books:', error)
    });
  }

  orderBook(isbn: string): void {
    const quantity = this.quantities[isbn];
    if (quantity > 0) {
      this.bookService.createOrder(isbn, quantity).subscribe({
        next: (order) => {
          alert('Order placed successfully!');
          this.loadBooks();
        },
        error: (error) => alert('Error placing order: ' + error.message)
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBooks();
    }
  }

  get pages(): number[] {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
