var mysql = require("mysql");
var inquirer = require("inquirer");
var dashes = "----------------------------------------------------------------"


var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "River?44",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) {
    console.log("throw error at initial connect");
    throw err;
  }
  console.log("connected as id " + connection.threadId + "\n");
  productShow(); 
});

function productShow() {
  connection.query("SELECT * FROM products", function (err, result) {
    console.log("ID  Product  | Price  ");
    for (i = 0; i < result.length; i++) {
      var stuff = {
        ID: result[i].item_id,
        Name: result[i].product_name,
        Department: result[i].department_name,
        Price: result[i].price
      }
      console.log(stuff);
    }
    console.log(dashes);
    purchasePrompt();
  })
};

function purchasePrompt() {
  inquirer
    .prompt([
      {
        name: "ID",
        type: "input",
        message: "What is the ID of the product you would like to buy?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "Units",
        type: "input",
        message: "How many units of the product would you like to purchase?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
    ]).then(function (answer) {
      purcahseFunction(answer)
    });
};

function purcahseFunction(answer) {
  connection.query("SELECT * FROM products", function (err, result) {
    if (err) {
      console.log("first connectiong query throw error");
      throw err;
    };
    var selectedItemID = (answer.ID - 1)

    if (result[selectedItemID].stock_quantity >= answer.Units) {
      var newStock = (result[selectedItemID].stock_quantity - answer.Units);
      var cost = (result[selectedItemID].price * answer.Units);
      connection.query("UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: newStock
          },
          {
            item_id: result[selectedItemID].item_id
          }
        ],
        function (err) {
          if (err) {
            console.log("throw error in quantity update");
            throw err;
          };
          console.log("Your total is $" + cost);
          console.log("New stock: " + newStock)
          keepShopping();
        });
    }  else {
      console.log("You entered an amount that we don't have in stock, please try again with a lower amount!")
      keepShopping()
    }
  });
};
function keepShopping() {
  inquirer
  .prompt ([
    {
      name: "shopMore",
      type: "list",
      message: "What would you like to do?",
      choices: ["Keep shopping", "Exit"]
    }
  ]).then (function (answer) {
    if (answer.shopMore === "Keep shopping"){
      productShow();
    } else if (answer.shopMore === "Exit"){
      connection.end();
    }
  })
}