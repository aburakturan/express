
// const Binance = require('binance-api-node').default
const Binance = require('node-binance-api')
const fs = require('fs');
const filterObject = require('filter-obj');
const { exit } = require('process');
const fetch = require('node-fetch');


// const client = Binance()

// // Authenticated client, can make signed calls
// const client2 = Binance({
//   apiKey: 'Ibda0NTWiLnNaA7IqTjzoAEkwrfMgofif8qn8sFbJkzvPKrR0lAjKUv6uUxRE5XN',
//   apiSecret: 'Q1nKtWE85DP4RYypcHZxyhOz5oDoQph2OCoYbPGC6dwZH9HIkkRab9dbXWmEop0b',
//   getTime: 1,
// })

const binance = new Binance().options({
  // APIKEY: 'Ibda0NTWiLnNaA7IqTjzoAEkwrfMgofif8qn8sFbJkzvPKrR0lAjKUv6uUxRE5XN',
  APIKEY: '0o8vTST2w4uH5cOfwoGhBqFySy04jFHGQ9yHZHdESFFpyCWQDCnH9aaJSekVfDGq',
  // APISECRET: 'Q1nKtWE85DP4RYypcHZxyhOz5oDoQph2OCoYbPGC6dwZH9HIkkRab9dbXWmEop0b'
  APISECRET: 'PTdpxSlAFsbnY5Qn3djGvKWO2MPJF7wNpnSTdE7XWhQ0JIxODp5c18BC1MYfCZOn'
});

const interval = 600 // 1000 = 1 seconds
const stableCoin= 'USDT'
const containerLimit = 4
let increaseCalculatorContainer = []
let increaseHolderContainer = []
let buyContainer = []

const fetchUrlDomain = "https://api.telegram.org/"
const telegramKey="bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw"
const chatID = "-490464614"


const tradeBridge = {

  
  // Get the current prices of the pairs
  getPairs: async function() {
    await binance.prices().then(data => tradeBridge.filterPairs (data))
    setTimeout(function () { tradeBridge.getPairs();}, interval);
  },

  // Filter the current pairs
  filterPairs: async function(data) {
    tradeBridge.parsePairs(filterObject(data, (key, value) =>  key.includes(stableCoin) === true  ))
  },

  // Parse the current pairs
  parsePairs: async function(data) {
    for (const [key, value] of Object.entries(data)) {
      tradeBridge.increaseCalculatorContainerer(key,value)
    }
  },
  increaseCalculatorContainerer: async function(key, value){
    // tradeBridge.sendTelegramTest()
    if (increaseCalculatorContainer[key]){
      if (increaseCalculatorContainer[key][0]){
        if (increaseCalculatorContainer[key][1]){
          increaseCalculatorContainer[key][0] = increaseCalculatorContainer[key][1]
          increaseCalculatorContainer[key][1] = value
          // console.log(increaseCalculatorContainer[key]);
          tradeBridge.increaceCalculator(key, increaseCalculatorContainer[key][0], increaseCalculatorContainer[key][1])
          // console.log('Sıfırlandı 1.Hane eklendi');
        } else {
          increaseCalculatorContainer[key][1] = value
        //   console.log(increaseCalculatorContainer[key]);
          // console.log('2.Hane eklendi');
        }
      }
    } else {
      // console.log('Oluşturuldu 1.Hane eklendi')
      increaseCalculatorContainer[key] = []
      increaseCalculatorContainer[key][0] = value
    }
  },

  increaceCalculator: async function(key, current, old){
    increasementPercentage = (current-old)/old*100.0;
    percentage = increasementPercentage;
    // console.log(percentage)
    tradeBridge.increaseHolderContainerer(key,percentage)
  },
  
  increaseHolderContainerer: async function(key, percentage){
   if (percentage>0){

    // let _percentage = Number.parseFloat(percentage).toFixed(2)
    let _percentage = percentage
    // console.log(increaseHolderContainer[key])
    // if (increaseHolderContainer[key]){
    //     for (i=containerLimit; i>=0; i--){
    //         if (increaseHolderContainer[key][i] != null){
    //             if (i=containerLimit) {
    //                 tradeBridge.formatHolderContainer(key)
    //             } else {
    //                 tradeBridge.increaseHolderContainerLogic(key, i+1, _percentage)
    //             }
    //         }
    //     }
    // } else {
    //     increaseHolderContainer[key] = []
    //     tradeBridge.increaseHolderContainerLogic(key, 0, '_percentage')  
    // }
                                    // console.log(percentage)
                                    if (increaseHolderContainer[key]){
                                        // console.log(increaseHolderContainer[key])
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
    // console.log(increaseHolderContainer)
  },

  buySignal: async function(key, holder){
    let increaseInterval = ((interval * (containerLimit+1))/1000)
    let totalHolder = 0
    for (i=0; i<=holder.length-1; i++){
        totalHolder = totalHolder + holder[i]
    }

    let totalPercentage = totalHolder / holder.length
    console.log(key, "paritesi",  increaseInterval, "saniye içinde, ",totalPercentage, " oranında artış gösterdi.")
    // console.log(key, "paritesi",  increaseInterval, "saniye içinde, %",totalPercentage, "artış gösterdi. Uyarı sayısı:", buyContainer[key].length + 1)
    

    tradeBridge.sendTelegram(key,increaseInterval,totalPercentage)
    
    

    // tradeBridge.buyContainerer(key, totalPercentage)

  },
  
//   buyContainerer: async function(key, totalPercentage){
//     if (buyContainer[key]){
//         buyContainer[key].push(totalPercentage)
//     } else {
//         buyContainer[key] = []
//     }
//   },
  
//   formatBuyContainerer: async function(key){
//     for (i=0; i<=buyContainer.length; i++){
//         delete buyContainer[key][i]
//     }
//   },
  

sendTelegram: async function(key, increaseInterval, totalPercentage){

    // const fetchUrlDomain = "https://api.telegram.org/"
    // const telegramKey="bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw"
    // const chatID = "-490464614"

    text=key + "paritesi" + increaseInterval + "saniye icinde, %" + Number.parseFloat(totalPercentage).toFixed(2) + " oraninda yukseldi."
    url = "https://api.telegram.org/bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw/sendMessage?chat_id=-490464614&text="+text
    fetch(url);
  },

sendTelegramTest: async function(){

    // const fetchUrlDomain = "https://api.telegram.org/"
    // const telegramKey="bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw"
    // const chatID = "-490464614"

    text="DEGOUSDT paritesi 300 saniye icinde % 0.38944407070779197 oraninda yukseldi."
    url = "https://api.telegram.org/bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw/sendMessage?chat_id=-490464614&text="+text
    fetch(url);
  },

  increaseHolderContainerLogic: async function(key,  step , percentage){
    
    if (percentage <= 0){
        tradeBridge.formatHolderContainer(key)
    } else {
        increaseHolderContainer[key][step] = percentage
    }
  },

  formatHolderContainer: async function(key){
    for (i=0; i<=containerLimit; i++){
        delete increaseHolderContainer[key][i]
    }
  }
  
}

// https://api.telegram.org/bot1664179275:AAHSNRalCCJmfHrnpm0GnijgUbbH38u41vw/sendMessage?chat_id=1664179275&text=test

// const tradeBridge = {
//   getCharts: async function() {
//     binance.prevDay("BNBBTC", (error, prevDay, symbol) => {
//       let markets = ['ETH'];
//               // for ( let obj of prevDay ) {
//               // 	let symbol = obj.symbol;
//               // 	if ( obj.volume < 1 ) continue; // perform any filtering you want
//               // 	console.log(symbol+" volume:"+obj.volume+" change: "+obj.priceChangePercent+"%");
//               // 	//if ( symbol.substr(-3) !== 'BTC' ) continue; // filter BTC only, etc
//               // 	markets.push(symbol);
//               // }
//               console.info("Total markets: ", markets.length);
//               let interval = '5m';
//               binance.websockets.chart(markets, interval, (symbol, interval, chart) => {

//                 try {
//                   //let tick = binance.last(chart); // Get last tick only
//                   //const last = chart[tick].close;
//                   //console.log(symbol+" "+interval+": "+close);
//                   let output = [], tick;
//                   // Get the last 10 candles:		
//                   const range = Object.keys(chart).slice(-10);
//                   for ( let time of range ) {
//                     tick = chart[time];
//                     tick.timestamp = Number(time);
//                     tick.localTime = new Date(Number(time)).toLocaleString();

//                     let timestamp = new Date(tick.timestamp).toLocaleString();
//                     console.log(timestamp+" "+symbol+": $"+tick.close+"\t high: $"+tick.high+"\t low: $"+tick.low);
//                     output.push(tick);
//                   }

//                   // Save just the last 10 entires to file:
//                   fs.writeFile("charts/"+symbol+".json", JSON.stringify(output, null, 4), (err)=>{});
//                   // Optionally convert 'chart' object to array:
//                   // let ohlc = binance.ohlc(chart);
//                   // console.log(symbol, ohlc);

//                   // Save every candlestick to file (all 500 candles)
//                   //fs.writeFile("charts/"+symbol+".json", JSON.stringify(chart, null, 4), (err)=>{});
//                 }  catch (error) {
//                   console.log('errorX', error)
//                   if (['ENOENT', 'ENOTFOUND'].includes(error)) {
//                     console.log('Waiting for internet to come back...')
//                   } else {
//                     throw error
//                   }
//                 }
//         });
//     })
//   }
// }






// const tradeBridge = {
//     test: async function() {
//         try {
//             console.log(await client.prices())


//         } catch(err) {
//           console.log('ERROR: ', err.message);
//           return false;
//         }
//       },
  
// }

module.exports = tradeBridge;