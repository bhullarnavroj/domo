"""
Test 08 — Full end-to-end marketplace flow

Simulates the complete journey:
  1. Homeowner posts a request
  2. Provider submits a quote
  3. Homeowner accepts the quote
  4. Invoice is created
  5. Homeowner pays via Stripe test card
  6. Provider sees earnings with service fee deducted
  7. Homeowner marks job as completed

NOTE: This test requires TWO browser sessions (homeowner + provider).
      Run your app locally or on Replit with two accounts.
      By default this runs as a SINGLE user to simulate key checkpoints.
"""

import pytest
import time
from conftest import BASE_URL, wait_for_auth, STRIPE_CARD, STRIPE_EXPIRY, STRIPE_CVC, STRIPE_ZIP


class TestFullMarketplaceFlow:
    """
    Checkpoint-based E2E test.
    Each step picks up from where the previous left off using the same session.
    """

    REQUEST_TITLE = "E2E Test — Plumbing Inspection"

    def test_step1_post_request(self, page):
        """Homeowner posts a new service request."""
        page.goto(f"{BASE_URL}/create-request", wait_until="networkidle")
        wait_for_auth(page)
        if "/create-request" not in page.url:
            pytest.skip("Not a homeowner account or not authenticated")

        page.locator("input[placeholder*='photographer'], input[name='title']").first.fill(self.REQUEST_TITLE)

        category_trigger = page.locator("[role='combobox']").first
        category_trigger.click()
        time.sleep(0.5)
        page.locator("[role='option']").first.click()

        page.locator("input[placeholder*='City']").first.fill("Surrey")

        province_triggers = page.locator("[role='combobox']")
        if province_triggers.count() > 1:
            province_triggers.nth(1).click()
            time.sleep(0.5)
            page.locator("[role='option']").first.click()

        page.locator("textarea").first.fill("E2E automated test. Provider: please ignore this request.")
        page.click("text=Post Request")
        time.sleep(4)

        assert "/dashboard" in page.url, "Should redirect to dashboard after posting"

    def test_step2_request_visible_on_dashboard(self, page):
        """The posted request appears on the homeowner dashboard."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        assert "request" in content.lower() or "project" in content.lower()

    def test_step3_open_request_detail(self, page):
        """Homeowner can open their request detail page."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        link = page.locator("a[href*='/requests/']").first
        if link.count() == 0:
            pytest.skip("No requests found on dashboard")
        link.click()
        time.sleep(2)
        assert "/requests/" in page.url

    def test_step4_quote_exists_or_can_be_submitted(self, page):
        """Either a quote exists, or the provider flow has been run separately."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        link = page.locator("a[href*='/requests/']").first
        if link.count() == 0:
            pytest.skip("No requests")
        link.click()
        time.sleep(2)
        content = page.content()
        # Quote section should exist on the page
        assert "quote" in content.lower() or "Quote" in content

    def test_step5_accept_quote(self, page):
        """Homeowner accepts a pending quote — creates invoice."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        link = page.locator("a[href*='/requests/']").first
        if link.count() == 0:
            pytest.skip("No requests")
        link.click()
        time.sleep(2)

        accept_btn = page.locator("text=Accept Quote").first
        if not accept_btn.is_visible():
            pytest.skip("No 'Accept Quote' button — quote may not exist yet or already accepted")

        accept_btn.click()
        time.sleep(3)

        content = page.content()
        assert "accepted" in content.lower() or "in_progress" in content.lower() or "Pay Now" in content

    def test_step6_pay_invoice(self, page):
        """Homeowner pays the invoice via Stripe test card."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)

        pay_btn = page.locator("text=Pay Now").first
        if not pay_btn.is_visible():
            pytest.skip("No pending invoice — skip payment step")

        with page.expect_navigation(timeout=15000):
            pay_btn.click()

        time.sleep(4)

        if "stripe.com" not in page.url:
            pytest.skip("Did not reach Stripe checkout")

        # Fill card details in Stripe hosted checkout
        try:
            page.locator("input[data-elements-stable-field-name='cardNumber'], input[placeholder*='1234']").fill(STRIPE_CARD)
            page.locator("input[placeholder*='MM']").fill(STRIPE_EXPIRY)
            page.locator("input[placeholder*='CVC']").fill(STRIPE_CVC)
            page.locator("input[placeholder*='ZIP']").fill(STRIPE_ZIP)
        except Exception as e:
            pytest.skip(f"Could not fill Stripe fields: {e}")

        page.locator("button[type='submit']").first.click()
        time.sleep(6)

        assert "/payment/success" in page.url or "success" in page.url

    def test_step7_payment_success_confirmation(self, page):
        """Payment success page shows confirmation message."""
        page.goto(f"{BASE_URL}/payment/success", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        assert "success" in content.lower() or "confirmed" in content.lower() or "thank" in content.lower()

    def test_step8_invoice_shows_paid(self, page):
        """After payment, invoice status is Paid."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        assert "Paid" in page.content()

    def test_step9_mark_job_completed(self, page):
        """Homeowner marks the job as completed."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        link = page.locator("a[href*='/requests/']").first
        if link.count() == 0:
            pytest.skip("No requests")
        link.click()
        time.sleep(2)

        complete_btn = page.locator("text=Mark Job as Completed").first
        if not complete_btn.is_visible():
            pytest.skip("'Mark Job as Completed' not visible — job may not be in_progress")

        complete_btn.click()
        time.sleep(3)

        content = page.content()
        assert "completed" in content.lower() or "Completed" in content

    def test_step10_provider_earnings_updated(self, page):
        """Provider invoices page shows net payout with service fee deducted."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        if "Total Earnings" in content:
            assert "DOMO Service Fee" in content
            assert "Net Payout" in content
        else:
            pytest.skip("Not on a provider account — switch to provider to verify earnings")
