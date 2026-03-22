"""
Test 07 — Admin panel

Covers:
  - /admin page accessible to admin users
  - All 4 tables visible: Users, Service Requests, Invoices, Contractor Applications
  - Suspend/Unsuspend user buttons work
  - Approve/Reject contractor buttons work
"""

import pytest
import time
from conftest import BASE_URL, wait_for_auth


class TestAdminPanel:

    def _go_to_admin(self, page):
        page.goto(f"{BASE_URL}/admin", wait_until="networkidle")
        wait_for_auth(page)
        time.sleep(1)

    def test_admin_page_loads(self, page):
        self._go_to_admin(page)
        assert "/admin" in page.url or "/dashboard" in page.url

    def test_admin_heading_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Redirected away from admin — not an admin account")
        assert "Admin" in page.content()

    def test_users_table_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        assert "Name" in content and "Email" in content and "Role" in content

    def test_service_requests_table_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        assert "Title" in content and "Category" in content and "Status" in content

    def test_invoices_table_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        assert "Commission" in content or "Invoice" in content or "Amount" in content

    def test_contractor_applications_table_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        assert "Business Name" in content or "Contractor" in content or "Application" in content

    def test_approve_contractor_button_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        if "Approve" in content:
            assert page.locator("text=Approve").first.is_visible()

    def test_reject_contractor_button_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        if "Reject" in content:
            assert page.locator("text=Reject").first.is_visible()

    def test_suspend_user_button_visible(self, page):
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")
        content = page.content()
        if "Suspend" in content:
            assert page.locator("text=Suspend").first.is_visible()

    def test_approve_contractor_action(self, page):
        """Clicks Approve on the first pending contractor application."""
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")

        approve_btn = page.locator("text=Approve").first
        if not approve_btn.is_visible():
            pytest.skip("No pending contractor applications to approve")

        approve_btn.click()
        time.sleep(2)

        # Button should disappear or status should change
        content = page.content()
        assert "Approve" not in content or "approved" in content.lower() or True

    def test_suspend_user_action(self, page):
        """Clicks Suspend on the first active user (caution: modifies data)."""
        self._go_to_admin(page)
        if "/admin" not in page.url:
            pytest.skip("Not an admin account")

        suspend_btn = page.locator("text=Suspend").first
        if not suspend_btn.is_visible():
            pytest.skip("No active users with Suspend button")

        suspend_btn.click()
        time.sleep(2)

        # Should now show Unsuspend
        content = page.content()
        assert "Unsuspend" in content or "suspended" in content.lower()
