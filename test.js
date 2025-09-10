// test.js

require('chromedriver'); // Ensure ChromeDriver is loaded

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

let driver;

// Setup before all tests
before(async function () {
  this.timeout(20000);

  const options = new chrome.Options();
  options.addArguments(
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1920,1080'
  );

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
});

// Cleanup after all tests
after(async function () {
  if (driver) {
    await driver.quit();
    console.log('✅ Chrome closed');
  }
});

// Utility to sanitize filenames
function sanitizeName(title) {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
}

// Attach screenshot to Mochawesome report
async function attachScreenshot(ctx) {
  const title = ctx?.test?.title || 'screenshot';
  const screenshot = await driver.takeScreenshot();
  const screenshotDir = path.resolve('mochawesome-report/screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const fileName = sanitizeName(title);
  const filePath = path.join(screenshotDir, fileName);
  fs.writeFileSync(filePath, screenshot, 'base64');

  // Embed in Mochawesome report
  if (ctx && ctx.test) {
    ctx.test.context = `![Screenshot](screenshots/${fileName})`;
  }
}

// Test suite
describe('Selenium Multi-Step Test with Mochawesome Screenshots', function () {
  this.timeout(30000); // increase if needed for slower CI

  it('Step 1: Open homepage', async function () {
    await driver.get('https://theysaidso.com');
    await attachScreenshot(this);
  });

  it('Step 2: Scroll down', async function () {
    await driver.executeScript('window.scrollBy(0, 1000)');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await attachScreenshot(this);
  });

  it('Step 3: Scroll to top', async function () {
    await driver.executeScript('window.scrollTo(0, 0)');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await attachScreenshot(this);
  });

  it('Step 4: Get title', async function () {
    const title = await driver.getTitle();
    console.log('Page Title:', title);
    await attachScreenshot(this);
  });

  it('Step 5: Hover over footer', async function () {
    try {
      const footer = await driver.findElement(By.css('footer'));
      await driver.executeScript('arguments[0].scrollIntoView(true);', footer);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await attachScreenshot(this);
    } catch (err) {
      console.log('⚠️ Footer not found.');
    }
  });

  it('Step 6: Final screenshot', async function () {
    await attachScreenshot(this);
  });
});
