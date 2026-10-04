const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    let errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push('CONSOLE ERROR: ' + msg.text());
        }
    });
    page.on('pageerror', err => {
        errors.push('PAGE ERROR: ' + err.toString());
    });
    
    console.log("Navigating to /app...");
    await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle0' });
    
    // Check if the page loaded successfully without blanking out
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.length < 500) {
         errors.push('App may have crashed (body is too small).');
    }
    
    if (errors.length > 0) {
        console.log("Found errors:");
        errors.forEach(e => console.log(e));
    } else {
        console.log("No frontend errors detected! UI is stable.");
    }
    
    await browser.close();
})();
