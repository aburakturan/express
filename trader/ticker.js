
const Binance = require('node-binance-api')
const fetch = require('node-fetch');
const chalk = require('chalk');
const log = console.log;
const beeper = require('beeper');

const WalletBridge = require("../mongo-controllers/wallet.controller");
const {APIKEY, APISECRET} = require("../config/binance.config");
const {URL, KEY, CHATID} = require("../config/telegram.config");
const {WALLETID} = require("../config/wallet.config");
const {INTERVAL, QUOTEASSET, CONTAINER_LIMIT, TELEGRAM_MODE, TOTAL_LIMIT, STOP_LOSS_PERCENT, AVARAGE_LIMIT} = require("../config/trade.config");

const binance = new Binance().options({
  APIKEY: APIKEY,
  APISECRET: APISECRET
});

let init = true
const wallet = []
const percents = []
const initialPercent = []
let increaseHolderContainer = []
const walletCount = []

const updated_price_array = []


const TradeBridge = {
  listen: async function() {
    await binance.prevDay().then(data => {
      if (init === true){
        console.log('WALLETID', WALLETID)
        // console.log("\007")
         beeper();


        for (const [key, value] of Object.entries(data)) {
          let symbol = value.symbol
          if (!initialPercent[symbol]){
            initialPercent[symbol] = []
            initialPercent[symbol] = value.priceChangePercent
            init = false
          } 
        }
      } else {
        for (const [key, value] of Object.entries(data)) {
          let symbol = value.symbol
          if (value.priceChangePercent > 0){
            if (symbol.includes(QUOTEASSET) === true && symbol.includes("UP") !== true && symbol.includes("DOWN") !== true ){
              TradeBridge.initPercents(symbol,value.priceChangePercent)
              TradeBridge.increaceSensor(symbol, percents[symbol], initialPercent[symbol])    
              if (wallet[symbol] && wallet[symbol] == WALLETID) {
                TradeBridge.decreaseSensor(symbol)
              }          
            }
          }
        }
      }
    })
    setTimeout(function () { TradeBridge.listen();}, INTERVAL);
  },

  initPercents: async function(symbol,priceChangePercent){
    if (!percents[symbol]){
      percents[symbol] = []
      percents[symbol] = priceChangePercent
    } else {
      percents[symbol] = priceChangePercent
    }  
  },
  
  increaseHolderContainerLogic: async function(symbol,  step , percentage){

    if (percentage <= 0){
        TradeBridge.formatHolderContainer(symbol)
    } else {
      if (step!=0){
        if (percentage >= increaseHolderContainer[symbol][step-1]){
          increaseHolderContainer[symbol][step] = percentage
        } else {
          // TradeBridge.formatHolderContainer(symbol)  // Eğer gelen yüzde değer bir 
        }
      } else {
        increaseHolderContainer[symbol][step] = percentage
      }
        // TradeBridge.initialPercentSwap(symbol)  
    }
  },

  increaceSensor: async function(symbol, current, old){
    increasementPercentage = current-old;
    TradeBridge.increaseHolderContainerer(symbol,increasementPercentage)
  },
  
  increaseHolderContainerer: async function(symbol, percentage){
   
    // if (percentage > 0){
    //   step = 0
    //   if (increaseHolderContainer[symbol]){
    //     for (i = CONTAINER_LIMIT; i >= 0; i--){
    //       if (increaseHolderContainer[symbol][i]){
    //         step = i + 1
    //       } 
    //     }
    //     if (step == CONTAINER_LIMIT) {
    //       TradeBridge.buyLogic(symbol, increaseHolderContainer[symbol])
    //       TradeBridge.formatHolderContainer(symbol)
    //     } else {
    //       TradeBridge.increaseHolderContainerLogic(symbol, step, percentage)
    //     }
    //   } else {
    //     increaseHolderContainer[symbol] = []
    //     TradeBridge.increaseHolderContainerLogic(symbol, step, _percentage)    
    //   }    
    // }


   if (percentage>0){
    let _percentage = percentage
    if (increaseHolderContainer[symbol]){
      if (increaseHolderContainer[symbol][0]){
        if (increaseHolderContainer[symbol][1]){
          if (increaseHolderContainer[symbol][2]){
            if (increaseHolderContainer[symbol][3]){
              if (increaseHolderContainer[symbol][4]){
                  
                TradeBridge.buyLogic(symbol, increaseHolderContainer[symbol])
                TradeBridge.formatHolderContainer(symbol)

              } else {
                TradeBridge.increaseHolderContainerLogic(symbol, 4, _percentage)
                }
              } else {
                  TradeBridge.increaseHolderContainerLogic(symbol, 3, _percentage)
              }
            } else {
                TradeBridge.increaseHolderContainerLogic(symbol, 2, _percentage)
            }
          } else {
              TradeBridge.increaseHolderContainerLogic(symbol, 1, _percentage)
          }
        } else {
            TradeBridge.increaseHolderContainerLogic(symbol, 0, _percentage)
        }
      } else {
      increaseHolderContainer[symbol] = []
      TradeBridge.increaseHolderContainerLogic(symbol, 0, _percentage)    
      }                              
   }
  },

  // BUY LOGIC
  buyLogic: async function(symbol, holder){
    let increaseInterval = ((INTERVAL * (CONTAINER_LIMIT+1))/1000)
    let totalHolder = 0
    for (i=0; i<=holder.length-1; i++){
        totalHolder = totalHolder + holder[i]
    }

    let totalPercentage = totalHolder / holder.length

    if (!walletCount[symbol]){
      walletCount[symbol] = 1
    }

    // log(chalk.bgWhite(chalk.black(chalk.bold(`${symbol} - ${totalPercentage} ( ${holder.length} )  ${initialPercent[symbol]} - ${percents[symbol]}`))))

    // Print
    if (totalPercentage > TOTAL_LIMIT){

      beeper(2);
      log(chalk.bgYellow(chalk.black(chalk.bold(`${symbol} - ${totalPercentage} ( ${holder.length} )  ${initialPercent[symbol]} - ${percents[symbol]} --${walletCount[symbol]}.kez eklendi`))))

      if (TELEGRAM_MODE==true){
        TradeBridge.sendTelegram(symbol,increaseInterval,totalPercentage)
      }
      
      if (wallet[symbol] && wallet[symbol] == WALLETID) {
        // log how much time it catched 
        walletCount[symbol] = walletCount[symbol] + 1
      } else {
        TradeBridge.sendWallet(symbol,increaseInterval,totalPercentage)
        // Buy
      }

     
    } 
  },

  sellSignal: async function(symbol){
    beeper(2);
    console.log(symbol + ' SATILDI')
    if (TELEGRAM_MODE==true){
      TradeBridge.sendTelegramSold(wallet[symbol], TradeBridge.soldWallet[symbol])
    }
  },
  
  sendWallet: async function(symbol,increaseInterval,totalPercentage){
    const lasPrice = await TradeBridge.getCurrentPrice(symbol)

    wallet[symbol] = []
    wallet[symbol] = WALLETID

    data = {
      'name': symbol,
      'buy_price': lasPrice,
      'wallet_id': WALLETID,
      "buy_time": new Date(),
    }

    TradeBridge.wallet.create(data)
  },

  increaseHolderContainerForSellLogic: async function(symbol, step, _percentage){
    if (percentage <= 0){
      TradeBridge.formatHolderContainer(symbol)
      } else {
        if (step!=0){
          if (percentage >= increaseHolderContainer[symbol][step-1]){
            increaseHolderContainer[symbol][step] = percentage
          } else {
            // TradeBridge.formatHolderContainer(symbol)  // Eğer gelen yüzde değer bir 
          }
        } else {
          increaseHolderContainer[symbol][step] = percentage
        }
          // TradeBridge.initialPercentSwap(symbol)  
      }
  },


  decreaseSensor: async function(symbol){
    
    // _name = "DENTUSDT"
    // _id = "a703ec360b8e9931b0446b1fb051ebab"
    
    
    data = {
      'name': symbol,
      'wallet_id': WALLETID,
    }

    // symbol = _name

    const lastPrice = await TradeBridge.getCurrentPrice(symbol)
    const asset = await TradeBridge.wallet.read(data)

    buy_price = (asset[0]) ? asset[0].buy_price : ""
    current_price = await lastPrice
    updated_price = (asset[0]) ? asset[0].updated_price : ""
    sold = (asset[0]) ? asset[0].bought : ""

    if (!updated_price_array[symbol]) {
      updated_price_array.push([symbol])
      updated_price_array[symbol] = []
    }

    updated_price_array[symbol].push(current_price)

    avarage = 0

    if (updated_price_array[symbol].length >= AVARAGE_LIMIT) {
      arr = updated_price_array[symbol].slice(Math.max(updated_price_array[symbol].length - AVARAGE_LIMIT, 0))
      avarage = (arr.reduce((partial_sum, a) => partial_sum + a,0)) / AVARAGE_LIMIT
    }

    updated_data = {
      'name': symbol,
      'wallet_id': WALLETID,
      'updated_price' : current_price
    }

    updated_data_to_sell = {
      'name': symbol,
      'wallet_id': WALLETID,
      'sell_time' : new Date(),
      'sell_price' : current_price,
      'percent' : (current_price - buy_price) / buy_price,
      'sold' : 1
    }

    buy_price_with_stop_loss = buy_price - ((buy_price / 100) * STOP_LOSS_PERCENT)
    // updated_price_with_stop_loss = buy_price - ((updated_price / 100) * STOP_LOSS_PERCENT)

    console.log('buy ',buy_price, ' with stop', buy_price_with_stop_loss)
    if (buy_price_with_stop_loss > current_price){
      TradeBridge.sell(updated_data_to_sell)
      console.log(symbol, 'stop loss çalıştı')
    } 

    if (avarage != 0) {
      console.log('avarage ', avarage)
        if (!updated_price || updated_price==""){
          _updated = await TradeBridge.wallet.update(updated_data)
        } else {
          if ( avarage > current_price) { //güncel fiyat son update edilen fiyat ortalamasından küçükse düşüş var
            TradeBridge.sell(updated_data_to_sell)
          } else {
            _updated = await TradeBridge.wallet.update(updated_data)
            console.log('_updated', await _updated)
            console.log(symbol, " increased")
          }
        }
      }  

      // setTimeout(function () { TradeBridge.decreaseSensor();}, INTERVAL);

  },


  // decreaseSensorOld: async function(symbol){
    
    
  //   data = {
  //     'name': symbol,
  //     'wallet_id': WALLETID
  //   }

  //   const lastPrice = await TradeBridge.getCurrentPrice(symbol)
  //   const asset = await TradeBridge.wallet.read(data)

  //   buy_price = (asset[0]) ? asset[0].buy_price : ""
  //   current_price = await lastPrice
  //   updated_price = (asset[0]) ? asset[0].updated_price : ""
  //   sold = (asset[0]) ? asset[0].bought : ""

    
  //   updated_data = {
  //     'name': symbol,
  //     'wallet_id': WALLETID,
  //     'updated_price' : current_price
  //   }


  //   console.log('yuzde', (buy_price - current_price) / current_price)
  //   updated_data_to_sell = {
  //     'name': symbol,
  //     'wallet_id': WALLETID,
  //     'sell_time' : new Date(),
  //     'sell_price' : current_price,
  //     'percent' : (buy_price - current_price) / current_price,
  //     'sold' : 1
  //   }

  //     buy_price_with_stop_loss = buy_price - ((buy_price / 100) * STOP_LOSS_PERCENT)
  //     updated_price_with_stop_loss = buy_price - ((updated_price / 100) * STOP_LOSS_PERCENT)

  //     console.log('buy', buy_price, 'stop_loss', buy_price_with_stop_loss)
  //     console.log('updated', updated_price, 'stop_loss', updated_price_with_stop_loss)

  //     if (!updated_price || updated_price==""){
  //       // if (buy_price > current_price ) { // güncel fiyat alış fiyatının altına düştüyse, stop loss burada çalışacak
  //       if (buy_price_with_stop_loss > current_price ) { // güncel fiyat alış fiyatının altına düştüyse, stop loss burada çalışacak
  //         console.log('buy_price ', buy_price, ' current_price ', current_price, 'dan büyük - Düşüş - SATILMADI')

  //         // TradeBridge.sell(updated_data_to_sell)
  //         // Sell it

  //       } else {
  //         _updated = await TradeBridge.wallet.update(updated_data)
  //         console.log('buy_price ', buy_price, ' current_price ', current_price, 'dan küçük - Yükseliş ', updated_price, 'güncellendi')
  //         console.log('_updated', await _updated)

  //       }
  //     } else {
  //       // if ( updated_price > current_price) { //güncel fiyat son update edilen fiyattan büyükse düşüş var
  //       if ( updated_price_with_stop_loss > current_price) { //güncel fiyat son update edilen fiyattan büyükse düşüş var
  //         console.log('updated_price ', updated_price, ' current_price ', current_price, 'dan büyük - Düşüş SATILIYOR')

  //         TradeBridge.sell(updated_data_to_sell)

  //         // Sell it
  //       } else {
  //         console.log('updated_price ', updated_price, ' current_price ', current_price, 'dan küçük - Yükseliş ', updated_price, 'güncellendi')

  //         _updated = await TradeBridge.wallet.update(updated_data)
  //         console.log('_updated', await _updated)
  //         console.log(symbol, " increased")
  //       }
  //     }
    
  // },

  sell: async function(data){
    console.log('sold data', data)
    console.log('sold asset', data.name)

    _updated = await TradeBridge.wallet.update(data)
    TradeBridge.sellSignal(data.name)
    delete wallet[data.name]

    if (wallet[data.name]) {
      console.log('deleted walets ID', WALLETID)
      console.log('deleted walet', wallet[data.name])
    } else {
      console.log('wallet deleted')
    }

  },

  getCurrentPrice: async function(symbol, status){
    const lastPrice = (async _ => {
      try {
        const response = await binance.prices(symbol)
        // console.log('Price sensor', response)
        // parseFloat(str.replace(',','.').replace(' ',''))
        return parseFloat(response[symbol])
      } catch (error) {
        console.error(error)
      }
    })()

    return lastPrice
  },


 


  sendTelegram: async function(symbol, increaseInterval, totalPercentage){
    text=symbol + "paritesi" + increaseInterval + "saniye icinde, %" + Number.parseFloat(totalPercentage).toFixed(2) + " oraninda yukseldi."
    url = URL+"bot"+KEY+"/sendMessage?chat_id="+CHATID+"&text=NODE2:"+text
    url = "https://api.telegram.org/bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw/sendMessage?chat_id=-490464614&text="+text
    fetch(url);
  },

  sendTelegramSold: async function(symbol, sell_price, buy_price){
    text="ALIS" + symbol + "SATIS" + sell_price + "FARK" + buy_price-sell_price + "YUZDE FARK" + buy_price/sell_price
    url = URL+"/bot"+KEY+"/sendMessage?chat_id="+CHATID+"&text=NODE2:"+text
    fetch(url);
  },

  initialPercentSwap: async function(symbol){
    initialPercent[symbol] = percents[symbol]
  },

  formatHolderContainer: async function(symbol){
    for (i=0; i<=CONTAINER_LIMIT; i++){
        delete increaseHolderContainer[symbol][i]
    }
  },

  wallet:{
    create: async function(data){
       const _data = await WalletBridge.create(data)
       console.log('ALINDI', _data);
    },
    read: async function(data){
       return await WalletBridge.read(data)
    },
    update: async function(data){
      return await WalletBridge.update(data)
    },
    delete: async function(symbol){

      data = {
        'name': symbol,
        'wallet_id': WALLETID

      }
      
       const _data = await WalletBridge.delete(data)
       console.log(_data, "CÜZDANDAN ÇIKARILDI");
    },
  },










  
}

module.exports = TradeBridge;