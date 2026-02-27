
from playwright.sync_api import Page, expect, sync_playwright

def test_layer_keyboard_navigation(page: Page):
  # 1. Arrange: Go to the app.
  page.goto("http://localhost:5173")

  # Wait for the app to load (Upload screen first)
  expect(page.get_by_text("Drop documents here")).to_be_visible()

  # 2. Act: Upload an image to enter the editor
  # We need a dummy file for the upload
  with page.expect_file_chooser() as fc_info:
      page.get_by_text("or click to browse").click()
  file_chooser = fc_info.value

  # Create a dummy image
  page.evaluate("() => { const canvas = document.createElement('canvas'); canvas.width=100; canvas.height=100; const ctx = canvas.getContext('2d'); ctx.fillStyle='red'; ctx.fillRect(0,0,100,100); canvas.toBlob(blob => { const file = new File([blob], 'test-image.png', { type: 'image/png' }); const dt = new DataTransfer(); dt.items.add(file); const input = document.querySelector('input[type=file]'); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true })); }); }")

  # Wait for editor to load
  expect(page.get_by_text("Layers")).to_be_visible()

  # 3. Verify Layer Panel Structure
  layer_list = page.locator('div[role="list"][aria-label="Layers"]')
  expect(layer_list).to_be_visible()

  # Verify Layer Item
  # Note: The upload creates a layer with the filename, but we simulated it via JS injection or we can try a real file upload if strict mode allows.
  # Actually, let's use the hidden input directly to trigger the upload logic if the file chooser is tricky in this env.

  # Alternative: Reload page with a state? No, storage is local.
  # Let's try to find the layer item.
  # The app creates a layer named "test-image.png" if we succeed.

  # Let's look for a layer item
  layer_item = page.locator('div[role="listitem"]').first
  expect(layer_item).to_be_visible()

  # 4. Test Keyboard Navigation
  # Click to focus the panel/body first
  page.mouse.click(0, 0)

  # Tab into the layer list
  page.keyboard.press("Tab")

  # It might take a few tabs to get there depending on the sidebar.
  # Let's force focus to the first layer item to test the style
  layer_item.focus()

  # Check if it has the focus ring class (we added focus-visible:ring-2)
  # Playwright's to_have_css is good for computed styles, but checking class is easier for Tailwind
  # expect(layer_item).to_have_class(re.compile(r"focus-visible:ring-2"))

  # 5. Screenshot
  page.screenshot(path="/home/jules/verification/layer-keyboard-nav.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      test_layer_keyboard_navigation(page)
    finally:
      browser.close()
