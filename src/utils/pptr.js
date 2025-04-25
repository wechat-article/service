import puppeteer from "puppeteer";

const browser = await puppeteer.launch();
const page = await browser.newPage();

// await browser.close();

// http://localhost:8080/2024-02-28/第三回小道具勾引成功一触便泄小美女兴奋追高被绿帽反扣/index.html
export async function generatePDf(url, filepath) {
  await page.goto(url);
  await page.pdf({
    path: filepath,
  });
}
