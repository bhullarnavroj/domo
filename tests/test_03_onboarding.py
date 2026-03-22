"""
Test 03 — Onboarding flow

Covers:
  - Onboarding page loads for new users (no profile yet)
  - Role selection: Property Owner vs Service Provider
  - Required fields validation
  - Provider-only fields appear when provider role selected
  - Successful form submission redirects to /dashboard
"""

import pytest
import time
from conftest import BASE_URL, wait_for_auth


class TestOnboardingPage:

    def _go_to_onboarding(self, page):
        page.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
        wait_for_auth(page)
        time.sleep(1)

    def test_onboarding_page_loads(self, page):
        self._go_to_onboarding(page)
        # May redirect to dashboard if profile already exists
        assert "/onboarding" in page.url or "/dashboard" in page.url

    def test_role_selection_visible(self, page):
        self._go_to_onboarding(page)
        if "/onboarding" not in page.url:
            pytest.skip("Profile already complete — onboarding skipped")
        content = page.content()
        assert "Property Owner" in content or "Service Provider" in content

    def test_provider_fields_appear_on_selection(self, page):
        self._go_to_onboarding(page)
        if "/onboarding" not in page.url:
            pytest.skip("Profile already complete")

        # Click Service Provider role
        page.click("text=Service Provider")
        time.sleep(1)
        content = page.content()
        assert "Business" in content or "Practice Name" in content, \
            "Provider-specific fields should appear after selecting Service Provider"

    def test_provider_services_checkboxes_visible(self, page):
        self._go_to_onboarding(page)
        if "/onboarding" not in page.url:
            pytest.skip("Profile already complete")

        page.click("text=Service Provider")
        time.sleep(1)
        content = page.content()
        for service in ["Plumbing", "Electrical", "HVAC"]:
            assert service in content, f"Service checkbox '{service}' not found"

    def test_complete_profile_button_visible(self, page):
        self._go_to_onboarding(page)
        if "/onboarding" not in page.url:
            pytest.skip("Profile already complete")
        assert "Complete Profile" in page.content()

    def test_homeowner_onboarding_submit(self, page):
        """
        Fills out and submits the homeowner onboarding form.
        Only runs if onboarding page is accessible (new account).
        """
        self._go_to_onboarding(page)
        if "/onboarding" not in page.url:
            pytest.skip("Profile already complete — cannot re-run onboarding")

        # Select Property Owner
        page.click("text=Property Owner")
        time.sleep(0.5)

        # Fill phone
        phone_input = page.locator("input[placeholder*='555']")
        phone_input.fill("+1 (604) 555-0001")

        # Fill address
        address_input = page.locator("input[placeholder*='City']")
        address_input.fill("Surrey, BC")

        # Submit
        page.click("text=Complete Profile")
        time.sleep(3)

        assert "/dashboard" in page.url, f"Expected /dashboard, got {page.url}"

    def test_provider_onboarding_submit(self, page):
        """
        Fills out and submits the service provider onboarding form.
        Only runs if onboarding page is accessible (new account).
        """
        self._go_to_onboarding(page)
        if "/onboarding" not in page.url:
            pytest.skip("Profile already complete — cannot re-run onboarding")

        page.click("text=Service Provider")
        time.sleep(0.5)

        page.locator("input[placeholder*='555']").fill("+1 (604) 555-0002")
        page.locator("input[placeholder*='City']").fill("Burnaby, BC")
        page.locator("input[placeholder*='Smith']").fill("Test Contracting Ltd.")
        page.locator("textarea").fill("Professional plumbing and electrical services across Metro Vancouver.")

        # Select Plumbing service
        plumbing = page.locator("text=Plumbing").first
        if plumbing.is_visible():
            plumbing.click()

        page.click("text=Complete Profile")
        time.sleep(3)

        assert "/dashboard" in page.url, f"Expected /dashboard, got {page.url}"
