# payroll

Salary structures, payroll runs, loans, advances, bonuses, and tax slabs.

## Schema

**Tenant** (`TENANT_APPS`)

## Main models

SalaryComponent · SalaryStructure · EmployeeSalary · Payroll · PayrollItem · Bonus · Loan · AdvanceSalary · TaxSlab

## API (`/api/` — tenant host)

| Prefix | Resource |
|--------|----------|
| `salary-components/` | Earnings / deductions |
| `salary-structures/` | Structures |
| `employee-salaries/` | Per-employee salary |
| `payroll/` | Payroll runs |
| `bonuses/` | Bonuses |
| `loans/` | Loans |
| `advance-salaries/` | Advances |
| `tax-slabs/` | Tax brackets |

## Services

Under `services/` — salary, payroll, tax, loan, overtime, bonus, payslip (ReportLab).

## Notes

Payslip generation may write files under media; free PaaS disks are ephemeral.
