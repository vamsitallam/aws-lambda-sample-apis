var http = require("http");
const compareImages = require("resemblejs/compareImages");
const fs = require("mz/fs");
const puppeteer = require("puppeteer"); // Require Puppeteer module

const fixtureData = require("./fixtures.json");

// module.exports.visualTestDifference = async (event) => {
//   if (event.httpMethod == "GET") {
//   }
// };
const addCSStoHTML =
  "<head>\n" + " " + "<style>\n" + fixtureData.css_code + "\n</style>";

const appendCSSCodeToHTML = fixtureData.html_code.replace(
  "<head>\n",
  addCSStoHTML
);
const addJStoHTMLAndCSS =
  "<script>\n" + fixtureData.js_code + "\n</script>" + "\n</body>";

const appendJSCodeToHTMLAndCSS = appendCSSCodeToHTML.replace(
  "\n</body>",
  addJStoHTMLAndCSS
);

var server = http.createServer(function (req, res) {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(appendJSCodeToHTMLAndCSS);
});

server.listen(5000); //3 - listen for any incoming requests

console.log("Node.js web server at port 5000 is running..");

const screenShot = async (url, path) => {
  // Define Screenshot function

  const browser = await puppeteer.launch(); // Launch a "browser"

  const page = await browser.newPage(); // Open a new page

  await page.goto(url); // Go to the website

  await page.screenshot({
    path: path, // Save the screenshot in current directory
    fullPage: true, // take a fullpage screenshot
  });

  await page.close(); // Close the website
  await browser.close(); // Close the browser
};

async function getDiff(expectedPath, actualPath) {
  const options = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
      outputDiff: true,
    },
    scaleToSameSize: true,
    ignore: "antialiasing",
  };

  const data = await compareImages(
    await fs.readFile(actualPath),
    await fs.readFile(expectedPath),
    options
  );
  return data.misMatchPercentage;
}

var generateScreenshotAndCalculateDiff = async () => {
  const url = "http://localhost:5000";

  const path = "./actual/screenshot.png";

  await screenShot(url, path);
  const expectedPath = `./expected/screenshot.png`;
  const actualPath = `./actual/screenshot.png`;
  const misMatchPercentage = await getDiff(expectedPath, actualPath);
  const matchPercentage = 100 - parseFloat(misMatchPercentage);
  console.log(
    "🚀 ~ file: index.js ~ line 91 ~ generateScreenshotAndCalculateDiff ~ matchPercentage",
    matchPercentage
  );
  process.exit();
};

generateScreenshotAndCalculateDiff();
