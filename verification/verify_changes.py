from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the app
    page.goto("http://localhost:5173/tip_harmony/")

    # Wait for the app to load
    page.wait_for_load_state("networkidle")

    # Check for Pin Lock
    if page.get_by_placeholder("PIN Code").count() > 0:
        print("Locked.")

        # Verify Pin Lock Background
        gradient_elements = page.locator(".bg-gradient-to-br")
        gradient_count = gradient_elements.count()
        if gradient_count > 0:
             print(f"FAILURE: PinLock has Gradient background ({gradient_count} found)!")
        else:
             print("SUCCESS: PinLock Gradient background not found.")

        print("Entering PIN...")
        # Wait for readOnly to be false (timeout 500ms in code)
        page.wait_for_timeout(1000)
        page.get_by_placeholder("PIN Code").fill("2519")
        page.get_by_role("button", name="Unlock").click()
        page.wait_for_timeout(1000) # Wait for unlock transition

    # Fill in an amount to generate results
    # The input placeholder is "0.00"
    amount_input = page.get_by_placeholder("0.00")
    if amount_input.count() == 0:
        print("Amount input not found!")
    else:
        amount_input.fill("100")

    # Wait for calculations to happen
    page.wait_for_timeout(1000)

    # 1. Verify "Per Person" text is gone
    per_person_locator = page.get_by_text("Per Person")
    per_person_count = per_person_locator.count()

    if per_person_count > 0:
        print(f"FAILURE: 'Per Person' text found {per_person_count} times!")
        for i in range(per_person_count):
            print(per_person_locator.nth(i).text_content())
    else:
        print("SUCCESS: 'Per Person' text not found.")

    # 2. Verify Background (on Home screen)
    # Check for the gradient class bg-gradient-to-br
    gradient_elements = page.locator(".bg-gradient-to-br")
    gradient_count = gradient_elements.count()
    if gradient_count > 0:
        print(f"FAILURE: Home has Gradient background ({gradient_count} found)!")
    else:
        print("SUCCESS: Home Gradient background not found.")

    # Take a screenshot
    page.screenshot(path="verification/verification.png")
    print("Screenshot saved to verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
