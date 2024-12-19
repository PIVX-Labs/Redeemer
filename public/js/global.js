function createSimpleTransation(wif, address, value) {
    let nBalance = getBalance(address);
    if (value > nBalance) return alert("Balance is too small! (" + nBalance + " - " + value + " = " + (nBalance - value).toFixed(8) + ")");
    console.log("Constructing TX of value: " + value + " SCC");
    // Loop our cached UTXOs and construct a TX
    trx = bitjs.transaction();
    let txValue = 0;
    for (const UTXO of cachedUTXOs) {
        if (txValue > value) {
            // Required Coin Control value met, yahoo!
            console.log("Coin Control: TX Constructed! Selected " + trx.inputs.length + " input(s) (" + txValue + " SCC)");
            break;
        }
        trx.addinput(UTXO.txid, UTXO.outputIndex, UTXO.script);
        txValue += Number((UTXO.satoshis / 100000000).toFixed(8));
        txValue = Number(txValue.toFixed(8));
        console.log("Coin Control: Selected input " + UTXO.txid.substr(0, 6) + "(" + UTXO.outputIndex + ")... (Added " + (UTXO.satoshis / 100000000).toFixed(8) + " SCC - Total: " + txValue + ")");
    }

    if (address != '' && value != '') {
        calculatefee(trx.serialize().length);
        trx.addoutput(address, value);//Sending to this address
        addresschange = publicKeyForNetwork;
        totalSent = (parseFloat(fee) + parseFloat(value)).toFixed(8);
        valuechange = (parseFloat(txValue) - parseFloat(totalSent)).toFixed(8);
        if (totalSent <= balance) {
            trx.addoutput(addresschange, valuechange);//Change Address
            sendTransaction(trx.sign(wif, 1));
        } else {
            console.warn("Amount: " + value + "\nFee: " + fee + "\nChange: " + valuechange + "\nTOTAL: " + totalSent);
        }
    } else {
        console.log("No address or value");
    }
}


// A class stolen from My PIVX Wallet's PIVX Promos implementation
class PromoWallet {
    /**
     * @param {object} data - An object containing the PromoWallet data
     * @param {string} data.code - The human-readable Promo Code
     * @param {string} data.address - The public key associated with the Promo Code
     * @param {Uint8Array} data.pkBytes - The private key bytes derived from the Promo Code
     * @param {Date|number} data.time - The Date or timestamp the code was created
     * @param {Array<object>} data.utxos - UTXOs associated with the Promo Code
     */
    constructor({ code, address, pkBytes, utxos, time }) {
        /** @type {string} The human-readable Promo Code */
        this.code = code;
        /** @type {string} The public key associated with the Promo Code */
        this.address = address;
        /** @type {Uint8Array} The private key bytes derived from the Promo Code */
        this.pkBytes = pkBytes;
        /** @type {Array<object>} UTXOs associated with the Promo Code */
        this.utxos = utxos;
        /** @type {Date|number} The Date or timestamp the code was created */
        this.time = time instanceof Date ? time : new Date(time);
    }

    /**
     * Synchronise UTXOs and return the balance of the Promo Code
     * @param {boolean} - Whether to use UTXO Cache, or sync from network
     * @returns {Promise<number>} - The Promo Wallet balance in sats
     */
    async getBalance(fCacheOnly = false) {
        // Refresh our UTXO set
        if (!fCacheOnly) {
            await this.getUTXOs();
        }

        // Return the sum of the set
        return this.utxos.reduce((a, b) => a + b.sats, 0);
    }

    /**
     * Synchronise UTXOs and return them
     * @param {boolean} - Whether to sync simple UTXOs or full UTXOs
     * @returns {Promise<Array<object>>}
     */
    async getUTXOs(fFull = false) {
        // TODO
        // If we don't have it, derive the public key from the promo code's WIF
        if (!this.address) {
            this.address = deriveAddress({ pkBytes: this.pkBytes });
        }

        // Check for UTXOs on the explorer
        const arrSimpleUTXOs = await getNetwork().getUTXOs(this.address);

        // Either format the simple UTXOs, or additionally sync the full UTXOs with scripts
        this.utxos = [];
        for (const cUTXO of arrSimpleUTXOs) {
            if (fFull) {
                this.utxos.push(await getNetwork().getUTXOFullInfo(cUTXO));
            } else {
                this.utxos.push({
                    id: cUTXO.txid,
                    sats: parseInt(cUTXO.value),
                    vout: cUTXO.vout,
                });
            }
        }

        // Return the UTXO set
        return this.utxos;
    }
}