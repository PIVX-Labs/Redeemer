const https = require('https');

const express = require("express");
const router = express.Router();
const networkData = require("./networkdata.json")

router.get("/api/v1/redeemer/utxo", async function(req, res){
  // We will pass an address and the response needs to be formatted in a standard way no matter the explorer
  const coin = (req.query.coin).toUpperCase() // We need this to figure out what explorer we want to use
  const address = req.query.addr // We need this to get the UTXO information from the explorer

  const selectedCoin = networkData[coin]
  


  // First check if it has a explorer type we have developed for
  if(selectedCoin.explorerType == "TREZORBlockbook"){
    const returnData = await getUTXOTrezor(selectedCoin, address)
    console.log("GotUTXOsFromTrezor: ", returnData)
    let response = []
    for (const uxto of returnData) {
      response.push({
        txid : uxto.txid,
        vout : uxto.vout,
        value : uxto.value,
        height : uxto.height,
        confirmations : uxto.confirmations,
      })
    }
    res.json(response)
  }

})

router.get("/api/v1/redeemer/tx", async function(req, res){
  // We will pass an address and the response needs to be formatted in a standard way no matter the explorer
  const coin = (req.query.coin).toUpperCase() // We need this to figure out what explorer we want to use
  const tx = req.query.tx // We need this to get the UTXO information from the explorer

  const selectedCoin = networkData[coin]
  


  // First check if it has a explorer type we have developed for
  if(selectedCoin.explorerType == "TREZORBlockbook"){
    const returnData = await getTXTrezor(selectedCoin, tx)
    console.log("GotTXFromTrezor: ", returnData)
    res.json(returnData)
  }

})


// This is for CORS bypassing
router.get("/api/v1/redeemer/sendtx", async function (req, res) {
    // Return the search results
    // console.log("REQ,RES", req, res)
    console.log(req.query)
    const coin = (req.query.coin).toUpperCase()
    const signedTx = req.query.tx
    

    console.log("Signed tx:", signedTx)
    const selectedCoin = networkData[coin]

    if(selectedCoin.explorerRoot){
      // First check if it has a explorer type we have developed for
      if(selectedCoin.explorerType == "TREZORBlockbook"){
        const returnData = await sendTxTrezor(selectedCoin, signedTx)
        if("result" in returnData){
          res.json({ 
            "success": true,
            "transaction": returnData.result
          })
        }else if("error" in returnData){
          console.log("error in return from trezor: ", returnData)
          res.json({ 
            "success": false,
            "error": returnData.error
          })
        }else{
          console.log(returnData)
          res.json({ "success": false})
        }
      }
    }else{
      // No explorer set up for this return false
      res.json({ "success": false})
    }


});


async function getUTXOTrezor(selectedCoin, address){
  const url = selectedCoin.explorerRoot + "/api/v2/utxo/" + address
  const response = await fetch(url);
  return await response.json()
}

async function getTXTrezor(selectedCoin, tx){
  const url = selectedCoin.explorerRoot + "/api/v2/tx/" + tx
  const response = await fetch(url);
  return await response.json()
}

async function sendTxTrezor(selectedCoin, signedTx){
  const url = selectedCoin.explorerRoot + "/api/v2/sendtx/" + signedTx
  const response = await fetch(url);
  return await response.json()
}


module.exports = router;