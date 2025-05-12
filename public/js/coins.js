/**
 * Coin configuration array
 * Each coin has:
 * - ticker: Short symbol for the coin
 * - name: Full name of the cryptocurrency
 * - Fee: This is the preset fee we will use when transferring coins on the network. This has to match with the batcher to make sense for the user
 * - privatePrefix: This is a coin based parameter used when creating the signed tx
 * - primaryColor: Main theme color (buttons, icons)
 * - secondaryColor: Secondary theme color (text, labels)
 * - backgroundColor: Page background color
 */
const coins = [
  { 
    ticker: "PIVX", 
    name: "PIVX",
    Fee: 0.00010000,
    privatePrefix: 212,
    pubKeyAddress: 30,
    privKeyByteLength: 38,
    primaryColor: "#5E4778", 
    secondaryColor: "#3C2F4B", 
    backgroundColor: "#F0EBF8" 
  },
  {
    ticker: "SCC", 
    name: "SCC",
    Fee: 0.00010000,
    privatePrefix: 253,
    pubKeyAddress: 125,
    privKeyByteLength: 38,
    primaryColor: "#06aae9", 
    secondaryColor: "#0fcad5", 
    backgroundColor: "#223750" 
  },
  {
    ticker: "MRX", 
    name: "MRX",
    Fee: 0.01000000,
    privatePrefix: 85,
    pubKeyAddress: 50,
    privKeyByteLength: 38,
    primaryColor: "#510457", 
    secondaryColor: "#2b032b", 
    backgroundColor: "#ceb8cf" 
  },
  {
    ticker: "PEPE", 
    name: "PEPE",
    Fee: 0.00010000,
    privatePrefix: 158,
    pubKeyAddress: 56,
    privKeyByteLength: 38,
    primaryColor: "#269b4d", 
    secondaryColor: "#000000", 
    backgroundColor: "#202337" 
  },
  {
    ticker: "DOGE", 
    name: "DOGE",
    Fee: 0.01000000,
    privatePrefix: 158,
    pubKeyAddress: 30,
    privKeyByteLength: 38,
    primaryColor: "#e1b303", 
    secondaryColor: "#cb9800", 
    backgroundColor: "#f9f9f9" 
  },
  {
    ticker: "nMNSC", 
    name: "nMNSC",
    Fee: 0.00010000,
    privatePrefix: 82,
    pubKeyAddress: 53,
    privKeyByteLength: 38,
    primaryColor: "#593196", 
    secondaryColor: "#231f20", 
    backgroundColor: "#3e2a45" 
  },
];
  // { 
  //   ticker: "BTC", 
  //   name: "Bitcoin", 
  //   primaryColor: "#F7931A", 
  //   secondaryColor: "#4D3B24", 
  //   backgroundColor: "#FFF8E1" 
  // },
  // { 
  //   ticker: "LTC", 
  //   name: "Litecoin", 
  //   primaryColor: "#345D9D", 
  //   secondaryColor: "#172D4F", 
  //   backgroundColor: "#E9F0F9" 
  // },
  // { 
  //   ticker: "DASH", 
  //   name: "Dash", 
  //   primaryColor: "#008CE7", 
  //   secondaryColor: "#00456F", 
  //   backgroundColor: "#E5F4FD" 
  // },
  // { 
  //   ticker: "ZEC", 
  //   name: "Zcash", 
  //   primaryColor: "#F4B728", 
  //   secondaryColor: "#795B14", 
  //   backgroundColor: "#FEF9E7" 
  // }