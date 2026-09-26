const chartElement = document.getElementById("chart");

const chart = LightweightCharts.createChart(chartElement, {
    layout: {
        background: {
            color: "#0b0f14"
        },
        textColor: "#8d98a7"
    },

    grid: {
        vertLines: {
            color: "#171d25"
        },
        horzLines: {
            color: "#171d25"
        }
    },

    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal
    },

    rightPriceScale: {
        borderColor: "#242b35"
    },

    timeScale: {
        borderColor: "#242b35",
        timeVisible: true
    }
});

const candleSeries = chart.addSeries(
    LightweightCharts.CandlestickSeries,
    {
        upColor: "#20c997",
        downColor: "#ff5964",
        borderVisible: false,
        wickUpColor: "#20c997",
        wickDownColor: "#ff5964"
    }
);

const data = [];

let price = 67000;

const now = Math.floor(Date.now() / 1000);

for (let i = 100; i > 0; i--) {

    const time = now - (i * 900);

    const open = price;

    const change = (Math.random() - 0.48) * 500;

    const close = open + change;

    const high = Math.max(open, close) + Math.random() * 250;

    const low = Math.min(open, close) - Math.random() * 250;

    data.push({
        time: time,
        open: open,
        high: high,
        low: low,
        close: close
    });

    price = close;
}

candleSeries.setData(data);

chart.timeScale().fitContent();

window.addEventListener("resize", () => {

    chart.resize(
        chartElement.clientWidth,
        chartElement.clientHeight
    );

});

setInterval(() => {

    const priceElement = document.getElementById("price");

    if (!priceElement) return;

    const current = 67000 + (Math.random() * 600 - 300);

    priceElement.textContent =
        "$" + current.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

}, 2000);
