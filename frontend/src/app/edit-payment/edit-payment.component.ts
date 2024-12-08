import { Component } from '@angular/core';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';

@Component({
  selector: 'app-edit-payment',
  imports: [PaymentDetailsComponent],
  templateUrl: './edit-payment.component.html',
  styleUrl: './edit-payment.component.scss'
})
export class EditPaymentComponent {

}
