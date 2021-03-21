const db = require("../mongo-models");
const Wallet = db.wallets;

// Create and Save a new Wallet


function findAllProducts(sellerId) {
  try {
      return Products.find( { seller: {
          Id: sellerId
      }});   

  } catch (error) {
      console.log(e);
  }
}


exports.create = (req, res) => {
    // Validate request
    if (!req.name) {
      console.log('Content can not be empty!')
      return;
    }

    // Create a Wallet
    const wallet = new Wallet({
        wallet_id: req.wallet_id ? req.wallet_id : "",
        name: req.name ? req.name : "",
        buy_price: req.buy_price ? req.buy_price : "",
        sell_price: req.sell_price ? req.sell_price : "",
        updated_price: req.updated_price ? req.updated_price : "",
        percent: req.percent ? req.percent : "",
        sold: req.bought ? req.bought : "false",
        buy_time: req.buy_time ? req.buy_time : "",
        sell_time: req.sell_time ? req.sell_time : "",
        stop_price: req.stop_price ? req.stop_price : "",
    });
  
    try {
      return wallet.save(wallet);  
    } catch (error) {
      console.log(error);
    }
     
    
  };

// Retrieve Wallets from the database.
exports.read = (req, res) => {
   // Validate request
   if (!req.name) {
      console.log('Content can not be empty!')
      return;
    }

    const name = req.name;
    const wallet_id = req.wallet_id;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" }, wallet_id: wallet_id,sold:false } : {};

    try {
      return Wallet.find(condition);  
    } catch (error) {
      console.log(error);
    } 
};

// Delete Wallet from the database.
exports.delete = (req, res) => {
   // Validate request
   if (!req.name) {
      console.log('Content can not be empty!')
      return;
    }

    const name = req.name;
    const wallet_id = req.wallet_id;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" }, wallet_id: wallet_id } : {};

    try {
      return Wallet.deleteMany(condition);  
    } catch (error) {
      console.log(error);
    } 
};

// Update Wallet from the database.
exports.update = (req, res) => {
   // Validate request
   if (!req.name) {
      console.log('Content can not be empty!')
      return;
    }

    const name = req.name;
    const wallet_id = req.wallet_id;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" }, wallet_id: wallet_id, sold:false } : {};

    try {
      return Wallet.findOneAndUpdate(condition,req, { useFindAndModify: false });  
    } catch (error) {
      console.log(error);
    } 
};

