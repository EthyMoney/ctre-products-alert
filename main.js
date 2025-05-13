const { JSDOM } = require('jsdom');
const config = require('./config.json');
let lastStockStatus = null;


function checkStockStatus() {
  console.log('\nChecking stock status...');
  fetch(config.productUrl)
    .then(response => response.text())
    .then(html => {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // get the text of the class "product__inventory" and look for "Out of stock"
      const inStock = !document.querySelector('.product__inventory').textContent.trim().includes('Out of stock');

      // get price from class "price-item price-item--regular"
      const price = document.querySelector('.price-item.price-item--regular').textContent.trim();

      console.log('currently', document.querySelector('.product__inventory').textContent.trim())
      console.log('parsed in stock status', inStock);

      // if the inStock status has changed from out of stock to in stock, send a notification
      if (!lastStockStatus && inStock) {
        console.log('In stock! -', new Date().toLocaleString());
        sendToSlack(config.productName, price, config.productUrl, config.productImage);
      }

      lastStockStatus = inStock;
      console.log('stored flag', lastStockStatus);
    });
}


async function sendToSlack(productName, productPrice, productLink, productImageUrl) {
  if (config.slack?.enableBot === false) {
    console.log('Slack bot is disabled in the config, not sending notification.');
    return;
  }
  console.log('Sending new product notification to Slack...');
  const url = 'https://slack.com/api/chat.postMessage';
  const authorizationHeader = { headers: { authorization: `Bearer ${config.slack.token}` } };

  const message = {
    channel: config.slack.channelName,
    username: 'CTRE Product Alerts',
    unfurl_links: false,
    unfurl_media: false,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🚨 *In-Stock!* 🚨`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Product:*\n<${productLink}|${productName}>`
          },
          {
            type: 'mrkdwn',
            text: `*Price:*\n${productPrice}`
          }
        ],
        accessory: {
          type: 'image',
          image_url: productImageUrl,
          alt_text: productName
        }
      }
    ]
  };

  await axios.post(url, message, authorizationHeader)
    .then(() => {
      console.log(`Successfully sent notification to Slack!`);
    })
    .catch(function (reject) {
      console.error(`Error sending notification to Slack with promise rejection: ${reject}`);
    });
}



// ================================
//             Startup
// ================================

// Check stock status specified interval, or default to 60 seconds
setInterval(checkStockStatus, config.checkIntervalMs || 60000);
console.log('Hi! Starting stock status check every', config.checkIntervalMs || 60000, 'ms');

// Do an initial check
checkStockStatus();
