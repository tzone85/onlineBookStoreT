import { Component, OnInit } from '@angular/core';
import { BookService, Order } from '../../services/book.service';

@Component({
  selector: 'app-order-list',
  template: `
    <div class="container mt-4">
      <h2>Order History</h2>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Order Date</th>
              <th>ISBN</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td>{{order.createdAt | date:'medium'}}</td>
              <td>{{order.isbn}}</td>
              <td>{{order.quantity}}</td>
              <td>${{order.totalPrice}}</td>
              <td><span class="badge" [ngClass]="getStatusClass(order.status)">{{order.status}}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 8px 12px;
      border-radius: 4px;
    }
    .badge-pending {
      background-color: #ffc107;
      color: #000;
    }
    .badge-completed {
      background-color: #28a745;
      color: #fff;
    }
    .badge-cancelled {
      background-color: #dc3545;
      color: #fff;
    }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.bookService.getOrders().subscribe({
      next: (orders) => this.orders = orders,
      error: (error) => console.error('Error loading orders:', error)
    });
  }

  getStatusClass(status: string): string {
    return `badge-${status.toLowerCase()}`;
  }
}
