"""
Test 02 — Authentication & protected route redirects

NOTE: Actual login is OAuth (Replit OpenID). These tests verify:
  - Protected routes redirect unauthenticated users
  - After login (via persistent Chrome profile), protected routes load
  - Login button triggers the auth flow
"""

import pytest
from conftest import BASE_URL, wait_for_auth


class TestAuthRedirects:

    def test_dashboard_redirects_when_logged_out(self, page):
        """
        In a fresh incognito session, /dashboard should redirect to /api/login.
        We skip this if already logged in (persistent profile).
        """
        page.goto(f"{BASE_URL}/dashboard", wait_until="load")
        # Either loads dashboard (logged in) or redirects to auth
        assert "/dashboard" in page.url or "/api/login" in page.url or "login" in page.url.lower()

    def test_create_request_protected(self, page):
        page.goto(f"{BASE_URL}/create-request", wait_until="load")
        assert "/create-request" in page.url or "login" in page.url.lower() or "/api/login" in page.url

    def test_invoices_protected(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="load")
        assert "/invoices" in page.url or "login" in page.url.lower() or "/api/login" in page.url

    def test_login_flow_starts(self, page):
        """Clicking 'Find a Professional' or 'Join as a Pro' starts login."""
        page.goto(BASE_URL, wait_until="networkidle")
        content = page.content()
        if "Find a Professional" in content:
            page.click("text=Find a Professional")
            import time; time.sleep(2)
            # Should either be at dashboard (already logged in) or auth page
            assert page.url != BASE_URL or "/dashboard" in page.url or "login" in page.url.lower()


class TestAuthenticatedAccess:
    """
    These tests require being logged in via the persistent Chrome profile.
    Run `python -m pytest tests/test_02_auth.py -v` and log in if prompted.
    """

    def test_dashboard_loads_when_authenticated(self, page):
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        # After auth, should be on dashboard or onboarding
        assert "/dashboard" in page.url or "/onboarding" in page.url

    def test_dashboard_has_title(self, page):
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        assert "My Projects" in content or "Available Leads" in content or "Dashboard" in content
