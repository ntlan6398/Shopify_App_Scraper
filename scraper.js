import { connectToDatabase } from "./db/index.js";
import puppeteer from "puppeteer";
const db = connectToDatabase();
async function getCategories(browser) {
  const mainCategories = [];
  const page = await browser.newPage();
  await page.goto("https://apps.shopify.com/");
  const megaMenu = await page.$("#AppStoreMegamenu");
  const categories = [];
  const ul = await megaMenu.$("ul");
  const aList = await ul.$$("a");
  const spanList = await ul.$$("span");

  for (let i = 0; i < aList.length; i++) {
    const text = await (
      await spanList[i].getProperty("textContent")
    ).jsonValue();
    const url = await (await aList[i].getProperty("href")).jsonValue();
    categories.push({
      category: text.trim(),
      link: url,
    });
  }
  await page.close();

  for (let i = 0; i < categories.length; i++) {
    const page = await browser.newPage();
    await page.goto(categories[i].link, { waitUntil: "networkidle0" });
    const section = await page.$("section.modular-page-section");
    const childSection = await section.$("section");
    const aList = await childSection.$$("a");
    const subCategories = [];
    for (let j = 0; j < aList.length; j++) {
      const text = await (
        await aList[j].getProperty("textContent")
      ).jsonValue();
      const url = await (await aList[j].getProperty("href")).jsonValue();
      subCategories.push({
        category: categories[i].category,
        subCategory: text.trim(),
        link: url,
      });
    }
    subCategories.splice(0, subCategories.length / 2);
    for (let j = 0; j < subCategories.length; j++) {
      mainCategories.push(subCategories[j]);
    }

    await page.close();
  }
  console.log("mainCategories", mainCategories);
  console.log("mainCategories.length", mainCategories.length);
  return mainCategories;
}
async function classifyCategories(browser, link, category, categories) {
  const page = await browser.newPage();
  await page.goto(link, { waitUntil: "networkidle0" });
  const appContainer = await page.$("#app_grid-content");
  const section = await page.$("section.modular-page-section");
  const childenSections = await section.$$("section");
  const _2ndChildSection = childenSections[1];
  const aList = await _2ndChildSection.$$("a");
  if (appContainer !== null) {
    categories.template1.push(category);
  } else {
    if (aList.length === 0) {
      categories.template2.push(category);
    } else {
      categories.template3.push(category);
    }
  }
  await page.close();
}

function cleanCategories(categories) {
  const link1 = [];
  const repeatlink1 = [];
  const link2 = [];
  const repeatlink2 = [];
  const newCategories = {
    template1: [],
    template2: [],
  };
  for (let i = 0; i < categories.template1.length; i++) {
    if (!link1.includes(categories.template1[i].link)) {
      link1.push(categories.template1[i].link);
      newCategories.template1.push(categories.template1[i]);
    } else {
      repeatlink1.push(categories.template1[i].link);
    }
  }
  for (let i = 0; i < categories.template2.length; i++) {
    if (!link2.includes(categories.template2[i].link)) {
      link2.push(categories.template2[i].link);
      newCategories.template2.push(categories.template2[i]);
    } else {
      repeatlink2.push(categories.template2[i].link);
    }
  }
  return newCategories;
}
async function main(browser) {
  const categories = {
    template1: [],
    template2: [],
    template3: [],
  };
  const mainCategories = await getCategories(browser);
  for (let i = 0; i < mainCategories.length; i++) {
    await classifyCategories(
      browser,
      mainCategories[i].link,
      mainCategories[i],
      categories
    );
  }
  do {
    const category3 = categories.template3[0];
    categories.template3.shift();
    const page = await browser.newPage();
    await page.goto(category3.link, {
      waitUntil: "networkidle0",
    });
    const section = await page.$("section.modular-page-section");
    const childenSections = await section.$$("section");
    const _2ndChildSection = childenSections[1];
    const aList = await _2ndChildSection.$$("a");
    for (let i = 0; i < aList.length; i++) {
      const link = await (await aList[i].getProperty("href")).jsonValue();
      const title = await (
        await aList[i].getProperty("textContent")
      ).jsonValue();
      const newCategory = {
        ...category3,
        link: link,
        subCategory: category3["subCategory"] + " - " + title.trim(),
      };
      console.log("newCategory", newCategory);
      await classifyCategories(browser, link, newCategory, categories);
    }
    await page.close();
  } while (categories.template3.length > 0);
  const cleanedCategories = cleanCategories(categories);
  for (let i = 0; i < cleanedCategories.template1.length; i++) {
    await db
      .collection("Categories")
      .insertOne({ ...cleanedCategories.template1[i], template: 1 });
  }
  for (let i = 0; i < cleanedCategories.template2.length; i++) {
    await db
      .collection("Categories")
      .insertOne({ ...cleanedCategories.template2[i], template: 2 });
  }
}

(async () => {
  const browser = await puppeteer.launch();
  await main(browser);
  await browser.close();
})();
