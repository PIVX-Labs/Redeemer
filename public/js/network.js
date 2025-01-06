// The code below assumes the explorer listed in the url is based on blockbook
var url = 'https://explorer.duddino.com';

function calculatefee(bytes) {
  // TEMPORARY: Hardcoded fee per-byte
  fee = Number(((bytes * 250) / 100000000).toFixed(8)); // 250 sats/byte
  return fee
}


async function getUTXOS(address){
  var client = new httpClient();
    const request = new Promise((resolve, reject) => {
      client.get(url + '/api/v2/utxo/' + address, function(response) {

        resolve(response)
    });
  });

  return await request
}


async function getTxData(txid){
  var client = new httpClient();
    const request = new Promise((resolve, reject) => {
      client.get(url + '/api/v2/tx/' + txid, function(response) {

        resolve(response)
    });
  });

  return await request
}

class httpClient {
  constructor() {
      this.get = function (aUrl, aCallback) {
      var anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function () {
          if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
          aCallback(anHttpRequest.responseText);
      };

      anHttpRequest.open("GET", aUrl, true);
      anHttpRequest.send(null);
      };
  }
}