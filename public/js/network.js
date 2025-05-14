// // The code below assumes the explorer listed in the url is based on blockbook
// var url = 'https://explorer.duddino.com';

// function calculatefee(bytes) {
//   // TEMPORARY: Hardcoded fee per-byte
//   let fee = Number(((bytes * 1) / 100000000).toFixed(8)); // 1 sats/byte
//   if (fee < (1920/ 100000000).toFixed(8)){
//     fee = (1920/ 100000000).toFixed(8)
//   }
//   return fee
// }


// async function getUTXOS(address){
//   var client = new httpClient();
//     const request = new Promise((resolve, reject) => {
//       client.get(url + '/api/v2/utxo/' + address, function(response) {

//         resolve(response)
//     });
//   });

//   return await request
// }


// async function getTxData(txid){
//   var client = new httpClient();
//     const request = new Promise((resolve, reject) => {
//       client.get(url + '/api/v2/tx/' + txid, function(response) {

//         resolve(response)
//     });
//   });

//   return await request
// }

// class httpClient {
//   constructor() {
//       this.get = function (aUrl, aCallback) {
//       var anHttpRequest = new XMLHttpRequest();
//       anHttpRequest.onreadystatechange = function () {
//           if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
//           aCallback(anHttpRequest.responseText);
//       };

//       anHttpRequest.open("GET", aUrl, true);
//       anHttpRequest.send(null);
//       };
//   }
// }

async function getUTXOS(coinData,address){
    const url = "/api/v1/redeemer/utxo?" + "coin=" + coinData.ticker + "&addr=" + address; 
    console.log(url)
    try {
        const response = await fetch(url, {
        });
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
        return json
    } catch (error) {
        console.error(error.message);
    }
}

async function getTxData(coinData, txid){
    const url = "/api/v1/redeemer/tx?" + "coin=" + coinData.ticker + "&tx=" + txid; 
    try {
        const response = await fetch(url, {
        });
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
        return json
    } catch (error) {
        console.error(error.message);
    }
}