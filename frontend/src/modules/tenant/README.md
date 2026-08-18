# Tenant workspace

This app is the **tenant portal**. On a tenant hostname (`demo.localhost`) it is served at `/login` and `/`.

Sprint 1: login + dashboard. Later: employees, leave, payroll.

The tenant is **never typed in a form**. It comes from the URL host and is forwarded to Django as `X-Tenant-Host`.
