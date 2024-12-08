from typing import List, Optional
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field, constr
from .database import database
from .models import Payment, PaymentList
from motor.motor_asyncio import AsyncIOMotorCollection
from fastapi_pagination import add_pagination, Page, paginate
from fastapi_pagination.ext.motor import paginate as motor_paginate

from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add pagination to the FastAPI app
add_pagination(app)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Get the payments collection
payments_collection: AsyncIOMotorCollection = database["payments"]




# Helper function to transform ObjectId
def transform_payment(payments: list) -> Payment:
    transformed_payments = []
    for idx, payment in enumerate(payments):
        try:
            transformed_payment = Payment(
                id=str(payment["_id"]),  # Convert ObjectId to string
                payee_first_name=payment["payee_first_name"],
                payee_last_name=payment["payee_last_name"],
                payee_payment_status=payment["payee_payment_status"],
                payee_added_date_utc=payment["payee_added_date_utc"],
                payee_due_date=payment["payee_due_date"],
                payee_address_line_1=payment["payee_address_line_1"],
                payee_address_line_2=payment.get("payee_address_line_2"),  # Use get() for optional fields
                payee_city=payment["payee_city"],
                payee_country=payment["payee_country"],
                payee_province_or_state=payment["payee_province_or_state"],
                payee_postal_code=payment["payee_postal_code"],
                payee_phone_number=payment["payee_phone_number"],
                payee_email=payment["payee_email"],
                currency=payment["currency"],
                discount_percent=payment["discount_percent"],
                tax_percent=payment["tax_percent"],
                due_amount=payment["due_amount"]
            )
            transformed_payments.append(transformed_payment)
        except Exception as e:
            print('something was wrong', e, payment)
            # raise KeyError(f"Missing key '{e.args[0]}' in payment at index {idx}: {payment}") from e
    return transformed_payments

@app.get("/payments", response_model=Page[Payment])
async def get_payments(
    payee_first_name: Optional[str] = None,
    payee_last_name: Optional[str] = None,
):
    query = {}
    if payee_first_name:
        query['payee_first_name'] = {"$regex": f"^{payee_first_name}", "$options": "i"}
    if payee_last_name:
        query['payee_last_name'] = {"$regex": f"^{payee_last_name}", "$options": "i"}

    result = await payments_collection.find(query).to_list(2000)
    
    return paginate(result, transformer=transform_payment)


    # if we need all data, use motor_paginate for performance.
    # return await motor_paginate(payments_collection, transformer=transform_payment)





@app.post("/payments/{payment_id}/file")
async def upload_file(payment_id: str, file: UploadFile = File(...)):
    try:
        # Convert the file content to binary data
        file_data = await file.read()
        
        # Update the payment document with the file data
        result = await payments_collection.update_one(
            {"_id": ObjectId(payment_id)},
            {
                "$set": {
                    "file": {
                        "filename": file.filename,
                        "content": file_data,
                        "content_type": file.content_type
                    }
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Payment not found or file not updated")

        return {"message": "File uploaded and saved successfully", "payment_id": payment_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Request payload schema
class PaymentRequest(BaseModel):
    currency: str = Field(..., pattern=r'^[A-Z]{3}$', description="3-letter currency code (e.g., USD)")
    discount_percent: float = Field(..., ge=0, le=100, description="Discount percentage between 0 and 100")
    due_amount: float = Field(..., gt=0, description="Amount due, must be greater than 0")
    payee_added_date_utc: int = Field(..., description="UTC timestamp in milliseconds")
    payee_address_line1: str
    payee_address_line2: Optional[str] = None
    payee_city: str
    payee_country: str
    payee_due_date: int  # ISO 8601 date string automatically parsed
    payee_email: str  # Validates email format
    payee_first_name: str = Field(..., min_length=1, max_length=50)
    payee_last_name: str = Field(..., min_length=1, max_length=50)
    payee_payment_status: str = Field(..., pattern=r'^(Paid|Unpaid|Pending)$', description="Payment status")
    payee_phone_number: str = Field(..., pattern=r'^\+\d{10,15}$', description="International phone number")
    payee_postal_code: Optional[str] = None
    payee_province_or_state: str
    tax_percent: float = Field(..., ge=0, le=100, description="Tax percentage between 0 and 100")
@app.post("/payments")
async def add_payment(
    payment: PaymentRequest
):
    # Ensure data integrity or business rules if needed
    if payment.due_amount <= 0:
        raise HTTPException(status_code=400, detail="Due amount must be greater than 0.")

    try:
        # Convert the payload to a dictionary for MongoDB
        payment_data = payment.dict()
        
        # Insert into MongoDB
        result = await payments_collection.insert_one(payment_data)
        
        # Return the inserted ID as confirmation
        return {"message": "Payment added successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")