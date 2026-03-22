"""
Test 06 — Payment flow (Stripe)

Covers:
  - "Pay Now" button appears on pending invoices
  - Clicking Pay Now opens Stripe checkout
  - Stripe test card can be entered
  - Successful payment redirects to /payment/success
  - /payment/success page shows confirmation
  - Invoice status updates to Paid after payment

IMPORTANT:
  Uses Stripe test mode card: 4242 4242 4242 4242
  Ensure DOMO is running in Stripe test mode (check stripe dashboard).
"""

import pytest
import time
from conftest import BASE_URL, wait_for_auth, STRIPE_CARD, STRIPE_EXPIRY, STRIPE_CVC, STRIPE_ZIP


class TestPaymentFlow:

    def _find_pending_invoice_request(self, page) -> str | None:
        """Navigate to invoices and return the first pending invoice's Pay Now href."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        pay_btn = page.locator("text=Pay Now").first
        if pay_btn.count() == 0 or not pay_btn.is_visible():
            return None
        return "found"

    def test_pay_now_button_visible(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        if "Pending" not in content:
            pytest.skip("No pending invoices — cannot test Pay Now")
        assert "Pay Now" in content

    def test_pay_now_opens_stripe(self, page):
        """Clicking Pay Now should navigate to Stripe checkout."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)

        pay_btn = page.locator("text=Pay Now").first
        if not pay_btn.is_visible():
            pytest.skip("No pending invoices")

        with page.expect_navigation(timeout=15000):
            pay_btn.click()

        # Should be on Stripe checkout page
        assert "stripe.com" in page.url or "checkout" in page.url or "payment" in page.url

    def test_stripe_checkout_page_loads(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)

        pay_btn = page.locator("text=Pay Now").first
        if not pay_btn.is_visible():
            pytest.skip("No pending invoices")

        with page.expect_navigation(timeout=15000):
            pay_btn.click()

        time.sleep(3)
        content = page.content()
        assert "stripe" in content.lower() or "card" in content.lower() or "pay" in content.lower()

    def test_stripe_test_card_payment(self, page):
        """
        Full end-to-end Stripe test card payment.
        Requires a pending invoice and Stripe in test mode.
        """
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)

        pay_btn = page.locator("text=Pay Now").first
        if not pay_btn.is_visible():
            pytest.skip("No pending invoices to pay")

        # Click Pay Now
        with page.expect_navigation(timeout=15000):
            pay_btn.click()

        time.sleep(4)

        # Fill Stripe card fields
        card_input = page.locator("input[placeholder*='Card'], input[name*='cardNumber'], iframe")
        if "stripe.com" not in page.url:
            pytest.skip("Did not reach Stripe checkout")

        # Stripe embeds in iframe — handle iframe context
        stripe_frame = page.frame_locator("iframe[name*='stripe'], iframe[src*='stripe']").first

        try:
            stripe_frame.locator("input[placeholder*='1234']").fill(STRIPE_CARD)
            stripe_frame.locator("input[placeholder*='MM']").fill(STRIPE_EXPIRY)
            stripe_frame.locator("input[placeholder*='CVC']").fill(STRIPE_CVC)
        except Exception:
            # Hosted checkout — fields are on the page directly
            page.locator("input[placeholder*='1234'], input[data-elements-stable-field-name='cardNumber']").fill(STRIPE_CARD)
            page.locator("input[placeholder*='MM / YY']").fill(STRIPE_EXPIRY)
            page.locator("input[placeholder*='CVC']").fill(STRIPE_CVC)
            page.locator("input[placeholder*='ZIP']").fill(STRIPE_ZIP)

        # Submit payment
        page.locator("button[type='submit'], button:has-text('Pay'), button:has-text('Subscribe')").first.click()
        time.sleep(6)

        # Should redirect back to /payment/success
        assert "/payment/success" in page.url or "success" in page.url or "thank" in page.content().lower(), \
            f"Expected payment success page, got: {page.url}"

    def test_payment_success_page(self, page):
        page.goto(f"{BASE_URL}/payment/success", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        assert "success" in content.lower() or "confirmed" in content.lower() or "thank" in content.lower()

    def test_invoice_marked_paid_after_payment(self, page):
        """After a successful payment, invoice status should show Paid."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        # After payment test, at least one invoice should be Paid
        assert "Paid" in content or "paid" in content


class TestServiceChargeDeduction:
    """
    Verifies DOMO's service fee is correctly deducted and visible.
    """

    def test_provider_earnings_show_fee_deduction(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        if "Total Earnings" not in content:
            pytest.skip("Not on a provider account or no earnings yet")

        assert "DOMO Service Fee" in content, "Service fee not displayed"
        assert "Net Payout" in content, "Net payout not displayed"

    def test_invoice_shows_commission_breakdown(self, page):
        """Invoice detail should show subtotal, fee, and net amount."""
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)

        view_btn = page.locator("text=View").first
        if not view_btn.is_visible():
            pytest.skip("No invoices to view")

        view_btn.click()
        time.sleep(1)

        content = page.content()
        # Invoice modal/detail should have amount breakdown
        assert any(k in content for k in ["subtotal", "Subtotal", "fee", "Fee", "commission", "Commission"])
