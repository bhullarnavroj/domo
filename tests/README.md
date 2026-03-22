# DOMO — Playwright Test Suite

## Setup (one time)

```bash
pip install pytest pytest-playwright
playwright install chromium
```

## Run all tests

```bash
cd /Users/ramanbrar/domo
python -m pytest tests/ -v
```

## Run a specific file

```bash
python -m pytest tests/test_01_home.py -v        # Public home page
python -m pytest tests/test_04_homeowner_flow.py  # Homeowner flow
python -m pytest tests/test_05_provider_flow.py   # Provider flow
python -m pytest tests/test_06_payment_flow.py    # Stripe payments
python -m pytest tests/test_07_admin.py           # Admin panel
python -m pytest tests/test_08_end_to_end.py      # Full E2E flow
```

## First run — login required

The tests use your real Chrome profile so Replit OAuth is preserved.
On the **first run**, a browser window opens — log in manually, then tests continue automatically.

## Environment variables

| Variable    | Default                      | Description                      |
|-------------|------------------------------|----------------------------------|
| `DOMO_URL`  | Replit dev URL               | Override with local or prod URL  |
| `SLOW_MO`   | `400`                        | ms delay between actions (0=fast)|
| `HEADLESS`  | `false`                      | Set `true` to run without GUI    |

## Test accounts needed

| Role      | Usage                                     |
|-----------|-------------------------------------------|
| Homeowner | Post requests, accept quotes, pay invoice |
| Provider  | Submit quotes, view earnings              |
| Admin     | Approve contractors, suspend users        |

## Test files

| File                        | What it tests                          |
|-----------------------------|----------------------------------------|
| `test_01_home.py`           | Public home page, hero, categories     |
| `test_02_auth.py`           | Auth redirects, protected routes       |
| `test_03_onboarding.py`     | Onboarding form for both roles         |
| `test_04_homeowner_flow.py` | Dashboard, create request, messaging   |
| `test_05_provider_flow.py`  | Available leads, quote submission      |
| `test_06_payment_flow.py`   | Stripe checkout, service fee deduction |
| `test_07_admin.py`          | Admin panel: users, requests, invoices |
| `test_08_end_to_end.py`     | Full marketplace flow, all steps       |
