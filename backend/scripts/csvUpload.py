import os
import pandas as pd
from pymongo import MongoClient
from datetime import datetime
import phonenumbers
import pycountry
from termcolor import colored

# Function to apply a validation rule and report number of rows dropped
def apply_validation_and_report(df, column_name, validation_func):
    initial_row_count = df.shape[0]
    
    # Apply the validation function to the column
    df[column_name] = df[column_name].apply(validation_func)
    
    # Drop rows with missing values after validation
    df.dropna(subset=[column_name], inplace=True)
    
    final_row_count = df.shape[0]
    rows_removed = initial_row_count - final_row_count

    message = f"Validation for '{column_name}': {rows_removed} rows removed. Final row count: {final_row_count}"
    
    # Print in yellow if rows were removed, otherwise print normally
    if rows_removed > 0:
        print(colored(message, 'yellow'))
    else:
        print(message)
    
    return df

# Load CSV
script_dir = os.path.dirname(os.path.abspath(__file__))  # Script's directory
file_path = os.path.join(script_dir, "payment_information.csv")
df = pd.read_csv(file_path, dtype={'payee_phone_number': str, 'payee_added_date_utc': int})

initial_row_count = df.shape[0]
print(f"Initial number of rows: {initial_row_count}")

# Drop if missing mandatory columns
df = apply_validation_and_report(df, 'payee_address_line_1', lambda x: x)
df = apply_validation_and_report(df, 'payee_city', lambda x: x)
df = apply_validation_and_report(df, 'payee_country', lambda x: x)
df = apply_validation_and_report(df, 'payee_postal_code', lambda x: x)
df = apply_validation_and_report(df, 'payee_phone_number', lambda x: x)
df = apply_validation_and_report(df, 'payee_email', lambda x: x)
df = apply_validation_and_report(df, 'currency', lambda x: x)
df = apply_validation_and_report(df, 'due_amount', lambda x: x)

# Validate phone numbers
def validate_phone(phone):
    try:
        parsed = phonenumbers.parse(phone, None)
        # is_valid_number more restricted.
        # but it removes to much data, I decide to switch to relaxed check here. 
        # if phonenumbers.is_valid_number(parsed): 
        if phonenumbers.is_possible_number(parsed):
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        else:
            print(f"Invalid phone number: {phone}")
            return None
    except phonenumbers.phonenumberutil.NumberParseException:
        print(f"Number parsing error for: {phone}")  # Debugging output for parsing errors
        return None

df = apply_validation_and_report(df, 'payee_phone_number', validate_phone)

# Validate dates
def validate_utc_date(date_value):
    if isinstance(date_value, (int)) and date_value >= 0:
        return date_value
    else:
        return None

def validate_due_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").timestamp()
    except ValueError:
        return None

df = apply_validation_and_report(df, 'payee_added_date_utc', validate_utc_date)
df = apply_validation_and_report(df, 'payee_due_date', validate_due_date)

# Validate country and currency
def validate_country(country_code):
    return country_code if pycountry.countries.get(alpha_2=country_code) else None

def validate_currency(currency_code):
    return currency_code if pycountry.currencies.get(alpha_3=currency_code) else None

df = apply_validation_and_report(df, 'payee_country', validate_country)
df = apply_validation_and_report(df, 'currency', validate_currency)

# Fill NaN values and round numeric columns
df['discount_percent'] = df['discount_percent'].fillna(0).round(2)
df['tax_percent'] = df['tax_percent'].fillna(0).round(2)
df['due_amount'] = df['due_amount'].round(2)

# Normalize text fields
text_fields = ['payee_first_name', 'payee_last_name', 'payee_payment_status', 
               'payee_address_line_1', 'payee_address_line_2', 
               'payee_city', 'payee_email']
for field in text_fields:
    df[field] = df[field].str.strip().str.lower()

# Convert to dictionary and upload to MongoDB
data_to_upload = df.to_dict('records')

client = MongoClient("mongodb://localhost:27017/")
db = client['payments_db']
collection = db['payments']
result = collection.insert_many(data_to_upload)

print(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")
