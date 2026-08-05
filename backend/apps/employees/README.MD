# Test API
Create Employee
POST /api/employees/
Body (minimal):

{
  "employee_id": "EMP001",
  "organization": 1,
  "joining_date": "2025-01-01",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "gender": "MALE",
    "dob": "1990-01-01"
  }
}


Get Employees
GET /api/employees/

Create Member
POST /api/members/
Body:
{
  "member_no": "M001",
  "organization": 1,
  "joined_date": "2025-01-01",
  "first_name": "Jane",
  "last_name": "Smith",
  "gender": "FEMALE",
  "dob": "1992-05-10",
  "phone": "9876543210"
}