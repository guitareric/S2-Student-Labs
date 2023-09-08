const puppeteer = require('puppeteer-extra')
const csv = require('csvtojson') // Make sure you have this line in order to call functions from this modules
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, 'process.env') })

async function S2() {
  const csvFilePath = 'Student Labs - Students.csv' // Resource.csv in your case
  const users = await csv()
    .fromFile(csvFilePath)
    .then(jsonObj => {
      return jsonObj
    })

  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    slowMo: 30,
    args: ['--window-size=800,600', '--disable-gpu', '--disable-features=IsolateOrigins,site-per-process', '--blink-settings=imagesEnabled=true'],
  })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation()
  const yOffset = -17

  // Make S2 account

  await page.goto('https://155.98.92.189/frameset/')
  await page.waitForSelector('#username')
  await page.type('#username', process.env.S2_USERNAME)
  await page.type('#password', process.env.S2_PASSWORD)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(4000)

  // begin loop and initialize variables
  var elementHandle = await page.waitForSelector('#mainFrame')
  var frame = await elementHandle.contentFrame()
  elementHandle = await frame.waitForSelector('#innerPageFrame')
  frame = await elementHandle.contentFrame()
  await page.waitForTimeout(3000)

  for (const user of users) {
    if (!user['Badge Printed and S2 Set']) {
      // check to see if student to member
      // Student Lab Access
      await page.goto('https://155.98.92.189/frameset/')
      await page.waitForTimeout(2000)
      elementHandle = await page.waitForSelector('#mainFrame')
      frame = await elementHandle.contentFrame()
      await frame.waitForSelector('#topbaradmin')
      await frame.click('#topbaradmin')
      await frame.waitForSelector('#PplAdd')
      await frame.click('#PplAdd')
      await page.waitForTimeout(2000)
      elementHandle = await frame.waitForSelector('#innerPageFrame')
      await page.waitForTimeout(1000)
      frame = await elementHandle.contentFrame()
      await page.waitForTimeout(1000)
      await frame.waitForSelector('#lastname')
      await frame.type('#lastname', user['Last Name'])
      await frame.type('#firstname', user['First Name'])
      await frame.waitForSelector('#expirationdate_date')
      if (user['Member Type'] === 'Student Lab') {
        await frame.type('#expirationdate_date', `${user['Reading Day']} 00:00`, { delay: 100 })
      } else {
        await frame.type('#expirationdate_date', '10/01/2024 00:00', { delay: 100 })
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      await frame.click('#tab-credentialtab')
      await frame.waitForSelector('#addcredential')
      await frame.click('#addcredential')
      await frame.waitForSelector('#encodednumber0')
      await frame.type('#encodednumber0', user['Prox Code on the back of Ucard (XXXXXX)'])
      await frame.click('#tab-accesstab')

      // Student Lab Access
      if (user['Member Type'] === 'Student Lab') {
        await frame.waitForSelector('#\\36 1 > td:nth-child(3)')
        await frame.click('#\\36 1 > td:nth-child(3)')
        await frame.waitForSelector('#\\37 7 > td:nth-child(3)')
        await frame.click('#\\37 7 > td:nth-child(3)')
      }

    
      await page.waitForTimeout(300)
      await frame.click('#uparrow')
      await page.waitForTimeout(500)
      await page.waitForTimeout(500)
      await frame.click('#save')
      await page.waitForTimeout(3000)
      console.log(`${user['First Name']} ${user['Last Name']} S2 account created`)
    }
  }
  await browser.close()
}

module.exports = { S2: S2 }
