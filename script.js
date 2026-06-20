// cc.js

// --- Pure Functions ---

const fetchExchangeRate = async (fromCurr, toCurr) => {
    const from = fromCurr.toLowerCase();
    const to = toCurr.toLowerCase();
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data[from][to];
    } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        return null;
    }
};

const calculateFinalAmount = (amount, rate) => {
    const validAmount = (amount === "" || isNaN(amount) || amount < 0) ? 1 : Number(amount);
    return validAmount * rate;
};

const formatMessage = (amount, fromCurr, finalAmount, toCurr) => {
    return `${amount} ${fromCurr} = ${finalAmount.toFixed(4)} ${toCurr}`;
};

const getFlagSrc = (countryCode) => {
    return `https://flagsapi.com/${countryCode}/flat/64.png`;
};

const getCountryCode = (currencyCode, countryList) => {
    return countryList[currencyCode];
};

// --- DOM Manipulation & Side Effects ---

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const amountInput = document.querySelector(".amount input");

const populateDropdowns = (dropdowns, countryList) => {
    for (let select of dropdowns) {
        select.innerHTML = ""; // Clear existing
        for (let currCode in countryList) {
            let newOption = document.createElement("option");
            newOption.innerText = currCode;
            newOption.value = currCode;
            if (select.name === "from" && currCode === "USD") {
                newOption.selected = true;
            } else if (select.name === "to" && currCode === "INR") {
                newOption.selected = true;
            }
            select.append(newOption);
        }
    }
};

const updateFlagUI = (element) => {
    const currCode = element.value;
    const countryCode = getCountryCode(currCode, countryList);
    const newSrc = getFlagSrc(countryCode);
    const img = element.parentElement.querySelector("img");
    if (img) img.src = newSrc;
};

const handleExchangeRateUpdate = async () => {
    let amtVal = amountInput.value;
    if (amtVal === "" || isNaN(amtVal) || amtVal < 0) {
        amtVal = "1";
        amountInput.value = "1";
    }
    
    msg.innerText = "Getting exchange rate...";
    
    const rate = await fetchExchangeRate(fromCurr.value, toCurr.value);
    
    if (rate !== null) {
        const finalAmount = calculateFinalAmount(amtVal, rate);
        msg.innerText = formatMessage(amtVal, fromCurr.value, finalAmount, toCurr.value);
    } else {
        msg.innerText = "Failed to get exchange rate.";
    }
};

const setupEventListeners = () => {
    for (let select of dropdowns) {
        select.addEventListener("change", (evt) => {
            updateFlagUI(evt.target);
        });
    }

    btn.addEventListener("click", (evt) => {
        evt.preventDefault();
        handleExchangeRateUpdate();
    });

    window.addEventListener("load", () => {
        populateDropdowns(dropdowns, countryList);
        for (let select of dropdowns) {
            updateFlagUI(select);
        }
        handleExchangeRateUpdate();
    });
};

// Initialize
setupEventListeners();