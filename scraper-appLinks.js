import puppeteer from "puppeteer";
import { connectToDatabase } from "./db/index.js";
const db = connectToDatabase();

async function getAppLinks(browser, category) {
  const page = await browser.newPage();
  await page.goto(category.link, { waitUntil: "networkidle0" });
  const appContent = await page.$("#app_grid-content");
  const pagiControl = await appContent.$("#pagination_controls");
  const aList = await pagiControl.$$("a");
  let pagiCount = 0;
  for (let i = 0; i < aList.length; i++) {
    const text = await (await aList[i].getProperty("textContent")).jsonValue();
    if (parseInt(text.trim())) {
      pagiCount = parseInt(text);
    }
  }
  await page.close();
  for (let i = 0; i < pagiCount; i++) {
    const page = await browser.newPage();
    await page.goto(`${category.link}&page=${i + 1}`, {
      waitUntil: "networkidle0",
    });
    const appContent = await page.$("#app_grid-content");
    const appGrid = await appContent.$("#app_grid");
    const appContainer = await appGrid.$("div");
    const appALinks = await appContainer.$$("a");
    for (let j = 0; j < appALinks.length; j++) {
      const link = await (await appALinks[j].getProperty("href")).jsonValue();
      await db.collection("Link").insertOne({
        link,
        category: category.category,
        subCategory: category.subCategory,
      });
    }
    await page.close();
  }
}

(async () => {
  const browser = await puppeteer.launch();
  const categories = await db.collection("Categories").find().toArray();
  console.log("🚀 ~ categories:", categories);
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].template === 1) {
      await getAppLinks(browser, categories[i]);
    }
  }
  await browser.close();
})();
