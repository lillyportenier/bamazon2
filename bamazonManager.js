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
    manageraprompt()
});

function manageraprompt() {
    inquirer
        .prompt([
            {
                name: "options",
                type: "list",
                message: "What would you like to do today?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
            }
        ]).then(function (answers) {
            if (answers.options === "View Products for Sale") {
                saleProducts();
            } else if (answers.options === "View Low Inventory") {
                lowInventory();
            } else if (answers.options === "Add to Inventory") {
                addInventory();
            } else if (answers.options === "Add New Product") {
                newProduct();
            } else if (answers.options === "Exit") {
                connection.end();
            }
        });

};

function saleProducts() {
    connection.query("SELECT * FROM products", function (err, result) {
        for (i = 0; i < result.length; i++) {
            var stuff = {
                ID: result[i].item_id,
                Name: result[i].product_name,
                Price: result[i].price,
                Quantity: result[i].stock_quantity
            };
            console.log(stuff);
        };
        console.log(dashes);
        manageraprompt()
    });
};
function lowInventory() {
    console.log("got into low inventory");
    connection.query("SELECT * FROM products", function (err, result) {
        var lowStock = [];
        for (i = 0; i < result.length; i++) {
            if (result[i].stock_quantity <= 5) {
                lowStock.push(result[i].stock_quantity);
            }
        }
        console.log(lowStock);
        manageraprompt()

    })

};
function addInventory() {
    console.log("got into add inventory");
    
    connection.query("SELECT * FROM products", function (err, result) {
        for (i = 0; i < result.length; i++) {
            var stuff = {
                ID: result[i].item_id,
                Name: result[i].product_name,
                Price: result[i].price,
                Quantity: result[i].stock_quantity
            };
            console.log(stuff);
        }; console.log(dashes)

        inquirer.prompt([
            {
                name: "id",
                type: "input",
                message: "What the ID of the product you you like to add inventory to?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to add?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            var selectedItem = (answer.id -1);
            var newStock = (result[selectedItem].stock_quantity + answer.quantity);
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newStock,
                    },
                    {
                        item_id: parseFloat(result[selectedItem].item_id)
                        // you need to fix thisbc it just adding number to end of surrent number instead of actually adding them together
                    }
                ], 
                function (err) {
                    if (err) {
                        console.log("throw error in add inventory function");
                        throw err;
                    };
                    console.log("your new stock for " + result[selectedItem].product_name + " is " + newStock) 
                }
            )
        })
    })
};

    function newProduct() {
        console.log("got into add new product");
        inquirer
            .prompt([
                {
                    name: "name",
                    type: "input",
                    message: "What product would you like to add?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "department",
                    type: "input",
                    message: "What department is it in?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "price",
                    type: "input",
                    message: "What is the price of it?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "stock",
                    type: "input",
                    message: "How many units would you like to add?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ]).then(function (answer) {
                connection.query("INSERT INTO products SET ?",
                    {
                        product_name: answer.name,
                        department_name: answer.department,
                        price: answer.price,
                        stock_quantity: answer.stock
                    },
                    function (err) {
                        if (err) {
                            console.log("throw error in new product query ocnnection");
                            throw err;
                        };
                        console.log("Your item was sucessfully added!")
                        manageraprompt()
                    })
            })
    };