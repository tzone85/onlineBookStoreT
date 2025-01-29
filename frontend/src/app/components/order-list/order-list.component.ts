import { Component, OnInit } from '@angular/core';
import { BookService, Order } from '../../services/book.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
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
