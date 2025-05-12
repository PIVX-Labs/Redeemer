/**
 * Redeemer application main JavaScript file
 * Contains UI logic, theming, and initialization code
 */

// Function to check if an image exists
function imageExists(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
}

// Function to update the theme based on selected coin
async function updateTheme() {
  const coinSelect = document.getElementById("coinSelect");
  const selectedCoin = coins.find(coin => coin.ticker === coinSelect.value);
  const root = document.documentElement;
  
  // Update CSS variables with the selected coin's theme colors
  root.style.setProperty('--primary-color', selectedCoin.primaryColor);
  root.style.setProperty('--secondary-color', selectedCoin.secondaryColor);
  root.style.setProperty('--background-color', selectedCoin.backgroundColor);
  
  // Update the coin icon - Try to use an image first, fall back to letter
  const coinIcon = document.getElementById("coinIcon");
  const imagePath = `images/${selectedCoin.ticker.toLowerCase()}.png`;
  
  // Check if the image exists
  const hasImage = await imageExists(imagePath);
  
  if (hasImage) {
    // Use the image
    coinIcon.innerHTML = '';
    coinIcon.style.backgroundColor = 'transparent';
    coinIcon.style.backgroundImage = `url(${imagePath})`;
    coinIcon.style.backgroundSize = 'cover';
    coinIcon.style.backgroundPosition = 'center';
  } else {
    // Fall back to letter
    coinIcon.style.backgroundImage = 'none';
    coinIcon.style.backgroundColor = selectedCoin.primaryColor;
    coinIcon.textContent = selectedCoin.ticker.charAt(0);
  }
  
  coinIcon.setAttribute('aria-label', `${selectedCoin.name} Logo`);
  
  // Update the coin title
  const coinTitle = document.getElementById("coinTitle");
  coinTitle.textContent = `${selectedCoin.name} Redeemer`;
}

// Function to update the address label based on selected coin
function updateAddressLabel() {
  const coinSelect = document.getElementById("coinSelect");
  const selectedCoin = coins.find(coin => coin.ticker === coinSelect.value);
  const addressLabel = document.getElementById("addressLabel");
  addressLabel.textContent = `${selectedCoin.name} Address`;
}

// Function to get URL query parameters
function getQueryParams() {
  const params = {};
  const queryString = window.location.search;
  
  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      params[key.toLowerCase()] = value;
    });
  }
  
  return params;
}
function load_js() {
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.src= 'js/bitTrx.js';
    head.appendChild(script);
}
function updateChainParams(){
  const coinSelect = document.getElementById("coinSelect");
  const selectedCoin = coins.find(coin => coin.ticker === coinSelect.value);

  PUBKEY_ADDRESS = selectedCoin.pubKeyAddress
  SECRET_KEY = selectedCoin.privatePrefix
  PRIVKEY_BYTE_LENGTH = selectedCoin.privKeyByteLength 

  // We have to reload the bitTrx due to changing the chainparams
  load_js();
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  const coinSelect = document.getElementById("coinSelect");
  const promoCodeInput = document.getElementById("PivCode");
  
  // Get URL query parameters
  const queryParams = getQueryParams();
  
  // Populate the dropdown
  coins.forEach(coin => {
    const option = document.createElement("option");
    option.value = coin.ticker;
    option.textContent = `${coin.name} (${coin.ticker})`;
    coinSelect.appendChild(option);
    
    // Set default selected option based on URL param or fallback to PIVX
    if (queryParams.coin && coin.ticker.toLowerCase() === queryParams.coin.toLowerCase()) {
      option.selected = true;
    } else if (!queryParams.coin && coin.ticker === "PIVX") {
      option.selected = true;
    }
  });
  
  // Set promo code from URL if provided
  if (queryParams.code) {
    promoCodeInput.value = queryParams.code;
  }

  // Set initial values
  updateAddressLabel();
  updateTheme();
  
  // Update when dropdown changes
  coinSelect.addEventListener("change", function() {
    updateAddressLabel();
    updateTheme();
    updateChainParams();
  });
});
