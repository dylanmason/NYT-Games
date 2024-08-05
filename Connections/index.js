const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let jsonResponse = null;
    let solution = [];
    let haveResponse = false;

    page.on('response', async (response) => {
        if (!haveResponse) {
            const url = response.url();
            const contentType = response.headers()['content-type'];

            if (contentType && contentType.includes('application/json') && url.includes('.json')) {
                try {
                    jsonResponse = await response.json();
                    solution = jsonResponse.categories.map((category) => category);
                    haveResponse = true;
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });

    const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

    await page.goto('https://www.nytimes.com/games/connections');

    try {
        await page.locator('text=Play').click();
    } catch (err) {
        console.error('Failed to select the play button: ', err);
    }

    await delay(2000);

    async function selectWord(position) {
        const selector = `label[for="inner-card-${position}"]`;
        try {
            await page.hover(selector);
            await page.click(selector);
        } catch (error) {
            console.error(`Error clicking label for inner-card-${position}: ${error}`);
        }
    }

    async function selectSubmit() {
        try {
            await page.evaluate(() => {
                document.querySelector('[data-testid="submit-btn"]').click();
            })
        } catch (error) {
            console.error('Error clicking submit button');
        }
    }

    await page.waitForSelector('[id="inner-card-0"]');

    for (let i = 0; i < solution.length; i++) {
        for (let j = 0; j < solution[i].cards.length; j++) {
            await selectWord(solution[i].cards[j].position);
        }
        await selectSubmit();
        await delay(3000);
    }

    await browser.close();
})();
