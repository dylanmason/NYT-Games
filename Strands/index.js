const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let jsonResponse = null;
    let themeWords = null;
    let haveResponse = false;

    page.on('response', async (response) => {
        if (!haveResponse) {
            const url = response.url();
            const contentType = response.headers()['content-type'];

            if (contentType && contentType.includes('application/json') && url.includes('.json')) {
                try {
                    jsonResponse = await response.json();
                    themeWords = jsonResponse.themeWords;
                    themeWords.push(jsonResponse.spangram);
                    haveResponse = true;
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });

    console.time('Total Execution Time');

    await page.goto('https://nytimes.com/games/strands');

    await page.setViewport({ width: 1080, height: 1024 });

    const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

    await delay(500);

    try {
        await page.locator('.Feo8La_playButton').click();
    } catch (err) {
        console.error('Failed to select the play button: ', err);
    }

    await delay(500);

    await page.locator('.ygtU9G_closeX').click();
    await page.waitForSelector('.pRjvKq_item');

    async function getLetters() {
        let buttons = await page.$$eval('.pRjvKq_item', buttons => buttons.map(button => ({
            id: button.id,
            text: button.textContent,
            style: button.getAttribute('style')
        })));

        let letters = [];
        let index = 0;

        for (let i = 0; i < 8; i++) {
            letters[i] = [];
            for (let j = 0; j < 6; j++) {
                if (buttons[index].style && buttons[index].style.includes('background-color: var(--blue);')) {
                    buttons[index].text = null;
                }
                letters[i][j] = buttons[index];
                index += 1;
            }
        }

        return letters;
    }

    let letters = await getLetters();
    let iterations = 0;

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    function isValid(x, y, targetChar, visited) {
        return x >= 0 && x < letters.length && y >= 0 && y < letters[0].length && letters[x][y].text === targetChar && !visited[x][y] && letters[x][y].text !== null;
    }

    async function clickButton(id) {
        await page.evaluate((id) => {
            const button = document.getElementById(id);
            if (button) {
                button.click();
                return true;
            }
            return false;
        }, id);
    }

    async function dfs(x, y, visited, currentWord, targetWord, index, trace) {
        iterations += 1;
        index += 1;
        visited[x][y] = true;
        currentWord += letters[x][y].text;
        trace.push({ x: x, y: y });

        if (letters[x][y].id) {
            await clickButton(letters[x][y].id);
        }

        if (currentWord === targetWord) {
            await clickButton(letters[x][y].id);
            letters = await getLetters();
            return true;
        }

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (isValid(newX, newY, targetWord.charAt(index), visited)) {
                if (await dfs(newX, newY, visited, currentWord, targetWord, index, trace)) {
                    return true;
                }
            }
        }


        if (letters[x][y].id) {
            await clickButton(letters[x][y].id);
        }

        // Backtrack: Deselect the letter
        visited[x][y] = false;
        trace.pop();

        if (trace.length > 0) {
            for (let i = 0; i < trace.length; i++) {
                await clickButton(letters[trace[i].x][trace[i].y].id);
            }
        }

        return false;
    }

    async function findAllWords() {
        const visited = Array.from({ length: letters.length }, () => Array(letters[0].length).fill(false));

        for (let word = 0; word < themeWords.length; word++) {
            let found = false;
            for (let i = 0; i < letters.length && !found; i++) {
                for (let j = 0; j < letters[0].length && !found; j++) {
                    if (letters[i][j].text === themeWords[word].charAt(0)) {
                        if (await dfs(i, j, visited, '', themeWords[word], 0, [])) {
                            found = true;
                        }
                    }
                }
            }
        }
    }

    await findAllWords();

    console.timeEnd('Total Execution Time');

    // Comment the line below out if you don't care about seeing the results
    await delay(2000);

    await browser.close();
})();
