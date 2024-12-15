// script.js

const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
const cryptoTable = document.getElementById("cryptoTable");
const searchInput = document.getElementById("search");
let cryptoData = [];
let currentSort = { by: null, ascending: true };
let currentFilter = "";

// Fetch data from CoinGecko API
async function fetchCryptoData() {
    try {
        const response = await axios.get(API_URL);
        cryptoData = response.data.map(item => ({
            rank: item.market_cap_rank,
            name: item.name,
            icon: item.image,
            price: item.current_price,
            change: item.price_change_percentage_24h,
            supply: item.circulating_supply,
            marketCap: item.market_cap
        }));

        applyFilterAndSort();
    } catch (error) {
        console.error("Error fetching data from CoinGecko API", error);
    }
}

// Apply filter and sort
function applyFilterAndSort() {
    let filteredData = cryptoData;

    // Apply filter
    if (currentFilter) {
        filteredData = filteredData.filter(crypto => crypto.name.toLowerCase().includes(currentFilter));
    }

    // Apply sort
    if (currentSort.by) {
        filteredData = filteredData.sort((a, b) => {
            if (currentSort.ascending) return a[currentSort.by] - b[currentSort.by];
            return b[currentSort.by] - a[currentSort.by];
        });
    }

    renderTable(filteredData);
}

// Render table rows
function renderTable(data) {
    cryptoTable.innerHTML = data.map(crypto => `
        <tr>
            <td>${crypto.rank}</td>
            <td><img src="${crypto.icon}" alt="${crypto.name} icon" class="crypto-icon"> ${crypto.name}</td>
            <td>$${crypto.price < 0.01 ? crypto.price.toFixed(8) : crypto.price.toFixed(2)}</td>
            <td class="${crypto.change >= 0 ? 'positive' : 'negative'}">${crypto.change.toFixed(2)}%</td>
            <td>${crypto.supply ? crypto.supply.toLocaleString() : 'N/A'}</td>
            <td>$${crypto.marketCap.toLocaleString()}</td>
        </tr>
    `).join("");
}

// Sort table
function sortTable(by, ascending) {
    currentSort = { by, ascending };
    applyFilterAndSort();
}

// Search functionality
searchInput.addEventListener("input", () => {
    currentFilter = searchInput.value.toLowerCase();
    applyFilterAndSort();
});

// Add event listeners to table headers for sorting
const headers = document.querySelectorAll("th[data-sort]");
headers.forEach(header => {
    header.addEventListener("click", () => {
        const sortBy = header.getAttribute("data-sort");
        const ascending = !header.classList.contains("ascending");
        headers.forEach(h => h.classList.remove("ascending", "descending"));
        header.classList.add(ascending ? "ascending" : "descending");
        sortTable(sortBy, ascending);
    });
});

// Fetch data and update every minute
fetchCryptoData();
setInterval(fetchCryptoData, 60000);
