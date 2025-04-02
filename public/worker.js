/*
Copyright 2022 Andrea Griffini

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// sha256(data) returns the digest
// sha256() returns an object you can call .add(data) zero or more time and .digest() at the end
// digest is a 32-byte Uint8Array instance with an added .hex() function.
// Input should be either a string (that will be encoded as UTF-8) or an array-like object with values 0..255.
function Asha256(data) {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
      h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19,
      tsz = 0, bp = 0;
  const k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
             0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
             0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
             0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
             0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
             0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
             0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
             0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
        rrot = (x, n) => (x >>> n) | (x << (32-n)),
        w = new Uint32Array(64),
        buf = new Uint8Array(64),
        process = () => {
            for (let j=0,r=0; j<16; j++,r+=4) {
                w[j] = (buf[r]<<24) | (buf[r+1]<<16) | (buf[r+2]<<8) | buf[r+3];
            }
            for (let j=16; j<64; j++) {
                let s0 = rrot(w[j-15], 7) ^ rrot(w[j-15], 18) ^ (w[j-15] >>> 3);
                let s1 = rrot(w[j-2], 17) ^ rrot(w[j-2], 19) ^ (w[j-2] >>> 10);
                w[j] = (w[j-16] + s0 + w[j-7] + s1) | 0;
            }
            let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
            for (let j=0; j<64; j++) {
                let S1 = rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25),
                    ch = (e & f) ^ ((~e) & g),
                    t1 = (h + S1 + ch + k[j] + w[j]) | 0,
                    S0 = rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22),
                    maj = (a & b) ^ (a & c) ^ (b & c),
                    t2 = (S0 + maj) | 0;
                h = g; g = f; f = e; e = (d + t1)|0; d = c; c = b; b = a; a = (t1 + t2)|0;
            }
            h0 = (h0 + a)|0; h1 = (h1 + b)|0; h2 = (h2 + c)|0; h3 = (h3 + d)|0;
            h4 = (h4 + e)|0; h5 = (h5 + f)|0; h6 = (h6 + g)|0; h7 = (h7 + h)|0;
            bp = 0;
        },
        add = data => {
            if (typeof data === "string") {
                data = typeof TextEncoder === "undefined" ? Buffer.from(data) : (new TextEncoder).encode(data);
            }
            for (let i=0; i<data.length; i++) {
                buf[bp++] = data[i];
                if (bp === 64) process();
            }
            tsz += data.length;
        },
        digest = () => {
            buf[bp++] = 0x80; if (bp == 64) process();
            if (bp + 8 > 64) {
                while (bp < 64) buf[bp++] = 0x00;
                process();
            }
            while (bp < 58) buf[bp++] = 0x00;
            // Max number of bytes is 35,184,372,088,831
            let L = tsz * 8;
            buf[bp++] = (L / 1099511627776.) & 255;
            buf[bp++] = (L / 4294967296.) & 255;
            buf[bp++] = L >>> 24;
            buf[bp++] = (L >>> 16) & 255;
            buf[bp++] = (L >>> 8) & 255;
            buf[bp++] = L & 255;
            process();
            let reply = new Uint8Array(32);
            reply[ 0] = h0 >>> 24; reply[ 1] = (h0 >>> 16) & 255; reply[ 2] = (h0 >>> 8) & 255; reply[ 3] = h0 & 255;
            reply[ 4] = h1 >>> 24; reply[ 5] = (h1 >>> 16) & 255; reply[ 6] = (h1 >>> 8) & 255; reply[ 7] = h1 & 255;
            reply[ 8] = h2 >>> 24; reply[ 9] = (h2 >>> 16) & 255; reply[10] = (h2 >>> 8) & 255; reply[11] = h2 & 255;
            reply[12] = h3 >>> 24; reply[13] = (h3 >>> 16) & 255; reply[14] = (h3 >>> 8) & 255; reply[15] = h3 & 255;
            reply[16] = h4 >>> 24; reply[17] = (h4 >>> 16) & 255; reply[18] = (h4 >>> 8) & 255; reply[19] = h4 & 255;
            reply[20] = h5 >>> 24; reply[21] = (h5 >>> 16) & 255; reply[22] = (h5 >>> 8) & 255; reply[23] = h5 & 255;
            reply[24] = h6 >>> 24; reply[25] = (h6 >>> 16) & 255; reply[26] = (h6 >>> 8) & 255; reply[27] = h6 & 255;
            reply[28] = h7 >>> 24; reply[29] = (h7 >>> 16) & 255; reply[30] = (h7 >>> 8) & 255; reply[31] = h7 & 255;
            reply.hex = () => {
                let res = "";
                reply.forEach(x => res += ("0" + x.toString(16)).slice(-2));
                return res;
            };
            return reply;
        };
  if (data === undefined) return {add, digest};
  add(data);
  return digest();
}

// HMAC-SHA256 implementation
function hmac_sha256(key, message) {
  if (typeof key === "string") {
      key = typeof TextEncoder === "undefined" ? Buffer.from(key) : (new TextEncoder).encode(key);
  }
  if (key.length > 64) key = sha256(key);
  let inner = new Uint8Array(64).fill(0x36);
  let outer = new Uint8Array(64).fill(0x5c);
  for (let i=0; i<key.length; i++) {
      inner[i] ^= key[i];
      outer[i] ^= key[i];
  }
  let pass1 = sha256(), pass2 = sha256();
  pass1.add(inner);
  pass1.add(message);
  pass2.add(outer);
  pass2.add(pass1.digest());
  return pass2.digest();
}
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
  const bChecksum1st =  Asha256(data);
  console.log(bChecksum1st)
  console.log(Array.from(new Uint8Array(bChecksum1st)))
  const bChecksum = Asha256(bChecksum1st);
  return bChecksum
}

var MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";//B58 Encoding Map
//B58 Encoding
var to_b58 = function(
    B,            //Uint8Array raw byte input
    A             //Base58 characters (i.e. "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
) {
    var d = [],   //the array for storing the stream of base58 digits
        s = "",   //the result string variable that will be returned
        i,        //the iterator variable for the byte input
        j,        //the iterator variable for the base58 digit array (d)
        c,        //the carry amount variable that is used to overflow from the current base58 digit to the next base58 digit
        n;        //a temporary placeholder variable for the current base58 digit
    for(i in B) { //loop through each byte in the input stream
        j = 0,                           //reset the base58 digit iterator
        c = B[i];                        //set the initial carry amount equal to the current byte amount
        s += c || s.length ^ i ? "" : 1; //prepend the result string with a "1" (0 in base58) if the byte stream is zero and non-zero bytes haven't been seen yet (to ensure correct decode length)
        while(j in d || c) {             //start looping through the digits until there are no more digits and no carry amount
            n = d[j];                    //set the placeholder for the current base58 digit
            n = n ? n * 256 + c : c;     //shift the current base58 one byte and add the carry amount (or just add the carry amount if this is a new digit)
            c = n / 58 | 0;              //find the new carry amount (floored integer of current digit divided by 58)
            d[j] = n % 58;               //reset the current base58 digit to the remainder (the carry amount will pass on the overflow)
            j++                          //iterate to the next base58 digit
        }
    }
    while(j--)        //since the base58 digits are backwards, loop through them in reverse order
        s += A[d[j]]; //lookup the character associated with each base58 digit
    return s          //return the final base58 string
}

onmessage = async (e) => {
  //privatePrefix, promoCode
    console.log("Message received from main script");
    console.log("Posting message back to main script: ",e.data[0], e.data[1]);
    const promoCode = e.data[1]
    const privatePrefix = e.data[0]
    const arrTargets = [
        12500000
    ];

    

      // Convert the string 'Promo Code' to a Uint8Array byte representation
      let arrByteCode = new TextEncoder().encode(promoCode);

      // Prepare hashing, performance and emitter data
      const target = arrTargets[arrTargets.length - 1];
      let i = 0;
      let lastTime = Date.now();
      const times = []; // A 10-entry rolling average of the time diff between reports
      const updateInterval = Math.ceil(target / 100); // Update progress every 1% of target
      let lastUpdatei = 0;
      
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
              postMessage(progress);
          }
          i++;

      }
      console.log("End Time: ", Date.now())
      // Encode the final hash as a WIF Private Key (the 'wallet' of the Promo Code)
      console.log("ArrayCodeBytes: ",Array.from(new Uint8Array(arrByteCode)))
      console.log("privatePrefix: ",privatePrefix)

      
      const cWallet = await encodePrivkey(Array.from(new Uint8Array(arrByteCode)), privatePrefix);
      console.log("cWallet: " + cWallet)
      // Return it!
      postMessage(await cWallet)

  };
  