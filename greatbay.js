require("dotenv").config();
const mysql = require("mysql");
const sha1 = require("sha1");
const inquirer = require("inquirer");
const moment = require("moment");
const checkLoginQuery =
  "SELECT user_id FROM USERS WHERE user_name = ? AND user_password = ?";
const createProductQuery = "INSERT INTO products SET ?";
const createAuctionQuery = "INSERT INTO auctions SET ?";

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  //   password: process.env.dbpassword,
  password: "password",
  database: "greatbayDB"
});

var welcomeQuestions = [
  {
    type: "list",
    message: "New users please signup, returning users please log in...",
    name: "entryAction",
    choices: [
      { name: "Log In", value: "entry-action-login" },
      { name: "Sign Up", value: "entry-action-signup" }
    ]
  }
];

var loginQuestions = [
  {
    type: "input",
    message: "Enter your user name",
    name: "inputUserName"
  },
  {
    type: "password",
    message: "Enter your password",
    name: "inputUserPassword"
  }
];

var userPanelQuestions = [
  {
    type: "list",
    message: "Please choose what you wish to do",
    name: "userChoice",
    choices: [
      { name: "Post an Item for Auction", value: "post-an-item" },
      { name: "Bid for an Item", value: "bid-for-an-item" }
    ]
  }
];

var productQuestions = [
  {
    type: "input",
    message: "Enter a name for your auction",
    name: "auctionName"
  },
  {
    type: "number",
    message: "How many days should the auction run for",
    name: "numberOfDays"
  },
  {
    type: "input",
    message: "Enter a name for your Product",
    name: "productName"
  },
  {
    type: "input",
    message: "Please describe your product",
    name: "productDescription"
  }
];
function makeConnection() {
  return new Promise(resolve => {
    connection.connect(function(err) {
      if (err) throw err;
      resolve(connection.state);
    });
  });
  // return new Promise(resolve => {resolve(1+1)})
}

function queryTable(query, inputs) {
  return new Promise(resolve => {
    var query1 = connection.query(query, inputs, function(err, res) {
      if (err) throw err;
      resolve(res);
    });
    console.log(query1.sql);
  });
}

function inquirerPrompt(questions) {
  console.clear();
  return new Promise(resolve => {
    inquirer
      .prompt(questions)
      .then(inquirerResponse => resolve(inquirerResponse));
  });
}

async function validateLogin(userid, password) {
  var connectionState = await makeConnection();
  if (connectionState == "connected") {
    var queryResult = await queryTable(checkLoginQuery, [
      userid,
      sha1(password)
    ]);
    return queryResult.length > 0 ? queryResult[0].user_id : false;
  }
}

async function createAuction(auctionDetails, userid) {
  var productInfo = {};
  var auctionInfo = {};
  productInfo.product_name = auctionDetails.productName;
  productInfo.product_description = auctionDetails.productDescription;
  var insertProduct = await queryTable(createProductQuery, productInfo);

  if (insertProduct.affectedRows) {
    auctionInfo.auction_name = auctionDetails.auctionName;
    auctionInfo.auction_owner = userid;
    auctionInfo.product_in_auction = insertProduct.insertId;
    auctionInfo.auction_end_date = moment()
      .add(auctionDetails.numberOfDays, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    var insertAuction = await queryTable(createAuctionQuery, auctionInfo);
    return insertAuction.affectedRows ? true : false;
  }
}

async function applicationBrain() {
  console.log("calling");
  var welcomeResponse = await inquirerPrompt(welcomeQuestions);
  if (welcomeResponse.entryAction === "entry-action-login") {
    var loginResponse = await inquirerPrompt(loginQuestions);
    var loginUserId = await validateLogin(
      loginResponse.inputUserName,
      loginResponse.inputUserPassword
    );
    if (loginUserId) {
      var userOptionPanel = await inquirerPrompt(userPanelQuestions);
      console.log(userOptionPanel);
      if (userOptionPanel.userChoice == "post-an-item") {
        console.log("Going to post an Item");
        var auctionDetails = await inquirerPrompt(productQuestions);
        var createAuctionResult = await createAuction(
          auctionDetails,
          loginUserId
        );
      } else {
        console.log("Going to bid for an item");
      }
    } else {
      console.log("Login incorrect!!!");
      return;
    }
  } else {
    var signupResponse = await askSignupQuestion();
  }
}

applicationBrain();