from playwright.sync_api import sync_playwright, expect

def verify_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5000")

        # 1. Verify aria-labels on static elements
        print("Verifying static aria-labels...")
        mic_gain = page.locator("#mic-gain")
        expect(mic_gain).to_have_attribute("aria-label", "Microphone Gain")

        meta_text = page.locator("#meta-text")
        expect(meta_text).to_have_attribute("aria-label", "Additional Instructions")

        # Select the Software Settings section header button
        # The title is "Software Settings"
        section_button = page.get_by_role("button", name="Software Settings")

        print("Checking initial state...")
        expect(section_button).to_be_visible()
        expect(section_button).to_have_attribute("aria-expanded", "true")

        # Check if content is visible
        content_div = page.locator("#section-software-content")
        expect(content_div).to_be_visible()

        print("Testing collapse...")
        section_button.click()
        expect(section_button).to_have_attribute("aria-expanded", "false")
        expect(content_div).not_to_be_visible() # .hidden class adds display:none

        print("Testing expand...")
        section_button.click()
        expect(section_button).to_have_attribute("aria-expanded", "true")
        expect(content_div).to_be_visible()

        print("Testing keyboard focus...")
        section_button.focus()

        # 2. Verify dynamic elements
        print("Adding wake-up sound...")
        page.get_by_role("button", name="Add Wake-up Sound").click()
        wakeup_input = page.locator("#wakeup-sound-list input[type='text']").last
        expect(wakeup_input).to_have_attribute("aria-label", "Wake-up phrase")

        print("Adding backstory field...")
        page.get_by_role("button", name="Add Field").click()
        backstory_container = page.locator("#backstory-fields")
        key_input = backstory_container.locator("input[placeholder='Key']").last
        val_input = backstory_container.locator("input[placeholder='Value']").last
        expect(key_input).to_have_attribute("aria-label", "Backstory Key")
        expect(val_input).to_have_attribute("aria-label", "Backstory Value")

        # Take screenshot of focused state
        page.screenshot(path="verification_accessibility.png")
        print("Screenshot saved to verification_accessibility.png")

        browser.close()

if __name__ == "__main__":
    verify_accessibility()
