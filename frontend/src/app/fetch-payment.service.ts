import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class FetchPaymentService {

  private apiUrl = 'http://localhost:8000/payments'; // Your API endpoint

  constructor(private http: HttpClient) {}

  getPayments(
    pageIndex: number,
    pageSize: number,
    payeeFirstName: string,
    payeeLastName: string,
    email: string,
  ): any {
    console.log('getPayments')
    const params = {
      page: (pageIndex + 1).toString(), // API usually expects 1-based page index
      size: pageSize.toString(),
      payee_first_name: payeeFirstName,
      payee_last_name: payeeLastName,
      email,
    };
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      delay(500), // Add a 2-second delay (2000 milliseconds)
    )
  }
}
