"""
Shared fixtures for DOMO test suite.

AUTH STRATEGY:
  The app uses OAuth via /api/login (Replit OpenID).
  We use a persistent Chrome profile so you stay logged in across runs.
  On first run, log in manually when the browser opens.
  After that, auth is cached and tests run automatically.

SETUP:
  pip install pytest pytest-playwright
  playwright install chromium
"""

import os
import pytest
from playwright.sync_api import sync_playwright, BrowserContext, Page

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL = os.getenv("DOMO_URL", "https://7930e695-1e4a-4191-8cb1-e6a1e8398801-00-3dzrpiml55f8d.spock.replit.dev")
CHROME_PROFILE = os.path.expanduser("~/Library/Application Support/Google/Chrome")
SLOW_MO = int(os.getenv("SLOW_MO", "400"))  # ms between actions; set 0 for speed
HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"

# Stripe test card
STRIPE_CARD = "4242 4242 4242 4242"
STRIPE_EXPIRY = "12/28"
STRIPE_CVC = "123"
STRIPE_ZIP = "V3T 0A1"


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def playwright_instance():
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope="session")
def browser_context(playwright_instance) -> BrowserContext:
    """
    Launches Chrome with your real profile so OAuth session is preserved.
    On first run, log in manually — subsequent runs are fully automated.
    """
    context = playwright_instance.chromium.launch_persistent_context(
        user_data_dir=CHROME_PROFILE,
        headless=HEADLESS,
        slow_mo=SLOW_MO,
        channel="chrome",
        args=["--profile-directory=Default"],
        viewport={"width": 1280, "height": 900},
    )
    yield context
    context.close()


@pytest.fixture
def page(browser_context) -> Page:
    """Fresh page for each test, reusing the auth session."""
    p = browser_context.new_page()
    yield p
    p.close()


def wait_for_auth(page: Page, timeout: int = 120_000):
    """
    If redirected to login, waits up to `timeout` ms for manual login,
    then returns to the app.
    """
    if "login" in page.url or "replit.com/auth" in page.url:
        print("\n⚠  Not logged in — please log in manually in the browser window.")
        page.wait_for_url(f"**{BASE_URL.split('//')[1]}**", timeout=timeout)
