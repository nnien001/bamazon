var inquirer = require('inquirer');
var mysql = require("mysql");

var connection = mysql.createConnection({ //this is called a config.
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "bamazon"
});

connection.connect(function(err) {
	if(err) throw err;
	//console.log("connected as id", connection.threadId);

	managerPrompt();
	
});

function managerPrompt() {
	inquirer.prompt([{
    	name: "mainPrompt",
    	type: "list",
    	message: "What do you want to do?",
    	choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "quit"]
    }]).then(function(answer) {
    	switch(answer.mainPrompt) {
    		case "View Products for Sale":
    			viewProducts();
    			break;
    		case "View Low Inventory":
    			viewLow();
    			break;
    		case "Add to Inventory":
    			addInventory();
    			break;
    		case "Add New Product":
    			addProduct();
    			break;
    		case "quit":
    			process.exit();
    			break;
    		default:
    			process.exit();				
    	}

    });
}


function viewProducts() {
	connection.query("SELECT * FROM products", function(err, res) {

		var filler = "                    "; //20 empty spaces
		var s1 = "item_id" + filler;
		var s2 = "product_name" + filler;
		var s3 = "price" + filler;
		var s4 = "stock_quantity" + filler;

		//header
		console.log(s1.substring(0, 20), s2.substring(0, 20), s3.substring(0, 20), s4.substring(0, 20));
		console.log("----------------------------------------------------------------------------");

		for (var i = 0; i < res.length; i++) {
			var itemOutput = res[i].item_id + filler;
			var productOutput = res[i].product_name + filler;
			var priceOutput = res[i].price.toString() + filler;
			var stockOutput = res[i].stock_quantity.toString() + filler;

			console.log(itemOutput.substring(0, 20), productOutput.substring(0, 20), priceOutput.substring(0, 20), stockOutput.substring(0, 20));
		}

		managerPrompt();
	});
}

function viewLow() {
	connection.query("SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5", function(err, res) {

		var filler = "                    "; //20 empty spaces
		var s1 = "item_id" + filler;
		var s2 = "product_name" + filler;
		var s3 = "stock_quantity" + filler;
		console.log(s1.substring(0, 20), s2.substring(0, 20), s3.substring(0, 20));
		console.log("------------------------------------------------------------------");

		for (var i = 0; i < res.length; i++) {
			var itemOutput = res[i].item_id + filler;
			var productOutput = res[i].product_name + filler;
			var stockOutput = res[i].stock_quantity.toString() + filler;

			console.log(itemOutput.substring(0, 20), productOutput.substring(0, 20), stockOutput.substring(0, 20));
		}

		managerPrompt();
	});
}

function addInventory() {
	inquirer.prompt([{
    	name: "add_id",
    	type: "input",
    	message: "Enter the item_id that you want increase: ",
    	validate: function(value) {
      		if (isNaN(value) === false) {
        		return true;
      		}
      		return false;
    	}
  	}, {
    	name: "add_quantity",
    	type: "input",
    	message: "Enter the number of units you want to increase by: ",
    	validate: function(value) {
      		if (isNaN(value) === false) {
        		return true;
      		}
      		return false;
    	}
  	}]).then(function(answer) {
  		queryAddInventory(answer.add_id, answer.add_quantity);
  		managerPrompt();
  	});
};

function queryAddInventory(add_id, add_quantity) {
	connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [add_quantity, add_id], function(err, res) {
		if (err) 
			throw err;
		else
			console.log("quantity increased");
	});
}


function addProduct() {
	inquirer.prompt([{
    	name: "name",
    	type: "input",
    	message: "Enter the new product's name",
  	}, {
    	name: "department",
    	type: "input",
    	message: "Enter the new product's department",
    }, {
    	name: "price",
    	type: "input",
    	message: "Enter the new product's price",
    	validate: function(value) {
      		if (isNaN(value) === false) {
        		return true;
      		}
      		return false;
    	}
    }, {
    	name: "quantity",
    	type: "input",
    	message: "Enter the new product's quantity",
    	validate: function(value) {
      		if (isNaN(value) === false) {
        		return true;
      		}
      		return false;
    	}

  	}]).then(function(answer) {
  		queryAddProduct(answer.name, answer.department, answer.price, answer.quantity);
  		managerPrompt();
  	});
};

function queryAddProduct(name, department, price, quantity) {
	connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) SELECT ?, ?, ?, ?", [name, department, price, quantity],
		function(err, res) {
			if (err) 
				throw err;
			else
				console.log("product added");

		});	
}