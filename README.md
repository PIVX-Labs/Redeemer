# Redeemer - Multi-Coin Redemption Interface

A lightweight, customizable interface for redeeming cryptocurrency promo codes with automatic theming per coin.

## Features

- **Multi-Coin Support**: Easily switch between different cryptocurrencies
- **Automatic Theming**: Each coin has its own visual theme with smooth transitions
- **Responsive Design**: Works across different screen sizes
- **Customizable**: Easy to add new coins and customize themes

## Theming System

### How Themes Work

Each coin in the system has its own theme defined by three main colors:

- **Primary Color**: Used for buttons, borders, and the coin icon
- **Secondary Color**: Used for text and subtle elements
- **Background Color**: Used for the page background

When switching between coins, the interface smoothly transitions between themes with animated color changes.

### Default Themes

| Coin | Primary Color | Secondary Color | Background Color |
|------|--------------|----------------|-----------------|
| PIVX | #5E4778 | #3C2F4B | #F0EBF8 |
| BTC | #F7931A | #4D3B24 | #FFF8E1 |
| LTC | #345D9D | #172D4F | #E9F0F9 |
| DASH | #008CE7 | #00456F | #E5F4FD |
| ZEC | #F4B728 | #795B14 | #FEF9E7 |

## Customization Guide

### Adding a New Coin

To add a new coin to the system, locate the `coins` array in `public/js/coins.js` and add a new entry:

```javascript
{ 
  ticker: "XMR", 
  name: "Monero", 
  primaryColor: "#FF6600", 
  secondaryColor: "#4C3A1D", 
  backgroundColor: "#FFF1E5" 
}
```

### Customizing Coin Logos

#### How the Logo System Works

The system uses a hybrid approach for coin icons:

1. **Image-First Approach**: When a coin is selected, the system first checks for an image file named after the coin's ticker in lowercase (e.g., `pivx.png`, `btc.png`) in the `public/images/` directory.

2. **Automatic Fallback**: If no matching image is found, the system displays the first letter of the coin's ticker in a colored circle using the coin's primary color.

#### Adding a Custom Logo

To add a custom logo for any coin:

1. Create or acquire an image file (preferably PNG with transparency)
2. Name it exactly after the coin's ticker in lowercase (e.g., `btc.png`, `pivx.png`)
3. Save it in the `public/images/` directory
4. The system will automatically detect and use your image

**Recommended Image Specifications:**
- Size: 40×40 pixels (larger images will be scaled)
- Format: PNG with transparency
- Shape: Preferably circular or square with transparent background

### Changing the Default Coin

To change which coin is selected by default:

1. In `public/js/redeemer.js`, locate the initialization code
2. Change the condition in the dropdown population to match your desired default coin:
   ```javascript
   // Set PIVX as the default selected option
   if (coin.ticker === "PIVX") {
     option.selected = true;
   }
   ```

3. Update the initial CSS variables in `public/style.css` to match the theme colors of your default coin

## Technical Details

### Theme Implementation

The theming system uses CSS variables defined in the `:root` selector for global theme colors. When a coin is selected:

1. JavaScript in `redeemer.js` updates these CSS variables with the selected coin's colors
2. CSS transitions ensure smooth color changes across all themed elements
3. The coin icon and title are updated to reflect the selected coin

### Image Detection

The system uses JavaScript's `Image` object to check if a logo image exists before attempting to use it:

```javascript
function imageExists(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
}
```

This ensures graceful fallback to the letter-based icon if an image isn't available.

## Directory Structure

```
public/
├── images/           # Coin logo images
│   ├── btc.png       # Bitcoin logo (example)
│   ├── pivx.png      # PIVX logo (example)
│   └── ...           # Other coin logos
├── js/               # JavaScript files
│   ├── coins.js      # Coin configuration array
│   ├── redeemer.js   # UI and theming logic
│   ├── sweep.js      # Redemption logic
│   └── ...           # Other JS files
├── index.html        # Main HTML file
└── style.css         # CSS styles
```

## URL Parameters

The application supports URL query parameters to pre-select options:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `coin` | Auto-selects the specified coin | `?coin=BTC` |
| `code` | Pre-fills the promo code input | `?code=ABC123` |

Combined example: `https://redeemer.com/?coin=PIVX&code=PROMO2023`

You can use this feature to create direct links for specific coins and promo codes.
