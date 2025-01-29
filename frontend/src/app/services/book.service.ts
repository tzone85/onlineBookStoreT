import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export interface PaginatedBooks {
  books: Book[];
  currentPage: number;
  totalPages: number;
  totalBooks: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:3000/api';
  private credentials = btoa('tzone85:ksaSeV6Yfm5lFNHf');

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Basic ${this.credentials}`,
      'Content-Type': 'application/json'
    });
  }

  getBooks(page: number = 1, limit: number = 10): Observable<PaginatedBooks> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedBooks>(`${this.apiUrl}/books`, {
      headers: this.getHeaders(),
      params
    });
  }

  createOrder(isbn: string, quantity: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, { isbn, quantity }, { headers: this.getHeaders() });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
  }
}
