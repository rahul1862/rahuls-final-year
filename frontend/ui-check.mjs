import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = [];
  await page.route('**/api/**', route => {
    const request = route.request();
    logs.push({ url: request.url(), method: request.method(), headers: request.headers() });
    route.continue();
  });
  await page.goto('http://127.0.0.1:5175/');
  await page.click('text=Sign in');
  await page.fill('#login-email', 'ui-test-' + Date.now() + '@example.com');
  await page.fill('#login-password', 'secret123');
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(3000);
  await browser.close();
  console.log(logs.length, JSON.stringify(logs.slice(0, 5), null, 2));
})();
