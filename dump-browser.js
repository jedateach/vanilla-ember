const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-logging',
      '--v=1',
    ],
  });

  const page = await browser.newPage();
  let consoleErrorDetected = false;

  page.on('console', (msg) => {
    console.log(`[BROWSER LOG]: ${msg.text()}`);
    if (msg.type() === 'error') {
      consoleErrorDetected = true;
    }
  });

  page.on('pageerror', error => {
    console.error('[PAGE ERROR]:', error.message);
    console.error(error.stack); // Output the full stack trace
    consoleErrorDetected = true;
  });

  await page.goto('http://localhost:4200/');

  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for logs

  const domContent = await page.content();
  console.log('[DOM CONTENT]:', domContent);

  const metrics = await page.metrics();
  console.log('[PAGE METRICS]:', metrics);

  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  console.log('[PERFORMANCE TIMING]:', performanceTiming);

  await browser.close();

  if (consoleErrorDetected) {
    process.exit(1);
  }
})();
