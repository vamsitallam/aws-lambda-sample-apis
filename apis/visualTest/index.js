var http = require("http");
const compareImages = require("resemblejs/compareImages");
const fs = require("mz/fs");
// const puppeteer = require("puppeteer-serverless");
const chromium = require("chrome-aws-lambda");

const fixtureData = require("./fixtures.json");

module.exports.visualTestDifference = async (event, context, callback) => {
  if (event.httpMethod == "GET") {
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

    const result = await generateScreenshotAndCalculateDiff(callback);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(result),
    };
  }
};

const screenShot = async (url, path, callback) => {
  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    await page.goto(url);
    await page.screenshot({
      path: path, // Save the screenshot in current directory
      fullPage: true, // take a fullpage screenshot
    });

    result = await page.title();
  } catch (error) {
    return callback(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return callback(null, result);

  // Define Screenshot function

  // console.log(puppeteer.default.launch);

  // const browser = await puppeteer.default.launch({
  //   executablePath: "/home/ib_admin/.config/google-chrome",
  // });
  // const page = await browser.newPage();

  // const page = await browser.newPage(); // Open a new page

  // await page.goto(url); // Go to the website

  // await page.screenshot({
  //   path: path, // Save the screenshot in current directory
  //   fullPage: true, // take a fullpage screenshot
  // });

  // await page.close(); // Close the website
  // await browser.close(); // Close the browser
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

var generateScreenshotAndCalculateDiff = async (callback) => {
  const url = "http://localhost:5000";

  const path = "tmp/actual/screenshot.png";

  await screenShot(url, path, callback);
  const expectedPath = `tmp/expected/screenshot.png`;
  const actualPath = `tmp/actual/screenshot.png`;
  const misMatchPercentage = await getDiff(expectedPath, actualPath);
  const matchPercentage = 100 - parseFloat(misMatchPercentage);
  console.log(
    "🚀 ~ file: index.js ~ line 91 ~ generateScreenshotAndCalculateDiff ~ matchPercentage",
    matchPercentage
  );
  return matchPercentage;
  // return 100;
  // process.exit();
};
