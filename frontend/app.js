const {
    createChart,
    CandlestickSeries,
    LineSeries,
    HistogramSeries
} = LightweightCharts;

const chartElement = document.getElementById("chart");
const rsiElement = document.getElementById("rsiChart");
const macdElement = document.getElementById("macdChart");

const symbolNames = {
    BTCUSD: "BTC/USD",
    ETHUSD: "ETH/USD",
    XAUUSD: "XAU/USD",
    EURUSD: "EUR/USD"
};

const basePrices = {
    BTCUSD: 67000,
    ETHUSD: 2500,
    XAUUSD: 3750,
    EURUSD: 1.17
};

let currentSymbol = "BTCUSD";
let currentTimeframe = "15m";
let candles = [];
let emaVisible = true;
let smaVisible = false;

const chart = createChart(chartElement, {
    layout: {
        background: { color: "#0b0f14" },
        textColor: "#8d98a7"
    },
    grid: {
        vertLines: { color: "#171d25" },
        horzLines: { color: "#171d25" }
    },
    rightPriceScale: {
        borderColor: "#242b35"
    },
    timeScale: {
        borderColor: "#242b35",
        timeVisible: true
    }
});

const candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: "#20c997",
    downColor: "#ff5964",
    borderVisible: false,
    wickUpColor: "#20c997",
    wickDownColor: "#ff5964"
});

const emaSeries = chart.addSeries(LineSeries, {
    color: "#f5c542",
    lineWidth: 2,
    title: "EMA 20"
});

const smaSeries = chart.addSeries(LineSeries, {
    color: "#4da3ff",
    lineWidth: 2,
    title: "SMA 50"
});

const rsiChart = createChart(rsiElement, {
    layout: {
        background: { color: "#0b0f14" },
        textColor: "#7f8a99"
    },
    grid: {
        vertLines: { color: "#151b23" },
        horzLines: { color: "#151b23" }
    },
    rightPriceScale: {
        borderColor: "#242b35"
    },
    timeScale: {
        visible: false
    }
});

const rsiSeries = rsiChart.addSeries(LineSeries, {
    color: "#c084fc",
    lineWidth: 2
});

const macdChart = createChart(macdElement, {
    layout: {
        background: { color: "#0b0f14" },
        textColor: "#7f8a99"
    },
    grid: {
        vertLines: { color: "#151b23" },
        horzLines: { color: "#151b23" }
    },
    rightPriceScale: {
        borderColor: "#242b35"
    },
    timeScale: {
        visible: false
    }
});

const macdSeries = macdChart.addSeries(LineSeries, {
    color: "#4da3ff",
    lineWidth: 2
});

const signalSeries = macdChart.addSeries(LineSeries, {
    color: "#f5c542",
    lineWidth: 2
});

const histogramSeries = macdChart.addSeries(HistogramSeries, {
    priceFormat: {
        type: "price",
        precision: 4,
        minMove: 0.0001
    }
});

function generateData() {

    const result = [];

    let price = basePrices[currentSymbol];

    const now = Math.floor(Date.now() / 1000);

    let seconds = 900;

    if (currentTimeframe === "1m") seconds = 60;
    if (currentTimeframe === "5m") seconds = 300;
    if (currentTimeframe === "1H") seconds = 3600;
    if (currentTimeframe === "4H") seconds = 14400;
    if (currentTimeframe === "1D") seconds = 86400;
    if (currentTimeframe === "1W") seconds = 604800;

    for (let i = 150; i > 0; i--) {

        const time = now - i * seconds;

        const open = price;

        const volatility =
            currentSymbol === "EURUSD" ? 0.003 : price * 0.008;

        const change =
            (Math.random() - 0.48) * volatility;

        const close = Math.max(0.0001, open + change);

        const high =
            Math.max(open, close) +
            Math.random() * volatility * 0.6;

        const low =
            Math.min(open, close) -
            Math.random() * volatility * 0.6;

        result.push({
            time,
            open,
            high,
            low,
            close
        });

        price = close;
    }

    return result;
}

function calculateSMA(data, period) {

    const result = [];

    for (let i = period - 1; i < data.length; i++) {

        let sum = 0;

        for (let j = i - period + 1; j <= i; j++) {
            sum += data[j].close;
        }

        result.push({
            time: data[i].time,
            value: sum / period
        });
    }

    return result;
}

function calculateEMA(data, period) {

    const result = [];

    const multiplier = 2 / (period + 1);

    let ema = data[0].close;

    result.push({
        time: data[0].time,
        value: ema
    });

    for (let i = 1; i < data.length; i++) {

        ema =
            (data[i].close - ema) *
            multiplier +
            ema;

        result.push({
            time: data[i].time,
            value: ema
        });
    }

    return result;
}

function calculateRSI(data, period = 14) {

    const result = [];

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {

        const change =
            data[i].close - data[i - 1].close;

        if (change >= 0) gains += change;
        else losses += Math.abs(change);
    }

    let averageGain = gains / period;
    let averageLoss = losses / period;

    let rs =
        averageLoss === 0
            ? 100
            : averageGain / averageLoss;

    result.push({
        time: data[period].time,
        value: 100 - 100 / (1 + rs)
    });

    for (let i = period + 1; i < data.length; i++) {

        const change =
            data[i].close - data[i - 1].close;

        const gain = Math.max(change, 0);
        const loss = Math.max(-change, 0);

        averageGain =
            (averageGain * (period - 1) + gain) / period;

        averageLoss =
            (averageLoss * (period - 1) + loss) / period;

        rs =
            averageLoss === 0
                ? 100
                : averageGain / averageLoss;

        const value =
            100 - 100 / (1 + rs);

        result.push({
            time: data[i].time,
            value
        });
    }

    return result;
}

function calculateMACD(data) {

    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);

    const map26 = new Map(
        ema26.map(item => [item.time, item.value])
    );

    const macd = [];

    for (const item of ema12) {

        if (!map26.has(item.time)) continue;

        macd.push({
            time: item.time,
            value: item.value - map26.get(item.time)
        });
    }

    const signalPeriod = 9;

    const signal = [];

    let signalValue = macd[0]?.value || 0;

    const multiplier = 2 / (signalPeriod + 1);

    for (let i = 0; i < macd.length; i++) {

        signalValue =
            (macd[i].value - signalValue) *
            multiplier +
            signalValue;

        signal.push({
            time: macd[i].time,
            value: signalValue
        });
    }

    return {
        macd,
        signal
    };
}

function updateInterface() {

    const symbol = symbolNames[currentSymbol];

    document.getElementById("symbolTitle").textContent = symbol;

    const last =
        candles[candles.length - 1];

    if (!last) return;

    document.getElementById("price").textContent =
        "$" + last.close.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });

    document.getElementById("openValue").textContent =
        last.open.toFixed(2);

    document.getElementById("highValue").textContent =
        last.high.toFixed(2);

    document.getElementById("lowValue").textContent =
        last.low.toFixed(2);

    document.getElementById("volumeValue").textContent =
        (Math.random() * 30 + 10).toFixed(2) + "K";

    const previous =
        candles[candles.length - 2];

    if (previous) {

        const percent =
            ((last.close - previous.close) /
            previous.close) * 100;

        const change =
            document.getElementById("change");

        change.textContent =
            (percent >= 0 ? "+" : "") +
            percent.toFixed(2) +
            "%";

        change.className =
            percent >= 0
                ? "positive"
                : "negative";
    }
}

function renderIndicators() {

    const ema =
        calculateEMA(candles, 20);

    const sma =
        calculateSMA(candles, 50);

    const rsi =
        calculateRSI(candles, 14);

    const macd =
        calculateMACD(candles);

    emaSeries.setData(ema);
    smaSeries.setData(sma);

    rsiSeries.setData(rsi);

    macdSeries.setData(macd.macd);
    signalSeries.setData(macd.signal);

    if (rsi.length) {

        document.getElementById("rsiValue").textContent =
            rsi[rsi.length - 1].value.toFixed(2);
    }

    if (macd.macd.length) {

        document.getElementById("macdValue").textContent =
            macd.macd[macd.macd.length - 1]
                .value.toFixed(4);
    }

    const histogram = [];

    for (let i = 0; i < macd.macd.length; i++) {

        const m = macd.macd[i];
        const s = macd.signal[i];

        if (!s) continue;

        const value = m.value - s.value;

        histogram.push({
            time: m.time,
            value,
            color: value >= 0
                ? "#20c997"
                : "#ff5964"
        });
    }

    histogramSeries.setData(histogram);
}

function loadSymbol(symbol) {

    currentSymbol = symbol;

    candles = generateData();

    candleSeries.setData(candles);

    renderIndicators();

    updateInterface();

    chart.timeScale().fitContent();
    rsiChart.timeScale().fitContent();
    macdChart.timeScale().fitContent();
}

document
    .getElementById("symbolSelect")
    .addEventListener("change", event => {

        loadSymbol(event.target.value);

    });

document
    .querySelectorAll("[data-symbol]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const symbol =
                button.dataset.symbol;

            document.getElementById(
                "symbolSelect"
            ).value = symbol;

            loadSymbol(symbol);
        });

    });

document
    .querySelectorAll("[data-timeframe]")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll("[data-timeframe]")
                .forEach(b =>
                    b.classList.remove("selected")
                );

            button.classList.add("selected");

            currentTimeframe =
                button.dataset.timeframe;

            loadSymbol(currentSymbol);
        });

    });

document
    .getElementById("emaToggle")
    .addEventListener("click", event => {

        emaVisible = !emaVisible;

        emaSeries.applyOptions({
            visible: emaVisible
        });

        event.target.classList.toggle(
            "selected",
            emaVisible
        );

    });

document
    .getElementById("smaToggle")
    .addEventListener("click", event => {

        smaVisible = !smaVisible;

        smaSeries.applyOptions({
            visible: smaVisible
        });

        event.target.classList.toggle(
            "selected",
            smaVisible
        );

    });

document
    .getElementById("aiButton")
    .addEventListener("click", () => {

        const rsi =
            document.getElementById("rsiValue")
                .textContent;

        document.getElementById("aiMessage").textContent =
            "Demo analysis: RSI is currently " +
            rsi +
            ". The full TradingIQ AI engine will be connected later.";

    });

function resizeCharts() {

    chart.resize(
        chartElement.clientWidth,
        chartElement.clientHeight
    );

    rsiChart.resize(
        rsiElement.clientWidth,
        rsiElement.clientHeight
    );

    macdChart.resize(
        macdElement.clientWidth,
        macdElement.clientHeight
    );
}

window.addEventListener("resize", resizeCharts);

loadSymbol("BTCUSD");
