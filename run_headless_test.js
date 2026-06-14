const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = { console: [], requests: [], responses: [], errors: [] };

  page.on('console', msg => {
    logs.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => logs.errors.push(String(err)));
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/proxy/') || url.includes('apiservice.mol.gov.tw') || url.includes('api/moenv')) {
      logs.requests.push({ url, method: req.method() });
    }
  });
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/proxy/') || url.includes('apiservice.mol.gov.tw') || url.includes('api/moenv')) {
      let text = '';
      try { text = await res.text(); } catch (e) { text = '<<unable to read body>>'; }
      logs.responses.push({ url, status: res.status(), contentType: res.headers()['content-type'], bodyPreview: text.slice(0,300) });
    }
  });

  try {
    await page.goto('http://127.0.0.1:8001/pages/Portfolio.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    // Click API02 link
    await page.click('a[target="apiContent"]:has-text("API02")');
    // Wait for iframe to load
    const frame = await page.frame({ name: 'apiContent' });
    if (!frame) {
      logs.errors.push('iframe apiContent not found');
    } else {
      // wait for network activity and for #row to appear or some timeout
      try {
        await frame.waitForSelector('#row', { timeout: 8000 });
        // wait a bit for AJAX to populate
        await page.waitForTimeout(2000);
        const rowCount = await frame.$$eval('#row tr', trs => trs.length);
        logs.frameRowCount = rowCount;
      } catch (e) {
        logs.errors.push('frame selector wait error: ' + String(e));
      }
    }
  } catch (e) {
    logs.errors.push('page navigation error: ' + String(e));
  }

  console.log('RESULT_JSON_START');
  console.log(JSON.stringify(logs, null, 2));
  console.log('RESULT_JSON_END');

  await browser.close();
})();
