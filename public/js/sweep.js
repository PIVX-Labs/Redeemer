/* Constants */
/** Length of a private key pre-checksum */
const pkNetBytesLen = 34;

/** The target hash depths at which a private key is derived, the last entry is the current depth.
 * 
 * The Target is updated periodically to match 30 seconds based on the speed of modern hardware;
 * this is what keeps PIVX-Promos secure, as without a target, or with a too low target, Promos
 * would be very easy to brute force.
 * 
 * A history of targets is kept to keep backwards-compatibility; if the newest target was not found, then
 * the client can work backwards to check older targets for derived Promo keys and balances.
 */
const arrTargets = [
    12500000
];


/* --- UTILS --- */
/**
 * Writes a sequence of bytes into a location within a Uint8Array
 * @param {Uint8Array} arr - Array to write to
 * @param {Uint8Array} bytes - Bytes to write to the array
 * @param {number} pos - Position to start writing from
 */
function writeToUint8(arr, bytes, pos) {
    const arrLen = arr.length;
    let i = 0;
    while (pos < arrLen) arr[pos++] = bytes[i++];
}

/**
 * Perform a double-SHA256 hash
 * @param {Uint8Array} data - Data to hash
 * @returns {Buffer} - The Hash
 */
async function dSHA256(data) {
    //return createHash("sha256").update(createHash("sha256").update(data).digest()).digest();
    const bChecksum1st =  await window.crypto.subtle.digest("SHA-256", data);
    console.log(bChecksum1st)
    console.log(Array.from(new Uint8Array(bChecksum1st)))
    const bChecksum = await window.crypto.subtle.digest("SHA-256", bChecksum1st);
    return bChecksum
}

/* --- HIGH-LEVEL FUNCTIONS --- */

/**
 * The resulting private key data derived from a Promo Code
 * @typedef {Object} PromoKey
 * @property {Uint8Array} bytes - The Private Key bytes.
 * @property {string} wif - The WIF encoded private key string.
 */

/**
 * Network Encode a private key from raw bytes
 * @param {Uint8Array} pkBytes - 32 Bytes
 * @param {number} privatePrefix - One-byte WIF network prefix
 * @returns {PromoKey}
 */
async function encodePrivkey(pkBytes, privatePrefix) {
    console.log("Passed: ", pkBytes, privatePrefix )
    
    // Private Key Constants
    const pkNetBytesLen = pkBytes.length + 2;
    const pkNetBytes = new Uint8Array(pkNetBytesLen);

    console.log("Private Key Constants", pkNetBytesLen,pkNetBytes)

    // Network Encoding
    pkNetBytes[0] = privatePrefix; // Private key prefix (1 byte)
    writeToUint8(pkNetBytes, pkBytes, 1); // Private key bytes  (32 bytes)
    pkNetBytes[pkNetBytesLen - 1] = 1; // Leading digit      (1 byte)

    console.log("Network Encoding: ",pkNetBytes)

    // Double SHA-256 hash
    const shaObj = await dSHA256(pkNetBytes);

    // WIF Checksum
    const checksum = Array.from(new Uint8Array(shaObj)).slice(0, 4);
    console.log(checksum)
    console.log(pkNetBytesLen)
    console.log(pkNetBytes)
    console.log(checksum.length)
    const keyWithChecksum = new Uint8Array(pkNetBytesLen + checksum.length);
    writeToUint8(keyWithChecksum, pkNetBytes, 0);
    writeToUint8(keyWithChecksum, checksum, pkNetBytesLen);

    // Return both the raw bytes and the WIF format
    console.log("Pre to_b58",keyWithChecksum,keyWithChecksum, checksum, pkNetBytesLen)
    console.log("encodePrivKey: ",pkBytes,to_b58(keyWithChecksum,"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"))
    return { bytes: pkBytes, wif: to_b58(keyWithChecksum,"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz") };
}
class PromoCode {
    /**
     * Creates a new instance of the PromoCode class.
     * @constructor
     * @param {string} code - The cleartext 'Promo Code'
     */
    constructor(code) {
        this.code = code;
        //this.progressEmitter = new EventEmitter();
    }

    /**
     * The cleartext 'Promo Code' 
     * @type {string}
     */
    code = '';

    /**
     * The progress and ETA event emitter, sent each 1% of derive progress
     * @type {EventEmitter}
     */
    //progressEmitter;

    /**
     * Derive a private key from the Promo Code (for Creation or Redemption)
     * @param {number} - The private network byte to use, default is PIVX Mainnet
     */
    async derivePrivateKey(privatePrefix = 212) {
        // Convert the string 'Promo Code' to a Uint8Array byte representation
        let arrByteCode = new TextEncoder().encode(this.code);

        // Prepare hashing, performance and emitter data
        const target = arrTargets[arrTargets.length - 1];
        let i = 0;
        let lastTime = Date.now();
        const times = []; // A 10-entry rolling average of the time diff between reports
        const updateInterval = Math.ceil(target / 100); // Update progress every 1% of target        
        console.log("Start Time: ", Date.now())
        // Recursively hash until our target is hit
        while (i < target) {
            // WAS WORKING WITH THIS JUST SLOW AS HELL
            // arrByteCode = await window.crypto.subtle.digest("SHA-256", arrByteCode);
            
            arrByteCode = Asha256(arrByteCode)
            // Send progress updates every updateInterval iterations
            if (i % updateInterval === 0) {
                // Track progress percentage
                const progress = Math.floor(i / (target / 100));

                // Track timing averages
                const currentTime = Date.now();
                const timeDiff = currentTime - lastTime;
                times.push(timeDiff);
                if (times.length > 10) times.unshift();
                const avgTimePerIteration = times.reduce((a, b) => a + b) / times.length / updateInterval;
                const eta = (target - i) * avgTimePerIteration * 0.001;
                lastTime = currentTime;

                // Emit Progress to the receiver
                
                console.log("Progress: ", progress, "%  Estimated Time Remaining: ",eta)
            }
            i++;

        }
        console.log("End Time: ", Date.now())
        // Encode the final hash as a WIF Private Key (the 'wallet' of the Promo Code)
        console.log("ArrayCodeBytes: ",Array.from(new Uint8Array(arrByteCode)))
        console.log("privatePrefix: ",privatePrefix)

        
        const cWallet = encodePrivkey(Array.from(new Uint8Array(arrByteCode)), privatePrefix);
        console.log("cWallet: " + cWallet)
        // Return it!
        return cWallet;
    }
}

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
    const feeAmount = parseFloat(calculatefee(300))
    const currentAmountAvaliable = parseFloat(UTXOs[0].value)/100000000
    console.log(UTXOs[0].value)
    console.log(feeAmount)
    const amountToSweep = (currentAmountAvaliable - feeAmount).toFixed(8)
    console.log(amountToSweep)


    trx.addoutput(desitnationAddress,amountToSweep);
    const signedTRX = trx.sign(privateKey,1)
    console.log("Signed TRX: ", signedTRX)

    // TODO: In the future we will return the confirmed txid but for now just return the signedTRX
    return signedTRX
    
}
  
async function verifyWIF(strWIF = "", fParseBytes = false, skipVerification = false) {
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
    //return createHash("sha256").update(createHash("sha256").update(data).digest()).digest();
    // const bChecksum1st = await window.crypto.subtle.digest("SHA-256", data);
    // const bChecksum = await window.crypto.subtle.digest("SHA-256", bChecksum1st);
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

    const pivcode = document.getElementById("PivCode").value
    // const privateKey = document.getElementById("privkey").value
    const destinationAddress = document.getElementById("sweepAddr").value

    if (window.Worker) {
        const myWorker = new Worker("worker.js");
        myWorker.postMessage([212,pivcode]);
        console.log("Message posted to worker");


        myWorker.onmessage = async (e) => {
        
            console.log("Message received from worker",e);
            if(Number.isInteger(e.data)){
                document.getElementById("derivingCode").innerHTML = "Progress: "+ e.data
            }else{
                const returnFromSweep = await sweep(e.data.wif,destinationAddress)
                
                console.log("returned from sweep: ", returnFromSweep)

                // TODO: In the future we will return the confirmed txid but for now just return the signedTRX
                document.getElementById("trx").value = returnFromSweep
                document.getElementById("trx").style.display = 'block'
                document.getElementById("derivingCode").innerHTML = "<h4> Signed Transaction: </h4>"
            }

        };
    }else{
        // Old version if web workers aren't available 
        document.getElementById("derivingCode").innerHTML = 
        "<h4>Please wait this will take no more then 60 seconds</h4><h5>This screen may freeze while the code is being unlocked. You can open the developer console to see more information</h5>"

        // Required in otherwise this will lock up the page and not allow the textContent to show up
        setTimeout(async () => {
            const code = new PromoCode(pivcode)
            const derived = await code.derivePrivateKey()
            console.log("derived: ", derived)
            console.log("DerivedPassed: ", derived.wif)
            const returnFromSweep = await sweep(derived.wif,destinationAddress)

            console.log("returned from sweep: ", returnFromSweep)

            // TODO: In the future we will return the confirmed txid but for now just return the signedTRX
            document.getElementById("trx").value = returnFromSweep
            document.getElementById("trx").style.display = 'block'
            document.getElementById("derivingCode").innerHTML = "<h4> Signed Transaction: </h4>"
            
        }, "1000");

    }


}