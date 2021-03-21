
// const Binance = require('binance-api-node').default
const Binance = require('node-binance-api')
const fs = require('fs');
const filterObject = require('filter-obj');
const { exit } = require('process');
const fetch = require('node-fetch');
const chalk = require('chalk');
const log = console.log;

const binance = new Binance().options({
  APIKEY: 'Ibda0NTWiLnNaA7IqTjzoAEkwrfMgofif8qn8sFbJkzvPKrR0lAjKUv6uUxRE5XN',
  // APIKEY: '0o8vTST2w4uH5cOfwoGhBqFySy04jFHGQ9yHZHdESFFpyCWQDCnH9aaJSekVfDGq',
  APISECRET: 'Q1nKtWE85DP4RYypcHZxyhOz5oDoQph2OCoYbPGC6dwZH9HIkkRab9dbXWmEop0b'
  // APISECRET: 'PTdpxSlAFsbnY5Qn3djGvKWO2MPJF7wNpnSTdE7XWhQ0JIxODp5c18BC1MYfCZOn'
});



// symbol: 'LINAUSDT',
// priceChange: '0.11250000',
// priceChangePercent: '132.353',
// weightedAvgPrice: '0.27009353',
// prevClosePrice: '0.00000000',
// lastPrice: '0.19750000',
// lastQty: '707.54000000',
// bidPrice: '0.19750000',
// bidQty: '1114.32000000',
// askPrice: '0.19760000',
// askQty: '390.28000000',
// openPrice: '0.08500000',
// highPrice: '1.00000000',
// lowPrice: '0.08500000',
// volume: '1547069065.74000000',
// quoteVolume: '417853349.24786400',
// openTime: 1616014131200,
// closeTime: 1616100531200,
// firstId: 0,
// lastId: 850499,
// count: 850500



const interval = 6000 // 1000 = 1 seconds
const stableCoin= 'USDT'
const containerLimit = 4
let increaseCalculatorContainer = []
let increaseHolderContainer = []
let buyContainer = []

const fetchUrlDomain = "https://api.telegram.org/"
const telegramKey="bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw"
const chatID = "-490464614"

let init = true
const initialPercent = []
const percents = []
const wallet = []
const soldWallet = []

let time = new Date().toISOString().match(/(\d{2}:){2}\d{2}/)[0];

const tradeBridge = {

  // Get the current prices of the pairs
  listen: async function() {

    log(chalk.bgWhite(chalk.black(chalk.bold(`--- ${time} ---`))))


    var date = new Date();
    var current_hour = date.getHours();
    await binance.prevDay().then(data => {
      if (init === true){
        for (const [key, value] of Object.entries(data)) {
          // console.log(value)
          if (!initialPercent[value.symbol]){
            initialPercent[value.symbol] = []
            initialPercent[value.symbol] = value.volume
            init = false
          } 
        }
      } else {
        for (const [key, value] of Object.entries(data)) {
          if (value.volume > 0){
            let symbol = value.symbol
            if (symbol.includes(stableCoin) === true 
              && symbol.includes("UP") !== true 
              && symbol.includes("DOWN") !== true  
              && symbol.includes("USDTBKRW") !== true 
              && symbol.includes("USDTIDRT") !== true 
            ){
              if (!percents[symbol]){
                percents[symbol] = []
                percents[symbol] = value.volume
              } else {
                percents[symbol] = value.volume
                tradeBridge.increaceCalculator(symbol, percents[symbol], initialPercent[symbol])              
                if (wallet[symbol]) {
                  tradeBridge.decreaseSensor(symbol, percents[symbol], initialPercent[symbol])
                }
              }
            }
          }
        }
      // console.log(percents)
      }
    })
    setTimeout(function () { tradeBridge.listen();}, interval);
  },

  increaceCalculator: async function(key, current, old){
    increasementPercentage = current/old;
    tradeBridge.increaseHolderContainerer(key,increasementPercentage)
  },
  
  increaseHolderContainerer: async function(key, percentage){
   if (percentage>0){
    let _percentage = percentage
    if (increaseHolderContainer[key]){
      if (increaseHolderContainer[key][0]){
        if (increaseHolderContainer[key][1]){
          if (increaseHolderContainer[key][2]){
            if (increaseHolderContainer[key][3]){
              if (increaseHolderContainer[key][4]){
                  tradeBridge.buySignal(key, increaseHolderContainer[key])
                  tradeBridge.formatHolderContainer(key)
                  } else {
                    tradeBridge.increaseHolderContainerLogic(key, 4, _percentage)
                  }
              } else {
                  tradeBridge.increaseHolderContainerLogic(key, 3, _percentage)
              }
            } else {
                tradeBridge.increaseHolderContainerLogic(key, 2, _percentage)
            }
          } else {
              tradeBridge.increaseHolderContainerLogic(key, 1, _percentage)
          }
        } else {
            tradeBridge.increaseHolderContainerLogic(key, 0, _percentage)
        }
      } else {
      increaseHolderContainer[key] = []
      tradeBridge.increaseHolderContainerLogic(key, 0, _percentage)    
      }                              
   }
  },

  decreaseSensor: async function(key, current, old){
    if (current-old <= 0) {
      tradeBridge.sellSignal(key)
    }
  },

  buySignal: async function(key, holder){
    let increaseInterval = ((interval * (containerLimit+1))/1000)
    let totalHolder = 0
    for (i=0; i<=holder.length-1; i++){
        totalHolder = totalHolder + holder[i]
    }

    let totalPercentage = totalHolder / holder.length

    // PRINT

    log(chalk.blue(key) + " - " + totalPercentage + " (" + holder.length + ")")

    if (totalPercentage > 5){
      // console.log(key + " - " + totalPercentage + " (" + holder.length + ") " + initialPercent[key] +" - "+ percents[key] + "-----" + time)
      log(chalk.bgYellow(chalk.black(chalk.bold(`${key} - ${totalPercentage} ( ${holder.length} )  ${initialPercent[key]} - ${percents[key]} --- ${time} `))))

      // tradeBridge.sendTelegram(key,increaseInterval,totalPercentage)

      tradeBridge.sendWallet(key,increaseInterval,totalPercentage)
      // Buy
    } 
  },

  sellSignal: async function(key){
    if (soldWallet[key]){
      tradeBridge.getCurrentPrice(key, 'sell')
    } else {
      soldWallet[key] = []
      tradeBridge.getCurrentPrice(key, 'sell')
    }

    // SELL
    console.log('SATILDI')
    console.log('ALIŞ', wallet[key], 'SATIŞ', soldWallet[key], 'FARK', wallet[key]-soldWallet[key], 'YÜZDE FARK', wallet[key]/soldWallet[key])

    // tradeBridge.sendTelegramSold(wallet[key], soldWallet[key])
    tradeBridge.formatWallet(key)
  },
  
  sendWallet: async function(key,increaseInterval,totalPercentage){
    if (wallet[key]){
      tradeBridge.getCurrentPrice(key,'buy')
    } else {
      wallet[key] = []
      tradeBridge.getCurrentPrice(key,'buy')
    }
  },
  
  getCurrentPrice: async function(pair, status){
  
    await binance.futuresMarkPrice( pair ).then(data => {
      if (status==="buy"){
        wallet[pair] = data.markPrice
      }
      if (status==="sell"){
        if (!soldWallet[pair]){
          soldWallet[pair] = data.markPrice
        } else {
          soldWallet[pair] = data.markPrice
        }
      } 
    })
  },

  sendTelegram: async function(key, increaseInterval, totalPercentage){
    text=key + " paritesinin hacmi " + increaseInterval + " saniye icinde, %" + totalPercentage + " oraninda yukseldi."
    url = fetchUrlDomain+"bot"+telegramKey+"/sendMessage?chat_id="+chatID+"&text=NODE2:"+text
    url = "https://api.telegram.org/bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw/sendMessage?chat_id=-490464614&text=VOLUME_ALARM "+text
    fetch(url);
  },

  sendTelegramSold: async function(key, sell_price, buy_price){
    text="ALIS" + key + "SATIS" + sell_price + "FARK" + buy_price-sell_price + "YUZDE FARK" + buy_price/sell_price
    url = fetchUrlDomain+"/bot"+telegramKey+"/sendMessage?chat_id="+chatID+"&text=NODE2:"+text
    fetch(url);
  },

  increaseHolderContainerLogic: async function(key,  step , percentage){
    if (percentage <= 0){
        tradeBridge.formatHolderContainer(key)
    } else {
      if (step!=0){
        if (percentage >= increaseHolderContainer[key][step-1]){
          // console.log(key+"-"+percentage+"-"+increaseHolderContainer[key][step-1]+"-"+step)
          increaseHolderContainer[key][step] = percentage
        } else {
          tradeBridge.formatHolderContainer(key)
        }
      } else {
        increaseHolderContainer[key][step] = percentage
      }
        // tradeBridge.initialPercentSwap(key)  
    }
  },

  initialPercentSwap: async function(symbol){
    initialPercent[symbol] = percents[symbol]
  },

  formatWallet: async function(key){
    delete wallet[key]
    delete soldWallet[key]
  },

  formatHolderContainer: async function(key){
    for (i=0; i<=containerLimit; i++){
        delete increaseHolderContainer[key][i]
    }
  }
  
}

module.exports = tradeBridge;