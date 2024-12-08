import { TestBed } from '@angular/core/testing';

import { FetchPaymentService } from './fetch-payment.service';

describe('FetchPaymentService', () => {
  let service: FetchPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
