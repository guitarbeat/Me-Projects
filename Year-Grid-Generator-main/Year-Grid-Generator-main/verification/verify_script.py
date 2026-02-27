
from playwright.sync_api import sync_playwright
import time

def verify(page):
    print('Navigating...')
    page.goto('http://localhost:3000')
    print('Waiting for content...')
    page.wait_for_selector('text=Year Grid', timeout=10000)
    print('Content loaded.')
    # Wait a bit for grid
    time.sleep(2)
    page.screenshot(path='verification/verification.png')

if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f'Error: {e}')
        finally:
            browser.close()
