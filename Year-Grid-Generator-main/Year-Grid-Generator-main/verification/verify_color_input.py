from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000")

            # Wait for content to load
            expect(page.get_by_text("Year Grid", exact=False)).to_be_visible()

            # Find the Background label
            # The label text is "BACKGROUND" (uppercase due to CSS, but in DOM it is "Background")
            # Wait, the code says: <label ...>{label}</label> and label prop is "Background".
            # The CSS class is "uppercase".

            label = page.locator("label").filter(has_text="Background").first
            expect(label).to_be_visible()

            # check 'for' attribute
            label_for = label.get_attribute("for")
            print(f"Label 'for': {label_for}")
            assert label_for is not None, "Label should have 'for' attribute"

            # Find the hex input
            hex_input = page.locator(f"input#{label_for}")
            expect(hex_input).to_be_visible()
            print("Hex input found via label 'for' association.")

            # Find the color picker input
            # It should be a sibling or close by.
            # We can find it by aria-label "Background Color Picker"
            color_picker = page.get_by_label("Background Color Picker")
            expect(color_picker).to_be_visible()
            print("Color picker found via aria-label.")

            # Test interaction: Click label -> Focus hex input
            hex_input.blur()
            label.click()
            expect(hex_input).to_be_focused()
            print("Clicking label focused the hex input.")

            # Take screenshot
            page.screenshot(path="verification/color_input_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
