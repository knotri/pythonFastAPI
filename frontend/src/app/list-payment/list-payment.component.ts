import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';
import { FetchPaymentService } from '../fetch-payment.service';
import { PageEvent } from '@angular/material/paginator';
import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// interface Payment {
//   id: number;
//   name: string;
//   amount: number;
//   date: Date;
// }

type Paginated<ListItem> = {
  page: number
  pages: number
  size: number
  total: number
  items: ListItem[]
}

export type Payment = {
  id: string;
  payeeFirstName: string;
  payeeLastName: string;
  payeePaymentStatus: string;
  payeeAddedDateUtc: Date;
  payeeDueDate: Date;
  payeeAddressLine1: string;
  payeeAddressLine2?: string; // Optional
  payeeCity: string;
  payeeCountry: string;
  payeeProvinceOrState: string;
  payeePostalCode: string;
  payeePhoneNumber: string;
  payeeEmail: string;
  currency: string;
  discountPercent: number;
  taxPercent: number;
  dueAmount: number;
}
type PaginatedPayment = Paginated<Payment>



@Component({
  selector: 'app-list-payment',
  imports: [
    MatTableModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatInputModule,
    FormsModule,
    MatCardModule, MatPaginatorModule, AsyncPipe, CommonModule, MatProgressSpinnerModule],
  templateUrl: './list-payment.component.html',
  styleUrl: './list-payment.component.scss'
})
export class ListPaymentComponent implements OnInit {
  displayedColumns: string[] = [
    // 'id',
    'payee_first_name',
    'payee_last_name',
    'payee_payment_status',
    'payee_added_date_utc',
    'payee_due_date',
    'payee_address_line_1',
    // 'payee_address_line_2',
    'payee_city',
    'payee_country',
    'actions',
    // 'payee_province_or_state',
    // 'payee_postal_code',
    // 'payee_phone_number',
    // 'payee_email',
    // 'currency',
    // 'discount_percent',
    // 'tax_percent',
    // 'due_amount'
  ];


  payments$!: Observable<PaginatedPayment>; // Observables are used for reactive data handling
  totalItems: number = 0;

  constructor(
    private fb: FormBuilder,
    private paymentService: FetchPaymentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.filterForm = this.fb.group({
      payeeFirstName: [''],
      payeeLastName: [''],
      email: [''],
    });
  }

  filterForm: FormGroup;
  pageIndex = 1

  resetPaginatorAndLoad(): void {
    this.pageIndex = 0
    this.loadPayments();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Avoid request in ssr
      this.loadPayments({ pageIndex: 0, pageSize: 5, length: 10 });
    }

    this.filterForm.valueChanges
      .pipe(debounceTime(450))
      .subscribe(() => this.resetPaginatorAndLoad());
  }

  loadPayments(event?: PageEvent): void {
    this.pageIndex = event?.pageIndex ?? 0
    this.payments$ = this.paymentService.getPayments(
      this.pageIndex,
      5,
      this.filterForm.value.payeeFirstName,
      this.filterForm.value.payeeLastName,
      this.filterForm.value.email,
    );
  }
}

