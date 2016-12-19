var inquirer = require('inquirer');
var mysql = require("mysql");

var connection = mysql.createConnection({ //this is called a config.
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "bamazon"
});


var totalCost = 0;

connection.connect(function(err) {
	if(err) throw err;
	console.log("connected as id", connection.threadId);

	displayGoods();
	
});


function displayGoods() {
	connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
		console.log(res);
		promptBuy();	
	});
}


function promptBuy() {
	inquirer.prompt([{
    	name: "buy_id",
    	type: "input",
    	message: "Enter the item_id that you want to buy: ",
    	validate: function(value) {
      		if (isNaN(value) === false) {
        		return true;
      		}
      		return false;
    	}
  	}, {
    	name: "buy_quantity",
    	type: "input",
    	message: "Enter the number of units you want to buy: ",
    	validate: function(value) {
      		if (isNaN(value) === false) {
        		return true;
      		}
      		return false;
    	}
  	}]).then(function(answer) {
  		queryBuy(answer.buy_id, answer.buy_quantity);
  	});
};

function queryBuy(id, quantity) {
	connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ? AND stock_quantity > ?", [quantity, id, quantity], function(err, res) {
		if (res.changedRows == 0) {
			console.log("insufficient quantity! Purchase cancelled.")
			promptAgain();
		}
		else {
			console.log("OK. Purchase valid")
			queryCosts(id, quantity);
		}

	});
}

function queryCosts(id, quantity) {
	connection.query("SELECT price FROM products WHERE ?", {item_id: id}, function(err, res) {
		console.log("that costs", res[0].price * quantity);
		totalCost = totalCost + (res[0].price * quantity);
		console.log("Total Cost:", totalCost);
		promptAgain();
	});		
}

function promptAgain() {
	inquirer.prompt([{
    	name: "buyAgain",
    	type: "list",
    	message: "Buy Again?",
    	choices: ["yes", "no"]
    }]).then(function(answer) {
    	if (answer.buyAgain == "yes")
    		displayGoods();
    	else
    		process.exit();
    });
}