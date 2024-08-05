const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let jsonResponse = null;

    let haveResponse = false;

    let wordOfTheDay = "";

    page.on('response', async (response) => {
        if (!haveResponse) {
            const url = response.url()
            const contentType = response.headers()['content-type'];

            if (contentType && contentType.includes('application/json') && url.includes('.json')) {
                try {
                    jsonResponse = await response.json();
                    wordOfTheDay = jsonResponse.solution;
                    haveResponse = true;
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });


    await page.goto('https://www.nytimes.com/games/wordle/index.html');

    await page.setViewport({width: 1080, height: 1500});

    await page.locator('text/Play').click();

    await page.waitForFunction(() => window.wordOfTheDay !== "", { timeout: 10000 });

    const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

    await delay(1500);

    await page.evaluate(() => {
        document.getElementsByClassName('Modal-module_closeIcon__TcEKb')[0].click();
    })

    await delay(1000);


    for (let i = 0; i < wordOfTheDay.length; i++) {
        await page.evaluate((key) => {
            document.querySelectorAll('[data-key="' + key + '"]')[0].click();
        }, wordOfTheDay.charAt(i));

        await delay(100);
    }

    await page.evaluate(() => {
        document.querySelectorAll('[data-key="↵"]')[0].click();
    });

    await delay(5000);

    await browser.close();
})();