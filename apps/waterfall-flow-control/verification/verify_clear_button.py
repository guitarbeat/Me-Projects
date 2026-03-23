import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with viewport similar to a desktop browser
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Navigate to the dashboard
        print("Navigating to dashboard...")
        page.goto("http://localhost:8080")

        # Wait for the dashboard to load (wait for the search input)
        print("Waiting for search input...")
        search_input = page.get_by_placeholder("Search transactions...")
        search_input.wait_for()

        # Type into the search input
        print("Typing 'groceries'...")
        search_input.fill("groceries")

        # Wait for the clear button to appear
        print("Waiting for clear button...")
        clear_button = page.get_by_label("Clear search")
        clear_button.wait_for()

        # Take a screenshot showing the clear button
        print("Taking screenshot with clear button...")
        page.screenshot(path="verification/search_with_clear_button.png")

        # Click the clear button
        print("Clicking clear button...")
        clear_button.click()

        # Verify the input is cleared
        print("Verifying input is cleared...")
        # Wait a short moment for state update
        time.sleep(0.5)

        # Check that the value is empty
        input_value = search_input.input_value()
        if input_value != "":
            print(f"Error: Input value is '{input_value}', expected empty string.")
            exit(1)

        # Take a screenshot after clearing
        print("Taking screenshot after clearing...")
        page.screenshot(path="verification/search_cleared.png")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    run()
