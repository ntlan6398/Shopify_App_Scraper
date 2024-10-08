import puppeteer from "puppeteer";
import { connectToDatabase } from "./db/index.js";
const db = connectToDatabase();
const countries = {
  AF: "Afghanistan",
  AL: "Albania",
  DZ: "Algeria",
  AD: "Andorra",
  AO: "Angola",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BT: "Bhutan",
  BO: "Bolivia",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BR: "Brazil",
  BN: "Brunei",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  CV: "Cabo Verde",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  KM: "Comoros",
  CD: "Congo (Democratic Republic)",
  CG: "Congo (Republic)",
  CR: "Costa Rica",
  HR: "Croatia",
  CU: "Cuba",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  SZ: "Eswatini",
  ET: "Ethiopia",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GR: "Greece",
  GD: "Grenada",
  GT: "Guatemala",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  HN: "Honduras",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran",
  IQ: "Iraq",
  IE: "Ireland",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KP: "North Korea",
  KR: "South Korea",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Laos",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MR: "Mauritania",
  MU: "Mauritius",
  MX: "Mexico",
  FM: "Micronesia",
  MD: "Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NL: "Netherlands",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  MK: "North Macedonia",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PL: "Poland",
  PT: "Portugal",
  QA: "Qatar",
  RO: "Romania",
  RU: "Russia",
  RW: "Rwanda",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  VC: "Saint Vincent and the Grenadines",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome and Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  SS: "South Sudan",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syria",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela",
  VN: "Vietnam",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

async function getAppDetails(browser, appLink, errorLink) {
  const page = await browser.newPage();
  async function errorHandler(error) {
    console.log("🚀 error:", error);
    await db.collection("errorLinks").insertOne({ ...errorLink, error });
    await page.close();
  }
  if (!appLink.startsWith("https://apps.shopify.com")) {
    const error = "not app page";
    await errorHandler(error);
    return;
  }
  await page.goto(appLink, { waitUntil: ["domcontentloaded", "networkidle0"] });
  const title = await page.$("h1");
  if (!title) {
    const error = "not include title";
    await errorHandler(error);
    return;
  }
  const appName = await (await title?.getProperty("textContent"))?.jsonValue();
  const detailSection = await page.$("#app-details");
  if (!detailSection) {
    const error = "not include detailSection";
    await errorHandler(error);
    return;
  }
  const description = await detailSection.$("h2");
  const appDescription = await (
    await description?.getProperty("textContent")
  )?.jsonValue();
  const reviewSection = await page.$("#adp-reviews");
  if (!reviewSection) {
    const error = "not include reviewSection";
    await errorHandler(error);
    return;
  }
  const reviews = await reviewSection.$("h2");
  const reviewsCount = await reviews.$$("span");
  const reviewCountNumber = await (
    await reviewsCount[1]?.getProperty("textContent")
  )?.jsonValue();
  const appReviewsMetrics = await reviewSection.$(".app-reviews-metrics");
  const divList = await appReviewsMetrics.$$("div");
  const rating = await (
    await divList[2]?.getProperty("textContent")
  )?.jsonValue();
  const developerSection = await page.$("#adp-developer");
  if (!developerSection) {
    const error = "not include developerSection";
    await errorHandler(error);
    return;
  }
  const email = await page.evaluate((obj) => {
    return obj?.getAttribute("data-developer-support-email");
  }, developerSection);
  const divDeveloperSection = await developerSection.$$("div.tw-grid");
  const aDeveloper = await divDeveloperSection[0].$$("a");
  const developer = await (
    await aDeveloper[0]?.getProperty("textContent")
  )?.jsonValue();
  const website =
    (await (await aDeveloper[1]?.getProperty("href"))?.jsonValue()) || "";
  const pDeveloper = await divDeveloperSection[0].$("p");
  const location = await (
    await pDeveloper?.getProperty("textContent")
  )?.jsonValue();
  const pLaunch = await divDeveloperSection[2].$$("p");
  const launchedDate = await (
    await pLaunch[1]?.getProperty("textContent")
  )?.jsonValue();
  const pricingSection = await page.$("#adp-pricing");
  if (!pricingSection) {
    console.log("not include pricingSection");
    await errorHandler();
    return;
  }
  const h3Pricing = await pricingSection.$$("h3");
  let price;
  if (h3Pricing.length === 0) {
    price = "Free";
  } else if (h3Pricing.length === 1) {
    const span = await h3Pricing[0].$("span");
    price = await (await span?.getProperty("textContent"))?.jsonValue();
  } else {
    const spanMin = await h3Pricing[0].$("span");
    const spanMax = await h3Pricing[h3Pricing.length - 1].$("span");
    const min = await (await spanMin?.getProperty("textContent"))?.jsonValue();
    const max = await (await spanMax?.getProperty("textContent"))?.jsonValue();
    price = `${min.trim()} - ${max.trim()}`;
  }
  await page.close();

  const appDetail = {
    name: appName?.trim(),
    description: appDescription?.trim(),
    reviewCount: parseInt(reviewCountNumber?.trim()?.slice(1, -1)) || 0,
    rating: rating?.trim(),
    email: email?.trim(),
    developer: developer?.trim(),
    website: website?.trim(),
    location: location?.trim(),
    country: countries[location?.slice(-2)] || location?.slice(-2),
    launchedDate: launchedDate?.replace(/\s+/g, "")?.replace("·Changelog", ""),
    price: price?.trim(),
    link: appLink,
    category: errorLink?.category,
    subCategory: errorLink?.subCategory,
  };
  await db.collection("App").insertOne(appDetail);
}
async function main() {
  for (let i = 1; i > 0; i++) {
    const appLink = await db.collection("errorLinks").findOne();
    console.log("🚀 ~ main ~ appLink:", appLink);
    const link = appLink.errorLink;
    const id = appLink._id;
    await db.collection("errorLinks").deleteOne({ _id: id });
    const browser = await puppeteer.launch();
    await getAppDetails(browser, link, appLink);
    await browser.close();
  }
}
main();
