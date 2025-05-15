async function getUTXOS(coinData,address){
    const url = "/api/v1/redeemer/utxo?" + "coin=" + coinData.ticker + "&addr=" + address; 
    try {
        const response = await fetch(url, {
        });
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
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
        return json
    } catch (error) {
        console.error(error.message);
    }
}