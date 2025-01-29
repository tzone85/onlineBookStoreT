import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { BookService } from './services/book.service';

const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  { path: 'books', component: BookListComponent },
  { path: 'orders', component: OrderListComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    BookListComponent,
    OrderListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [BookService],
  bootstrap: [AppComponent]
})
export class AppModule { }
