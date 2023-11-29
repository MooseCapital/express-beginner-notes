const validator = require('validator');
const knex = require('../db');
const puppeteer = require('puppeteer');


const test = (async (req, res) => {
    const numId = Number(req.params.id);
    const id = req.params.id;
    const page = req.query.page || 0;   // normalize it with req.query.name.toLowerCase() if query is text
    const rowsPerPage = 10;
    try {
        // if (!validator.isUUID(id, [4])) {
        //   return res.status(500).json({msg: 'that is the wrong id'})
        // }

        // const data = await knex('')
        // console.table(data)

        // res.status(200).json(data)
        console.log(req.ip)
        res.status(200).json({msg: 'hello world'})
    }
    catch (e) {
        console.log(e)
        res.status(500).json({error: 'could not fetch'})
    }
})

const pup = (async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto('https://developer.chrome.com/');

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box
    await page.type('.search-box__input', 'automate beyond recorder');

    // Wait and click on first result
    const searchResultSelector = '.search-box__link';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
        'text/Customize and automate'
    );
    const fullTitle = await textSelector?.evaluate(el => el.textContent);

    // Print the full title
    console.log('The title of this blog post is "%s".', fullTitle);

    await browser.close();
});



const scrapeJackpot = (async (req, res) => {
    try {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        // scrape jackpot number
            await page.goto('https://www.mslottery.com/games/mm5/');
            await page.setViewport({width: 1080, height: 1024});
            const jackpotElement = await page.waitForSelector('.currentjackpot-number', { visible: true });
            await page.waitForNetworkIdle({ idleTime: 3000 })
            const jackpotDataString = await jackpotElement?.evaluate((el) => el.textContent)
            let regex = /\d+/g;  // \d+ matches one or more digits
            let jackpotNumString = jackpotDataString.match(regex);
            let jackpotNumber = Number(jackpotNumString[0]) * 1000;
            console.log({jackpot_number: jackpotNumber});
            await page.waitForTimeout(3000);

        //scrape winners
            await page.goto('https://www.mslottery.com/browse-winning-numbers/?game=mm5');
            await page.setViewport({width: 1080, height: 1024});
            const openButtonWait = await page.waitForSelector('.col-winners .open', { visible: true });
            await page.waitForNetworkIdle({ idleTime: 3000 })
            page.click('.col-winners .open', clickOptions)


        // const data = await knex('')
        // console.table(data)
        await browser.close();
        return res.status(200).json({msg: `the jackpot is: ${jackpotNumber}`})
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({error: 'could not fetch'})
    }
})

const scrapeWinners = (async (req, res) => {
    try {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        await page.goto('https://www.mslottery.com/browse-winning-numbers/?game=mm5');
        await page.setViewport({width: 1080, height: 1024});
        const jackpotElement = await page.waitForSelector('.currentjackpot-number');
        const jackpotDataString = await jackpotElement?.evaluate((el) => el.textContent)
        let regex = /\d+/g;  // \d+ matches one or more digits
        let jackpotNumString = jackpotDataString.match(regex);
        let jackpotNumber = Number(jackpotNumString[0]) * 1000;

        console.log(typeof jackpotNumber);
        console.log({jackpot: jackpotNumber});

        // const data = await knex('')
        // console.table(data)
        await browser.close();
        return res.status(200).json({msg: `the jackpot is: ${jackpotNumber}`})
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({error: 'could not fetch'})
    }
})


module.exports = {test, scrapeJackpot, scrapeWinners}