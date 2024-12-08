import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment } from '../list-payment/list-payment.component';

import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';


const compare = (longStr: string, search: string) => {
  return longStr.toLocaleLowerCase().includes(search.toLocaleLowerCase())
}

const convertCamelToSnake = (str: string) => {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
}

@Component({
  selector: 'app-payment-details',
  imports: [
    CommonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.scss'
})
export class PaymentDetailsComponent implements OnInit {
  paymentForm!: FormGroup;
  paymentId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  filteredAddresses: string[] = ['123 Main St', '456 Elm St', '789 Oak St', '101 Pine St'];
  private filterAddresses(value: string): string[] {
    const allAddresses = ['123 Main St', '456 Elm St', '789 Oak St', '101 Pine St'];
    return allAddresses
    return allAddresses.filter(address => address.toLowerCase().includes(value.toLowerCase()));
  }
  displayAddress(address: string): string {
    return address || '';
  }
  onAddressInput(): void {
    const value = this.paymentForm.get('payeeAddressLine1')?.value || '';
    this.filteredAddresses = this.filterAddresses(value);
  }

  selectValues = {
    countries: [] as string[],
    states: [] as string[],
    currencies: [] as string[],
  }

  onAutocompliteInput() {

    this.selectValues.countries = this.allCountries.filter(country => {
      return compare(country, this.paymentForm.get('payeeCountry')?.value ?? '')
    })

    this.selectValues.currencies = this.allCurrency.filter(curr => {
      return compare(curr, this.paymentForm.get('currency')?.value ?? '')
    })

    if (this.paymentForm.get('payeeCountry')?.value) {

      const states = this.allStates.find(country => {
        return compare(country.name, this.paymentForm.get('payeeCountry')?.value ?? '')
      })?.states ?? []

      this.selectValues.states = states.map((state: any) => state.name)
    } else {
      this.selectValues.states = []
    }



    // .filter(country => {
    //   return compare(country, this.paymentForm.get('payeeCountry')?.value ?? '')
    // })
  }

  allCountries: any[] = []
  allStates: any[] = []
  allCurrency: any[] = []
  private fetchSuggesting(): void {
    this.http
      .get<{ data: { currency: string, name: string }[] }>('https://countriesnow.space/api/v0.1/countries/currency')
      // .pipe(map((response) => response.data.map((country: any) => country.name)))
      .subscribe((countries) => {
        this.allCurrency = [...(new Set(countries.data.map(c => c.currency)))];
        this.allCountries = countries.data.map(c => c.name)
      });

    this.http
      .get<any>('https://countriesnow.space/api/v0.1/countries/states')
      .subscribe((res) => (this.allStates = res.data));
  }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id')!;

    this.fetchSuggesting()

    // Initialize the form with fields and validators
    this.paymentForm = this.fb.group({
      payeeFirstName: ['', [Validators.required, Validators.maxLength(50)]],
      payeeLastName: ['', [Validators.required, Validators.maxLength(50)]],
      payeePaymentStatus: ['', [Validators.required]],
      payeeAddedDateUtc: ['', [Validators.required]],
      payeeDueDate: ['', [Validators.required]],
      payeeAddressLine1: ['', [Validators.required, Validators.maxLength(100)]],
      payeeAddressLine2: ['', [Validators.maxLength(100)]],
      payeeCity: ['', [Validators.required, Validators.maxLength(50)]],
      payeeCountry: ['', [Validators.required]],
      payeeProvinceOrState: ['', [Validators.required]],
      payeePostalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      payeePhoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      payeeEmail: ['', [Validators.required, Validators.email]],
      currency: ['', [Validators.required]],
      discountPercent: ['', [Validators.min(0), Validators.max(100)]],
      taxPercent: ['', [Validators.min(0), Validators.max(100)]],
      dueAmount: ['', [Validators.required, Validators.min(0)]],
    });

    this.loadPaymentDetails();
  }

  loadPaymentDetails(): void {
    // Simulate fetching data; replace this with actual API call
    const mockPayment: Payment = {
      id: this.paymentId,
      payeeFirstName: 'John',
      payeeLastName: 'Doe',
      payeePaymentStatus: 'Paid',
      payeeAddedDateUtc: new Date(),
      payeeDueDate: new Date(),
      payeeAddressLine1: '123 Main Street',
      payeeAddressLine2: '',
      payeeCity: 'Seattle',
      payeeCountry: 'USA',
      payeeProvinceOrState: 'WA',
      payeePostalCode: '98101',
      payeePhoneNumber: '+12065550123',
      payeeEmail: 'john.doe@example.com',
      currency: 'USD',
      discountPercent: 10,
      taxPercent: 5,
      dueAmount: 1000,
    };

    this.paymentForm.patchValue(mockPayment);
  }

  private apiUrl = 'http://3.147.120.126:8000'; // Your API endpoint
  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formData = this.paymentForm.value;

      const snakeCaseData: any = {};
      Object.keys(formData).forEach((key) => {
        const snakeKey = convertCamelToSnake(key);
        snakeCaseData[snakeKey] = formData[key];
        // snakeCaseData.append(snakeKey, formData[key])

        // return acc;
      });

      snakeCaseData.payee_due_date = Math.floor((formData.payeeDueDate.getTime() ?? 1000) / 1000);
      snakeCaseData.payee_added_date_utc = Math.floor((formData.payeeAddedDateUtc.getTime() ?? 1000) / 1000);

      // if (this.selectedFile) {
      //   snakeCaseData.append('file', this.selectedFile, this.selectedFile.name);
      // }


      console.log('Form data:', formData);

      // Replace 'your-api-endpoint' with the actual API endpoint
      this.http.post(this.apiUrl + '/payments', snakeCaseData).subscribe({
        next: (response: any) => {
          console.log('API response:', response);

          const paymentId = response.id;
          if (this.selectedFile) {
            // Step 2: Send the second request to upload the file with the `id`
            const fileFormData = new FormData();
            fileFormData.append('file', this.selectedFile, this.selectedFile.name);

            this.http.post(`${this.apiUrl}/payments/${paymentId}/file`, fileFormData).subscribe({
              next: (fileResponse) => {
                console.log('File upload response:', fileResponse);
                alert('File uploaded successfully!');
              },
              error: (fileError) => {
                console.error('File upload error:', fileError);
                alert('Failed to upload the file.');
              },
            });
          }
          alert('Payment details saved successfully!');
        },
        error: (error) => {
          console.error('API error:', error);
          alert('Failed to save payment details.');
        },
      });
    } else {
      console.warn('Form is invalid!', this.paymentForm.errors);
    }
  }

  onCancel() {
    this.router.navigate(['/']); // Redirect to payments list
  }

  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }
}
