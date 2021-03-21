module.exports = mongoose => {
    const Wallet = mongoose.model(
      "wallet",

      mongoose.Schema(
        {
          wallet_id: String,
          name: String,
          buy_price: String,
          sell_price: String,
          updated_price: String,
          sold: Boolean,
          buy_time: String,
          sell_time: String,
          stop_price: String,
          percent: String,
            
        },
        { timestamps: true }
      )
    );
  
    return Wallet;
  };