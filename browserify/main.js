// Test case for deriving key
import { PromoCode } from 'pivx-promos'

async function main(passedCode){
    const code = new PromoCode(passedCode)

    const cWallet= await code.derivePrivateKey();

    console.log(cWallet)
}

main("Test3-KWN9Q")