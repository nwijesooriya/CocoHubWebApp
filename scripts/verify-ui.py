"""Browser regression checks against the isolated API fixture on port 8011.

Requires Python Playwright and a running React app on localhost:3000.
Start the fixture with: node BACKEND/tests/browser-server.js
No requests from this script are sent to the real MongoDB-backed API.
"""
from pathlib import Path
from time import time
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp'
OUT.mkdir(exist_ok=True)


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        errors = []
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))

        def forward(route):
            response = route.fetch(url=route.request.url.replace(
                'http://localhost:8000', 'http://127.0.0.1:8011'))
            route.fulfill(response=response)

        context.route('http://localhost:8000/**', forward)
        page.goto('http://localhost:3000/signup', wait_until='domcontentloaded')
        page.get_by_label('Full name', exact=True).fill('Coco Browser Tester')
        email = f'cocohub-qa-{int(time())}@example.com'
        page.get_by_label('Email address', exact=True).fill(email)
        page.get_by_label('Password', exact=True).fill('Coconut123')
        page.get_by_role('button', name='Show password', exact=True).click()
        expect(page.get_by_label('Password', exact=True)).to_have_attribute('type', 'text')
        page.get_by_role('button', name='Hide password', exact=True).click()
        page.get_by_label('Mobile number', exact=True).fill('0771234567')
        page.get_by_label('Date of birth', exact=True).fill('2000-01-01')
        page.get_by_label('Gender', exact=True).select_option('Other')
        page.get_by_label('Account role', exact=True).select_option('Manager')
        page.get_by_role('checkbox').check()
        page.screenshot(path=str(OUT / 'cocohub-signup.png'), full_page=True)
        page.get_by_role('button', name='Create account', exact=True).click()
        expect(page).to_have_url('http://localhost:3000/login')
        expect(page.get_by_role('status')).to_contain_text('Your account is ready')

        page.get_by_label('Email address', exact=True).fill(email)
        page.get_by_label('Password', exact=True).fill('WrongPassword123')
        page.get_by_role('button', name='Sign in', exact=True).click()
        expect(page.get_by_role('alert')).to_contain_text('Invalid Email or Password')
        page.get_by_label('Password', exact=True).fill('Coconut123')
        page.get_by_role('button', name='Sign in', exact=True).click()
        expect(page).to_have_url('http://localhost:3000/profile')
        expect(page.get_by_role('heading', name='Hello, Coco.')).to_be_visible()
        expect(page.get_by_role('link', name='My account', exact=True)).to_be_visible()

        page.get_by_role('button', name='Edit full name', exact=True).click()
        page.locator('#edit-name').fill('Discarded Name')
        page.get_by_role('button', name='Cancel', exact=True).click()
        expect(page.get_by_role('heading', name='Coco Browser Tester', exact=True)).to_be_visible()
        page.get_by_role('button', name='Edit full name', exact=True).click()
        page.locator('#edit-name').fill('Coco Updated Tester')
        page.get_by_role('button', name='Save', exact=True).click()
        expect(page.get_by_role('heading', name='Coco Updated Tester', exact=True)).to_be_visible()
        page.locator('input[type=file]').set_input_files(str(ROOT / 'frontend/src/images/cocofarm.jpg'))
        expect(page.get_by_role('dialog')).to_be_visible()
        page.keyboard.press('Escape')
        expect(page.get_by_role('dialog')).to_have_count(0)
        page.screenshot(path=str(OUT / 'cocohub-profile.png'), full_page=True)

        page.goto('http://localhost:3000/add', wait_until='domcontentloaded')
        expect(page.get_by_label('Your name', exact=True)).to_have_value('Coco Updated Tester')
        expect(page.get_by_label('Email address', exact=True)).to_have_value(email)
        page.get_by_label('Which product is your feedback about?', exact=True).select_option('Coconut Oil')
        page.get_by_role('radio', name='5 stars', exact=True).check()
        page.get_by_label('Your feedback', exact=True).fill('Browser verified coconut feedback.')
        page.get_by_role('checkbox').check()
        page.get_by_role('button', name='Publish feedback', exact=True).click()
        expect(page).to_have_url('http://localhost:3000/feedback')
        expect(page.get_by_text('Thank you! Your feedback has been published.')).to_be_visible()
        card = page.locator('.feedback-card').filter(has_text='Coco Updated Tester')
        expect(card).to_have_count(1)
        expect(card).not_to_contain_text(email)
        page.get_by_label('Search feedback by customer name or product', exact=True).fill('Coco Updated')
        expect(page.locator('.feedback-card')).to_have_count(1)
        card.get_by_role('button', name='Update feedback by Coco Updated Tester', exact=True).click()
        card.get_by_label('Original email address', exact=True).press_sequentially('wrong@example.com')
        expect(card.get_by_label('Original email address', exact=True)).to_be_focused()
        card.get_by_role('button', name='Confirm email', exact=True).click()
        expect(card.get_by_role('alert')).to_contain_text('does not match')
        expect(card.locator('textarea')).to_have_count(0)
        card.get_by_label('Original email address', exact=True).fill(email)
        card.get_by_role('button', name='Confirm email', exact=True).click()
        card.get_by_label('Your feedback', exact=True).fill('Updated through the verified inline editor.')
        card.get_by_role('radio', name='4 stars', exact=True).check()
        card.get_by_role('button', name='Save changes', exact=True).click()
        expect(card).to_contain_text('Updated through the verified inline editor.')
        expect(card).to_contain_text('Coconut Oil')
        expect(card).to_contain_text('Coco Updated Tester')
        page.screenshot(path=str(OUT / 'cocohub-feedback.png'), full_page=True)

        page.get_by_role('button', name='Table view', exact=True).click()
        expect(page.locator('.feedback-card')).to_have_count(0)
        expect(page.locator('.feedback-table tbody tr')).to_have_count(1)
        row = page.locator('.feedback-table tbody tr').first
        row.get_by_role('button', name='Update feedback by Coco Updated Tester', exact=True).click()
        editor = page.get_by_role('region', name='Update feedback by Coco Updated Tester', exact=True)
        editor.get_by_label('Original email address', exact=True).fill(email)
        editor.get_by_role('button', name='Confirm email', exact=True).click()
        editor.get_by_label('Your feedback', exact=True).fill('Table editor also preserves the product.')
        editor.get_by_role('button', name='Save changes', exact=True).click()
        expect(row).to_contain_text('Table editor also preserves the product.')
        with page.expect_download() as download:
            page.get_by_role('button', name='Export PDF report', exact=True).click()
        assert download.value.suggested_filename == 'Feedback_Report.pdf'

        page.get_by_role('button', name='Card view', exact=True).click()
        card.get_by_role('button', name='Delete feedback by Coco Updated Tester', exact=True).click()
        card.get_by_label('Original email address', exact=True).fill('wrong@example.com')
        card.get_by_role('button', name='Confirm email', exact=True).click()
        expect(card.get_by_role('alert')).to_contain_text('does not match')
        card.get_by_label('Original email address', exact=True).fill(email)
        card.get_by_role('button', name='Confirm email', exact=True).click()
        expect(card.get_by_role('heading', name='Delete this feedback?', exact=True)).to_be_visible()
        card.get_by_role('button', name='Cancel', exact=True).click()
        expect(card).to_have_count(1)
        card.get_by_role('button', name='Delete feedback by Coco Updated Tester', exact=True).click()
        card.get_by_label('Original email address', exact=True).fill(email)
        card.get_by_role('button', name='Confirm email', exact=True).click()
        card.get_by_role('button', name='Yes, delete feedback', exact=True).click()
        expect(card).to_have_count(0)
        expect(page.get_by_role('heading', name='No matching reviews.', exact=True)).to_be_visible()
        page.get_by_role('button', name='Clear filters', exact=True).click()
        expect(page.locator('.feedback-card')).to_have_count(2)

        page.goto('http://localhost:3000/feedback?product=Coconut%20Oil')
        expect(page.locator('.feedback-card')).to_have_count(1)
        page.goto('http://localhost:3000/feedback-analytics')
        expect(page.locator('.analytics-table tbody tr')).to_have_count(2)
        page.goto('http://localhost:3000/manage-users')
        page.get_by_label('Search users by name, email, mobile, or role', exact=True).fill(email)
        expect(page.locator('.users-table tbody tr')).to_have_count(1)
        page.get_by_role('combobox', name='Role for Coco Updated Tester', exact=True).select_option('Supplier')
        expect(page.get_by_role('status')).to_contain_text('role has been updated')
        with page.expect_download() as download:
            page.get_by_role('button', name='Export PDF', exact=True).click()
        assert download.value.suggested_filename == 'User_Report.pdf'

        # Every main route at mobile, tablet, and desktop widths, in both themes.
        for width in [320, 390, 768, 1024, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            for theme in ['light', 'dark']:
                page.evaluate("theme => {localStorage.setItem('theme', theme); document.documentElement.setAttribute('data-theme', theme)}", theme)
                for path in ['/', '/signup', '/login', '/profile', '/add', '/feedback', '/forgot-password', '/manage-users', '/feedback-analytics']:
                    page.goto('http://localhost:3000' + path, wait_until='domcontentloaded')
                    page.locator('h1').wait_for()
                    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), f'Overflow: {width}, {theme}, {path}'
                    broken = page.locator('img').evaluate_all('(images) => images.filter(i => i.complete && !i.naturalWidth).map(i => i.src)')
                    assert not broken, f'Broken images: {path}, {broken}'
                    if width == 390 and theme == 'light' and path in ['/', '/signup', '/feedback']:
                        page.screenshot(path=str(OUT / ('cocohub-mobile-' + (path.strip('/') or 'home') + '.png')), full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.goto('http://localhost:3000')
        page.get_by_role('button', name='Open navigation', exact=True).click()
        expect(page.get_by_role('navigation', name='Main navigation')).to_be_visible()
        page.get_by_role('navigation', name='Main navigation').get_by_role('link', name='Customer feedback', exact=True).click()
        expect(page).to_have_url('http://localhost:3000/feedback')
        expect(page.get_by_role('button', name='Open navigation', exact=True)).to_have_attribute('aria-expanded', 'false')
        page.get_by_role('button', name='Open navigation', exact=True).click()
        toggle = page.get_by_role('button', name='Switch to light mode', exact=True)
        toggle.click()
        expect(page.locator('html')).to_have_attribute('data-theme', 'light')
        page.reload()
        expect(page.locator('html')).to_have_attribute('data-theme', 'light')

        # Network failures show a useful retry state; empty data has an invitation.
        context.unroute('http://localhost:8000/**', forward)
        context.route('http://localhost:8000/feedback/', lambda route: route.fulfill(status=500, json={'message': 'Feedback is temporarily unavailable.'}))
        page.goto('http://localhost:3000/feedback')
        expect(page.get_by_role('alert')).to_contain_text('temporarily unavailable')
        expect(page.get_by_role('button', name='Try again', exact=True)).to_be_visible()
        context.unroute('http://localhost:8000/feedback/')
        context.route('http://localhost:8000/feedback/', lambda route: route.fulfill(json=[]))
        page.reload()
        expect(page.get_by_role('heading', name='The conversation starts with you.', exact=True)).to_be_visible()
        assert not errors, errors
        browser.close()
        print('PASS: signup, login, profile edit/cancel, avatar preview, feedback CRUD, wrong-email rejection, card/table editing, search, PDF exports, analytics, roles, mobile navigation, themes, empty/error states, and 90 responsive route checks. No browser runtime errors.')


if __name__ == '__main__':
    run()
