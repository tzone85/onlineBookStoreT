import { Component, OnInit } from '@angular/core';
import { BookService, Book } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  template: `
    <div class="container mt-4">
      <h2>Available Books</h2>
      <div class="row">
        <div class="col-md-4 mb-3" *ngFor="let book of books">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{book.title}}</h5>
              <h6 class="card-subtitle mb-2 text-muted">{{book.author}}</h6>
              <p class="card-text">
                ISBN: {{book.isbn}}<br>
                Price: ${{book.price}}<br>
                Stock: {{book.stockQuantity}}
              </p>
              <div class="form-group">
                <label for="quantity-{{book.isbn}}">Quantity:</label>
                <input type="number" class="form-control" id="quantity-{{book.isbn}}" 
                       [(ngModel)]="quantities[book.isbn]" min="1" [max]="book.stockQuantity">
              </div>
              <button class="btn btn-primary mt-2" 
                      (click)="orderBook(book.isbn)"
                      [disabled]="!quantities[book.isbn] || quantities[book.isbn] > book.stockQuantity">
                Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      height: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      transition: box-shadow 0.3s ease-in-out;
    }
  `]
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  quantities: { [key: string]: number } = {};

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        books.forEach(book => {
          this.quantities[book.isbn] = 1;
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
          this.loadBooks(); // Refresh book list to update stock
        },
        error: (error) => alert('Error placing order: ' + error.message)
      });
    }
  }
}
