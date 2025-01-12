const coinDataDiv = document.getElementById('coin-data');
const errorMessageDiv = document.getElementById('error-message');

async function fetchCoinData() {
    const priceUrl = 'https://api.binance.com/api/v3/ticker/price';
    
    try {
        const btcResponse = await fetch(`${priceUrl}?symbol=BTCUSDT`);
        const ethResponse = await fetch(`${priceUrl}?symbol=ETHUSDT`);
        const xrpResponse = await fetch(`${priceUrl}?symbol=XRPUSDT`);

        const btcData = await btcResponse.json();
        const ethData = await ethResponse.json();
        const xrpData = await xrpResponse.json();

        const btcPrice = parseFloat(btcData.price);
        const ethPrice = parseFloat(ethData.price);
        const xrpPrice = parseFloat(xrpData.price);

       

        displayData(btcPrice, ethPrice, xrpPrice);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        errorMessageDiv.textContent = 'Could not fetch data from Binance API';
    }
}

function displayData(btcPrice, ethPrice, xrpPrice) {
    coinDataDiv.innerHTML = `
        <div class="card">
            <p>BTC : ${btcPrice.toFixed(2)}$</p>
            
        </div>
        <div class="card">
            
            <p>ETH : ${ethPrice.toFixed(2)}$</p>
        </div>
        <div class="card">
            
           <p>XRP : ${xrpPrice.toFixed(2)}$</p>
        </div>
    `;
}

fetchCoinData();
setInterval(fetchCoinData, 100);
