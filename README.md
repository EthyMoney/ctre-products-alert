# ctre-products-alert

A simple bot to monitor stock status of CTRE products and send notification when something goes in stock.

## Setup

1. Clone the repository
2. Install Node.js LTS if you haven't already
3. Install dependencies: `npm i`
4. Set up config file `config.json` in the root directory.
5. Run the bot: `npm start`
6. (Optional) Run with PM2 to keep it running in the background and restart on crashes: `pm2 start main.js --name ctre-products-alert`. Install PM2 globally if you haven't already: `npm install -g pm2`
