const WebSocket = require('ws');


const ws = new WebSocket('wss://stream.binance.com/DOGEUSDT@ticker');



const wsBridge = {

    listen: async function() {

        ws.on('message', (data) => {

            console.log(data)

        })
 
    }

}



module.exports = wsBridge;