from playwright.sync_api import sync_playwright, expect
import time

def verify_dropdown_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5000")

        # Wait for page load
        page.wait_for_load_state("networkidle")

        # Find the dropdown button
        # There are two buttons with aria-label="More options". We'll test the first one (Save Settings section).
        dropdown_btns = page.get_by_label("More options").all()
        if not dropdown_btns:
            print("Dropdown button not found!")
            browser.close()
            return

        dropdown_btn = dropdown_btns[0]

        print("Checking initial state...")
        expect(dropdown_btn).to_be_visible()
        expect(dropdown_btn).to_have_attribute("aria-expanded", "false")

        # Find the dropdown menu associated with this button
        # It is a sibling div with class dropdown-menu
        # But looking at index.html, it's inside a relative container.
        # structure:
        # <div class="relative inline-block">
        #   <div class="flex ..."> <button id="dropdown-btn" ...> </div>
        #   <div class="dropdown-menu ...">

        # So we can find the menu by traversing up to the container
        # Since playwight locators are strict, we need to be careful.

        # Let's just find the menu by text content inside it "Export Settings"
        menu = page.locator("text=Export Settings").locator("xpath=..")

        # Ensure it's hidden initially
        expect(menu).not_to_be_visible()

        print("Testing expand...")
        dropdown_btn.click()

        # Expect menu to be visible
        expect(menu).to_be_visible()

        # Expect aria-expanded to be true (This is expected to FAIL currently)
        try:
            expect(dropdown_btn).to_have_attribute("aria-expanded", "true", timeout=2000)
            print("PASS: aria-expanded is true after click")
        except AssertionError:
            print("FAIL: aria-expanded did not update to true")

        # Expect role="menu" on the menu container (Expected to FAIL)
        try:
            expect(menu).to_have_attribute("role", "menu", timeout=2000)
            print("PASS: role='menu' exists")
        except AssertionError:
            print("FAIL: role='menu' missing on dropdown container")

        # Expect role="menuitem" on items (Expected to FAIL)
        items = menu.get_by_role("menuitem").all()
        if len(items) > 0:
            print(f"PASS: Found {len(items)} menuitems")
        else:
            print("FAIL: No menuitems found (role='menuitem' missing)")

        print("Testing collapse (click outside)...")
        page.mouse.click(0, 0)
        expect(menu).not_to_be_visible()

        # Expect aria-expanded to be false
        expect(dropdown_btn).to_have_attribute("aria-expanded", "false")

        browser.close()

if __name__ == "__main__":
    verify_dropdown_accessibility()
