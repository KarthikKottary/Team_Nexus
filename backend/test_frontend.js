const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating to http://localhost:5173/auth...');
  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log('Page body contains elements:', content.includes('Quick Demo Logins'));
  
  await browser.close();
})();
