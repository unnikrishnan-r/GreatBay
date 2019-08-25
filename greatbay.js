require("dotenv").config();
const mysql = require("mysql");
const sha1 = require("sha1");
const inquirer = require("inquirer");
const checkLoginQuery =
  "SELECT COUNT(*) as rowCount FROM USERS WHERE user_name = ? AND user_password = ?";

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
            {name:"Post an Item for Auction" , value:"post-an-item"},
            {name:"Bid for an Item", value: "bid-for-an-item"}
        ]
    }
]

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
    if (queryResult[0].rowCount == 0) {
      return false;
    } else {
      return true;
    }
  }
}

async function applicationBrain() {
  console.log("calling");
  var welcomeResponse = await inquirerPrompt(welcomeQuestions);
  if (welcomeResponse.entryAction === "entry-action-login") {
    var loginResponse = await inquirerPrompt(loginQuestions);
    var loginResult = await validateLogin(loginResponse.inputUserName,
        loginResponse.inputUserPassword);
    if(loginResult){
        var userOptionPanel = await inquirerPrompt(userPanelQuestions);
        if(userOptionPanel == "post-an-item"){
            console.log("Going to post an Item")
        }else{
            console.log("Going to bid for an item")
        }
    }else{
        console.log("Login incorrect!!!");
        return;
    }
  } else {
    var signupResponse = await askSignupQuestion();
  }
}

applicationBrain();
