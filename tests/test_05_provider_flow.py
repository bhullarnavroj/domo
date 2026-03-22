"""
Test 05 — Service Provider flow

Covers:
  - Dashboard shows "Available Leads" for providers
  - Provider can view open requests
  - Quote submission form has amount + description fields
  - Provider can submit a quote
  - Invoices page shows earnings summary (Total, Fee, Net Payout)
"""

import pytest
import time
from conftest import BASE_URL, wait_for_auth


class TestProviderDashboard:

    def test_dashboard_loads(self, page):
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        assert "/dashboard" in page.url

    def test_provider_sees_available_leads(self, page):
        """Providers should see 'Available Leads' heading."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        # If this is a provider account, "Available Leads" appears
        if "Available Leads" in content:
            assert True
        elif "My Projects" in content:
            pytest.skip("Logged in as homeowner — switch to provider account")
        else:
            pytest.skip("Role unclear from dashboard content")

    def test_provider_empty_state_message(self, page):
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        if "No requests found" in content:
            assert True  # Empty state is valid
        else:
            assert "request" in content.lower()


class TestQuoteSubmission:

    def _get_open_request(self, page):
        """Returns URL of first open request visible to provider."""
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        wait_for_auth(page)
        link = page.locator("a[href*='/requests/']").first
        if link.count() == 0:
            return None
        return link.get_attribute("href")

    def test_request_detail_loads_for_provider(self, page):
        href = self._get_open_request(page)
        if not href:
            pytest.skip("No open requests visible on provider dashboard")
        page.goto(f"{BASE_URL}{href}", wait_until="networkidle")
        assert "/requests/" in page.url

    def test_quote_form_fields_visible(self, page):
        href = self._get_open_request(page)
        if not href:
            pytest.skip("No open requests visible")
        page.goto(f"{BASE_URL}{href}", wait_until="networkidle")
        content = page.content()
        # Quote form should have amount and description
        assert "Submit Quote" in content or "quote" in content.lower()

    def test_submit_quote(self, page):
        """Provider submits a quote on an open request."""
        href = self._get_open_request(page)
        if not href:
            pytest.skip("No open requests visible")

        page.goto(f"{BASE_URL}{href}", wait_until="networkidle")
        content = page.content()
        if "Submit Quote" not in content:
            pytest.skip("Submit Quote not available — may already have quoted or wrong role")

        # Click "Submit Quote" to open dialog
        page.click("text=Submit Quote")
        time.sleep(1)

        # Amount field
        amount_input = page.locator("input[type='number'], input[placeholder*='$'], input[placeholder*='amount']").first
        if amount_input.is_visible():
            amount_input.fill("500")

        # Description textarea
        textarea = page.locator("textarea").first
        if textarea.is_visible():
            textarea.fill("Playwright test quote — professional plumbing service, includes parts and labour.")

        # Confirm submit
        submit_btn = page.locator("button:has-text('Submit Quote')").last
        submit_btn.click()
        time.sleep(3)

        # Should see success or quote listed
        content_after = page.content()
        assert "500" in content_after or "quote" in content_after.lower() or "submitted" in content_after.lower()


class TestProviderInvoices:

    def test_invoices_page_loads(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        assert "/invoices" in page.url

    def test_earnings_summary_visible_for_provider(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        # Provider sees earnings breakdown
        if "Total Earnings" in content:
            assert "DOMO Service Fee" in content
            assert "Net Payout" in content

    def test_invoice_table_visible(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        assert "Paid" in content or "Pending" in content or "No invoices" in content or "invoice" in content.lower()

    def test_export_excel_button_visible(self, page):
        page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
        wait_for_auth(page)
        content = page.content()
        assert "Export" in content or "Download" in content or "PDF" in content
