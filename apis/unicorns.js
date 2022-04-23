const fetch = require("node-fetch");

const unicornsListData = require("../fixtures/unicornsData.json");

module.exports.unicornsList = async (event) => {
  if (event.httpMethod == "GET") {
    // let countryParameter = "India";
    // if (event.queryStringParameters && event.queryStringParameters !== null) {
    //   if (
    //     event.queryStringParameters.country &&
    //     event.queryStringParameters.country !== null
    //   ) {
    // countryParameter = event.queryStringParameters.country;
    //   }
    // }

    let url =
      "https://www.wikitable2json.com/api/List_of_unicorn_startup_companies?table=3";

    let result;
    let statusCode;

    const response = await fetch(url);
    statusCode = response.status;

    if (!response.ok) {
      result = getIndianUnicorns();
      return {
        statusCode: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(result),
      };
    } else {
      statusCode = response.status;
    }
    const companiesList = await response.json();
    if (statusCode === 200) {
      result = getIndianUnicorns(companiesList);
    }
    return {
      statusCode: statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(result),
    };
  }
};

function transformWikiTableJSON(list = unicornsListData) {
  const objectKeys = list[0].data[0];
  list[0].data.shift();
  const transformWikiTableJSONData = list[0].data.map((i) => {
    let a = {};
    i.map((item, index) => {
      a[objectKeys[index]] = item;
    });
    return a;
  });
  return transformWikiTableJSONData;
}

function getIndianUnicorns() {
  const allUnicornsList = transformWikiTableJSON();
  const indianStartups = allUnicornsList.filter((item) =>
    item.Country.includes("India")
  );
  return indianStartups;
}
