const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type().toUpperCase(), msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
        
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 5000 });
        
        // Evaluate if element sizes exist
        const sizes = await page.evaluate(() => {
            const canvas = document.getElementById('antigravity-hero');
            return {
                heroCanvasHeight: canvas ? canvas.clientHeight : null,
                threeMeshExists: typeof THREE !== 'undefined'
            };
        });
        console.log('DOM SIZES:', JSON.stringify(sizes));

        await browser.close();
    } catch (err) {
        console.log('PUPPETEER SCRIPT ERROR:', err.message);
    }
})();
