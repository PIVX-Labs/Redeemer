

async function sweep(privateKey, desitnationAddress){
    console.log(privateKey)

    //Validate WIF
    const validatedAsWIF = verifyWIF(privateKey)

    if(!validatedAsWIF){
        alert('Bad privatekey')
    }

    const pubkey = importWallet(privateKey)

    console.log("getPubKey function: ", pubkey)

    
    const UTXOs = JSON.parse(await getUTXOS(pubkey))
    //console.log(UTXOs[0])

    // There should only be one UTXO we want to get
    const txData = JSON.parse(await getTxData(UTXOs[0].txid))
    //console.log(txData)


    const trx = bitjs.transaction();
    let txid = UTXOs[0].txid;
    let index = UTXOs[0].vout;
    let script = txData['vout'][index]['hex'];
    //console.log(txData['vout'][index]['hex'])
    trx.addinput(txid,index,script);

    // Calculate the fee
    const amountToSweep = UTXOs[0].value - calculatefee(100)
    console.log(UTXOs[0].value )
    console.log(amountToSweep)


    trx.addoutput(desitnationAddress,amountToSweep);
    console.log("Signed TRX: ", trx.sign(privateKey,1))


    
}
  
function verifyWIF(strWIF = "", fParseBytes = false, skipVerification = false) {
    const bWIF = new Uint8Array(bitjs.Base58.decode(strWIF));
    if (bWIF.byteLength !== PRIVKEY_BYTE_LENGTH) {
        throw Error("Private key length (" + bWIF.byteLength + ") is invalid, should be " + PRIVKEY_BYTE_LENGTH + "!");
    }
    
    // Verify the network byte
    if (bWIF[0] !== SECRET_KEY) {
        // Find the network it's trying to use, if any
        const cNetwork = Object.keys(cChainParams).filter(strNet => strNet !== 'current').map(strNet => cChainParams[strNet]).find(cNet => cNet.SECRET_KEY === bWIF[0]);
        // Give a specific alert based on the byte properties
        throw Error(cNetwork ? "This private key is for " + (cNetwork.isTestnet ? "Testnet" : "Mainnet") + ", wrong network!" : "This private key belongs to another coin, or is corrupted.");
    }
    
    // Perform SHA256d hash of the WIF bytes
    const shaHash = new jsSHA(0, 0, { "numRounds": 2 });
    shaHash.update(bWIF.slice(0, 34));
    
    // Verify checksum (comparison by String since JS hates comparing object-like primitives)
    const bChecksumWIF = bWIF.slice(bWIF.byteLength - 4);
    const bChecksum = shaHash.getHash(0).slice(0, 4);
    if (bChecksumWIF.join('') !== bChecksum.join('')) {
        throw Error("Private key checksum is invalid, key may be modified, mis-typed, or corrupt.");
    }
        
    return fParseBytes ? Uint8Array.from(bWIF.slice(1, 33)) : true;
}  


/*
* This function is just used as a wrapper for sweep while we are testing
*/
async function testingPage(){

    const privateKey = document.getElementById("privkey").value
    const desitinationAddress = document.getElementById("sweepAddr").value


    sweep(privateKey,desitinationAddress)
}