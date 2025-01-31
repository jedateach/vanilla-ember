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
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`\x1b[31m[BROWSER LOG]: ${text}\x1b[0m`); // Red color for errors
      consoleErrorDetected = true;
    } else {
      console.log(`\x1b[32m[BROWSER LOG]: ${text}\x1b[0m`); // Green color for other logs
    }
  });

  page.on('pageerror', error => {
    console.error('\x1b[31m[PAGE ERROR]:', error.message, '\x1b[0m');
    console.error('\x1b[31m', error.stack, '\x1b[0m'); // Red color for errors
    consoleErrorDetected = true;
  });

  await page.goto('http://localhost:4200/');

  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for logs

  const domContent = await page.content();
  console.log('\x1b[34m[DOM CONTENT]:', domContent, '\x1b[0m'); // Blue color for DOM content

  const metrics = await page.metrics();
  console.log('\x1b[34m[PAGE METRICS]:', metrics, '\x1b[0m'); // Blue color for metrics

  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  console.log('\x1b[34m[PERFORMANCE TIMING]:', performanceTiming, '\x1b[0m'); // Blue color for performance timing

  await browser.close();

  if (consoleErrorDetected) {
    console.log('\x1b[31m[ERROR]: Console error detected. Exiting with status code 1.\x1b[0m');
    process.exit(1);
  }
})();
