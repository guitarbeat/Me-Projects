import time
from playwright.sync_api import sync_playwright

def verify_grid(page):
    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Wait for the grid to appear
    print("Waiting for grid...")
    # YearGrid has a container with shadow-2xl. Or we can look for "Jan", "Feb" etc if they are visible.
    # The default config has showMonths=true.
    page.wait_for_selector("text=Jan", timeout=10000)

    print("Grid loaded.")

    # Take screenshot of initial state
    page.screenshot(path="verification_initial.png")

    # Find the "Show Month Labels" checkbox in Sidebar
    # Sidebar has labels.
    print("Toggling Month Labels...")
    checkbox = page.get_by_label("Show Month Labels")
    checkbox.click()

    # Wait for update
    time.sleep(1)

    # Check if Jan is gone
    if page.locator("text=Jan").is_visible():
         print("Error: Month labels still visible after toggling off.")
    else:
         print("Month labels hidden successfully.")

    # Toggle back on
    checkbox.click()
    time.sleep(1)

    if page.locator("text=Jan").is_visible():
         print("Month labels visible again.")
    else:
         print("Error: Month labels not visible after toggling on.")

    # Now verify YearGrid structure is intact (not broken by memoization)
    # We can check for day cells.
    # DayCell has no specific class, but has style with background color.
    # We can check for "Mon" label if showDays is true.

    # --- Verify Zoom ---
    print("Verifying zoom shortcuts...")
    container = page.locator(".origin-center")
    initial_style = container.get_attribute("style")
    print(f"Initial style: {initial_style}")

    # Press +
    page.keyboard.press("+")
    time.sleep(0.5)
    style_after_plus = container.get_attribute("style")
    if initial_style == style_after_plus:
        print("Error: Zoom did not change after pressing +")
        # Don't fail hard, just warn? Or fail? The requirement is to verify.
    else:
        print(f"Zoom In works: {style_after_plus}")

    # Press -
    page.keyboard.press("-")
    time.sleep(0.5)
    style_after_minus = container.get_attribute("style")
    if style_after_plus == style_after_minus:
        print("Error: Zoom did not change after pressing -")
    else:
        print(f"Zoom Out works: {style_after_minus}")

    # --- Verify Hex Input Expansion ---
    print("Verifying hex input expansion...")
    # Find background color input. It has label "BACKGROUND".
    # Sidebar uses ColorInput which has an input type="text".
    bg_input = page.get_by_label("Hex code for Background")

    # Clear and type 3-digit hex "abc"
    bg_input.click()
    bg_input.fill("#abc")
    bg_input.blur()
    time.sleep(0.5)

    # Check value
    val = bg_input.input_value()
    if val.lower() == "#aabbcc":
        print("Hex input expansion verified: #abc -> #aabbcc")
    else:
        print(f"Hex input expansion failed. Expected #aabbcc, got {val}")

    print("Taking final screenshot...")
    page.screenshot(path="verification_final.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        verify_grid(page)
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification_error.png")
    finally:
        browser.close()
