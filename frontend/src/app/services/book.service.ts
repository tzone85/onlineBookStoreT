import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  isbn: string;
  title: string;
  author: string;
  price: number;
  stockQuantity: number;
}

export interface Order {
  isbn: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:3000/api';
  private auth = btoa('admin:admin123'); // Basic auth credentials

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json'
    });
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`, { headers: this.getHeaders() });
  }

  createOrder(isbn: string, quantity: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, { isbn, quantity }, { headers: this.getHeaders() });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
  }
}
