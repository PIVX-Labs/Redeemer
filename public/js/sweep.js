async function sweep(privateKey, desitnationAddress){
    console.log(privateKey)
    console.log(desitnationAddress)





    // // Private Key Generation
    // const pkBytes = privateKey
    // const pkNetBytesLen = pkBytes.length + 2;
    // const pkNetBytes = new Uint8Array(pkNetBytesLen);

    // // Network Encoding
    // pkNetBytes[0] = SECRET_KEY; // Private key prefix (1 byte)
    // writeToUint8(pkNetBytes, pkBytes, 1);            // Private key bytes  (32 bytes)
    // pkNetBytes[pkNetBytesLen - 1] = 1;               // Leading digit      (1 byte)

    // // Double SHA-256 hash
    // const shaObj = new jsSHA(0, 0, { "numRounds": 2 });
    // shaObj.update(pkNetBytes);

    // // WIF Checksum
    // const checksum = shaObj.getHash(0).slice(0, 4);
    // const keyWithChecksum = new Uint8Array(pkNetBytesLen + checksum.length);
    // writeToUint8(keyWithChecksum, pkNetBytes, 0);
    // writeToUint8(keyWithChecksum, checksum, pkNetBytesLen);

    // // Return both the raw bytes and the WIF format
    // console.log( { pkBytes, strWIF: bitjs.Base58.encode(keyWithChecksum) })


    //Validate WIF
    console.log(verifyWIF(privateKey))
    const pkbytes = verifyWIF(privateKey, true)
 
    console.log(pkbytes)

    const addr = deriveAddress(pkbytes)
    console.log(addr)

    console.log(bitjs.wif2address(privateKey))
}

// bn.js alias
function uint256(x, base) {
    return new BN(x, base)
}



const pubKeyHashNetworkLen = 21;
const pubChksum = 4;
const pubPrebaseLen = pubKeyHashNetworkLen + pubChksum;
function deriveAddress(pkBytes,
    publicKey,
    fNoEncoding,
    compress = false,
    output="ENCODED", // "ENCODED", "HEX" or "RAW_BYTES"
    ){
    if(!pkBytes && !publicKey) return "woopse";
    // Public Key Derivation
    let nPubkey = (publicKey || Crypto.util.bytesToHex(nobleSecp256k1.getPublicKey(pkBytes, compress)));
    if (output === "HEX") {
      return nPubkey;
    } else if (output === "RAW_BYTES") {
      return Crypto.util.hexToBytes(nPubkey);
    }
    nPubkey = nPubkey.substring(2);
    const pubY = uint256(nPubkey.substr(64), 16);
    nPubkey = nPubkey.substr(0, 64);
    const publicKeyBytesCompressed = Crypto.util.hexToBytes(nPubkey);
    publicKeyBytesCompressed.unshift(pubY.isEven() ? 2 : 3);
  
    // If we're only trying to derive a Secp256k1 pubkey (not an encoded address), return early
    if (fNoEncoding) return publicKeyBytesCompressed;
  
    // First pubkey SHA-256 hash
    const pubKeyHashing = new jsSHA(0, 0, { "numRounds": 1 });
    pubKeyHashing.update(publicKeyBytesCompressed);
  
    // RIPEMD160 hash
    const pubKeyHashRipemd160 = ripemd160(pubKeyHashing.getHash(0));
  
    // Network Encoding
    const pubKeyHashNetwork = new Uint8Array(pubKeyHashNetworkLen);
    pubKeyHashNetwork[0] = PUBKEY_ADDRESS;
    writeToUint8(pubKeyHashNetwork, pubKeyHashRipemd160, 1);

  // Double SHA-256 hash
  const pubKeyHashingS = new jsSHA(0, 0, { "numRounds": 2 });
  pubKeyHashingS.update(pubKeyHashNetwork);
  const pubKeyHashingSF = pubKeyHashingS.getHash(0);

  // Checksum
  const checksumPubKey = pubKeyHashingSF.slice(0, 4);

  // Public key pre-base58
  const pubKeyPreBase = new Uint8Array(pubPrebaseLen);
  writeToUint8(pubKeyPreBase, pubKeyHashNetwork, 0);
  writeToUint8(pubKeyPreBase, checksumPubKey, pubKeyHashNetworkLen);

  // Encode as Base58 human-readable network address
  return bitjs.Base58.encode(pubKeyPreBase);
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





// Writes a sequence of Array-like bytes into a location within a Uint8Array
function writeToUint8(arr, bytes, pos) {
    const arrLen = arr.length;
    // Sanity: ensure an overflow cannot occur, if one is detected, somewhere in MPW's state could be corrupted.
    if ((arrLen - pos) - bytes.length < 0) {
        const strERR = 'CRITICAL: Overflow detected (' + ((arrLen - pos) - bytes.length) + '), possible state corruption, backup and refresh advised.';
        alert(strERR);
        throw Error(strERR);
    }
    let i = 0;
    while (pos < arrLen)
        arr[pos++] = bytes[i++];
}