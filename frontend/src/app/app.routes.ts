import { Routes } from '@angular/router';
import { AddPaymentComponent } from './add-payment/add-payment.component';
import { EditPaymentComponent } from './edit-payment/edit-payment.component';
import { ListPaymentComponent } from './list-payment/list-payment.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: ListPaymentComponent },
  { path: 'add-payment', component: AddPaymentComponent },
  { path: 'edit-payment/:id', component: EditPaymentComponent },
];
