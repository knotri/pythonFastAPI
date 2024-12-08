from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

class Payment(BaseModel):
    id: str
    payee_first_name: str
    payee_last_name: str
    payee_payment_status: str
    payee_added_date_utc: int
    payee_due_date: int
    payee_address_line_1: str
    payee_address_line_2: Optional[str] = None
    payee_city: str
    payee_country: str
    payee_province_or_state: str
    payee_postal_code: int
    payee_phone_number: str
    payee_email: str
    currency: str
    discount_percent: float
    tax_percent: float
    due_amount: float

# Pydantic model for a list of payments
class PaymentList(BaseModel):
    payments: List[Payment]