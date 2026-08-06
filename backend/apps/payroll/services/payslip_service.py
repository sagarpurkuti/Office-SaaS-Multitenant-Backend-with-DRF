from io import BytesIO
import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm

class PayslipService:
    @staticmethod
    def generate_payslip_pdf(payroll):
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Header
        c.setFont('Helvetica-Bold', 16)
        c.drawString(30*mm, height-20*mm, f"Payslip for {payroll.employee.organization.name}")
        c.setFont('Helvetica', 12)
        c.drawString(30*mm, height-30*mm, f"Employee: {payroll.employee.user.full_name}")
        c.drawString(30*mm, height-35*mm, f"Employee ID: {payroll.employee.employee_id}")
        c.drawString(30*mm, height-40*mm, f"Month: {payroll.month}/{payroll.year}")
        c.drawString(30*mm, height-45*mm, f"Status: {payroll.status}")

        y = height - 55*mm
        c.setFont('Helvetica-Bold', 12)
        c.drawString(30*mm, y, "Earnings")
        c.drawString(130*mm, y, "Amount")
        y -= 5*mm
        c.setFont('Helvetica', 10)
        items = payroll.items.filter(amount__gt=0)
        for item in items:
            c.drawString(30*mm, y, item.component.name)
            c.drawString(130*mm, y, f"{item.amount:.2f}")
            y -= 5*mm
            if y < 20*mm:
                c.showPage()
                y = height - 20*mm

        y -= 5*mm
        c.setFont('Helvetica-Bold', 12)
        c.drawString(30*mm, y, "Deductions")
        y -= 5*mm
        c.setFont('Helvetica', 10)
        deductions = payroll.items.filter(amount__lt=0)
        for item in deductions:
            c.drawString(30*mm, y, item.component.name)
            c.drawString(130*mm, y, f"{abs(item.amount):.2f}")
            y -= 5*mm
            if y < 20*mm:
                c.showPage()
                y = height - 20*mm

        y -= 5*mm
        c.setFont('Helvetica-Bold', 14)
        c.drawString(30*mm, y, "Net Salary")
        c.drawString(130*mm, y, f"{payroll.net_salary:.2f}")

        c.save()
        return buffer.getvalue()

    @staticmethod
    def export_payroll_excel(payrolls, month, year):
        data = []
        for p in payrolls:
            data.append({
                'Employee ID': p.employee.employee_id,
                'Employee Name': p.employee.user.full_name,
                'Gross Salary': p.gross_salary,
                'Allowances': p.total_allowance,
                'Deductions': p.total_deduction,
                'Tax': p.tax,
                'Net Salary': p.net_salary,
                'Status': p.status
            })
        df = pd.DataFrame(data)
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=f'Payroll_{month}_{year}', index=False)
        return output.getvalue()

    @staticmethod
    def export_payroll_csv(payrolls, month, year):
        data = []
        for p in payrolls:
            data.append({
                'Employee ID': p.employee.employee_id,
                'Employee Name': p.employee.user.full_name,
                'Gross Salary': p.gross_salary,
                'Allowances': p.total_allowance,
                'Deductions': p.total_deduction,
                'Tax': p.tax,
                'Net Salary': p.net_salary,
                'Status': p.status
            })
        df = pd.DataFrame(data)
        output = BytesIO()
        df.to_csv(output, index=False)
        return output.getvalue()