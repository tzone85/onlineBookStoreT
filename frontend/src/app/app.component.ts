import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#">Online Book Store</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/books" routerLinkActive="active">Books</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/orders" routerLinkActive="active">Orders</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar {
      margin-bottom: 20px;
    }
  `]
})
export class AppComponent {
  title = 'Online Book Store';
}
