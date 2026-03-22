"""
Test 01 — Home page (public, no login required)
"""

import pytest
from conftest import BASE_URL


class TestHomePage:

    def test_page_loads(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        assert page.title() != ""

    def test_hero_heading(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        heading = page.locator("h1, h2").first
        assert heading.is_visible()
        assert "DOMO" in page.content() or "Home" in heading.inner_text()

    def test_main_headline(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        assert "Your Home, One Platform" in page.content()

    def test_feature_cards_visible(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        assert "Vetted Professionals" in page.content()
        assert "Fast & Easy Quotes" in page.content()
        assert "Secure Payments" in page.content()

    def test_service_categories_visible(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        for category in ["Plumbing", "Electrical", "Real Estate"]:
            assert category in page.content(), f"Category '{category}' not found"

    def test_why_choose_domo_section(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        assert "Why Choose DOMO?" in page.content()

    def test_footer_visible(self, page):
        page.goto(BASE_URL, wait_until="networkidle")
        assert "DOMO" in page.content()
        assert "All rights reserved" in page.content()

    def test_cta_buttons_visible_unauthenticated(self, page):
        """Before login, should see 'Find a Professional' and 'Join as a Pro'."""
        page.goto(BASE_URL, wait_until="networkidle")
        # Only check if not already logged in
        if "login" not in page.url:
            content = page.content()
            assert "Find a Professional" in content or "Join as a Pro" in content

    def test_404_page(self, page):
        page.goto(f"{BASE_URL}/this-page-does-not-exist", wait_until="networkidle")
        content = page.content()
        assert "404" in content or "not found" in content.lower()
