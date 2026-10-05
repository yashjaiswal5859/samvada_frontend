const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('--- Launching Browser via Playwright (MS Edge Channel) ---');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2, // High-res retina screenshots
  });

  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log(`[NAVIGATED] to: ${frame.url()}`);
    }
  });

  try {
    const timestamp = Date.now();
    const testEmail = `ui_user_${timestamp}@samvada.io`;
    console.log(`[1] Navigating to http://localhost:5173/login with email: ${testEmail}`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    // Step 1: Login
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    console.log('    Filled email. Clicking Get Started...');
    await page.locator('button:has-text("Get Started")').click();

    // Step 2: OTP screen
    console.log('    Waiting for OTP screen...');
    await page.waitForSelector('input[data-otp-index="0"], input[type="text"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    console.log('    Entering OTP: 000000');
    const otpInputs = page.locator('input[data-otp-index]');
    const count = await otpInputs.count();
    if (count === 6) {
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill('0');
      }
    } else {
      // Fallback
      await page.keyboard.type('000000');
    }

    console.log('    Clicking Verify & Continue...');
    await page.locator('button:has-text("Verify & Continue")').click();

    // Step 3: Redirect to /onboarding/profile (Step 1 of Onboarding)
    console.log('    Waiting for /onboarding/profile...');
    await page.waitForURL('**/onboarding/profile', { timeout: 15000 });
    await page.waitForTimeout(1000); // Allow fade-in animation to complete

    const step1ScreenshotPath = path.resolve('d:/Voice AI', 'ui_step1_profile.png');
    await page.screenshot({ path: step1ScreenshotPath, fullPage: true });
    console.log(`[2] Step 1 (/onboarding/profile) reached! Screenshot saved to: ${step1ScreenshotPath}`);

    // Verify Step 1 elements
    const heading1 = await page.locator('h1').textContent();
    console.log(`    Step 1 Heading: "${heading1.trim()}"`);

    // Fill form
    await page.locator('#first-name-input').fill('Yash');
    await page.locator('#last-name-input').fill('Jaiswal');
    await page.locator('#business-toggle-btn').click();
    await page.locator('#org-name-input').fill('Samvada Enterprise');
    await page.locator('#workspace-name-input').fill('Default workspace');

    const step1FilledScreenshotPath = path.resolve('d:/Voice AI', 'ui_step1_profile_filled.png');
    await page.screenshot({ path: step1FilledScreenshotPath, fullPage: true });
    console.log(`    Form filled! Screenshot saved to: ${step1FilledScreenshotPath}`);

    console.log('    Clicking Continue...');
    await page.locator('#continue-btn').click();

    // Step 4: Redirect to /onboarding/industries (Step 2 of Onboarding)
    console.log('    Waiting for /onboarding/industries...');
    await page.waitForURL('**/onboarding/industries', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const step2ScreenshotPath = path.resolve('d:/Voice AI', 'ui_step2_industries.png');
    await page.screenshot({ path: step2ScreenshotPath, fullPage: true });
    console.log(`[3] Step 2 (/onboarding/industries) reached! Screenshot saved to: ${step2ScreenshotPath}`);

    const heading2 = await page.locator('h1').textContent();
    console.log(`    Step 2 Heading: "${heading2.trim()}"`);

    // Select industries
    console.log('    Selecting 2 industries: Technology & SaaS and Healthcare & Medical...');
    await page.locator('#industry-chip-technology---saas').click();
    await page.locator('#industry-chip-healthcare---medical').click();
    await page.waitForTimeout(500);

    const step2SelectedScreenshotPath = path.resolve('d:/Voice AI', 'ui_step2_industries_selected.png');
    await page.screenshot({ path: step2SelectedScreenshotPath, fullPage: true });
    console.log(`    Industries selected! Screenshot saved to: ${step2SelectedScreenshotPath}`);

    // Click "Lets get started →"
    console.log('    Clicking Lets get started →...');
    await page.locator('#lets-get-started-btn').click();

    // Step 5: Redirect to /home
    console.log('    Waiting for /home...');
    await page.waitForURL('**/home', { timeout: 15000 });
    await page.waitForTimeout(1500);

    const step3HomeScreenshotPath = path.resolve('d:/Voice AI', 'ui_step3_home.png');
    await page.screenshot({ path: step3HomeScreenshotPath, fullPage: true });
    console.log(`[4] Onboarding Complete! Redirected to: ${page.url()}`);
    console.log(`    Home Dashboard screenshot saved to: ${step3HomeScreenshotPath}`);

    console.log('==================================================');
    console.log('>>> UI ONBOARDING TEST PASSED COMPLETELY! <<<');
    console.log('==================================================');

  } catch (error) {
    console.error('UI Test Error:', error);
    const errScreenshotPath = path.resolve('d:/Voice AI', 'ui_error.png');
    await page.screenshot({ path: errScreenshotPath, fullPage: true }).catch(() => {});
    console.log(`Saved error screenshot to: ${errScreenshotPath}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
