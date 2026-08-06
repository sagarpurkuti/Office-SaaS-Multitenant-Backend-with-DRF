from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SalaryComponentViewSet, SalaryStructureViewSet, EmployeeSalaryViewSet,
    PayrollViewSet, BonusViewSet, LoanViewSet, AdvanceSalaryViewSet,
    TaxSlabViewSet
)

router = DefaultRouter()
router.register(r'salary-components', SalaryComponentViewSet, basename='salarycomponent')
router.register(r'salary-structures', SalaryStructureViewSet, basename='salarystructure')
router.register(r'employee-salaries', EmployeeSalaryViewSet, basename='employeesalary')
router.register(r'payroll', PayrollViewSet, basename='payroll')
router.register(r'bonuses', BonusViewSet, basename='bonus')
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'advance-salaries', AdvanceSalaryViewSet, basename='advancesalary')
router.register(r'tax-slabs', TaxSlabViewSet, basename='taxslab')

urlpatterns = [
    path('', include(router.urls)),
]