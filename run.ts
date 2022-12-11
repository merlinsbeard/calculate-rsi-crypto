import { parse } from "https://deno.land/std@v0.61.0/flags/mod.ts";

type Candle = [
  number, // openTime: number;
  string, // open: string;
  string, // high: string;
  string, // low: string;
  string, // close: string;
  string, // volume: string;
  number, // closeTime: number;
  string, // quoteAssetVolume: string;
  number, // numberOfTrades: number;
  string, // takerBuyBaseAssetVolume: string;
  string, // takerBuyQuoteAssetVolume: string;
  string // ignore: string;
];

enum CandleKeysEnum {
  openTime = 0,
  open = 1,
  high = 2,
  low = 3,
  close = 4,
  volume = 5,
  closeTime = 6,
  quoteAssetVolume = 7,
  numberOfTrades = 8,
  takerBuyBaseAssetVolume = 9,
  takerBuyQuoteAssetVolume = 10,
  ignore = 11,
}

const getBinanceData = async (
  crypto: string,
  interval: string
): Promise<Candle[]> => {
  const apiURL = `https://api.binance.com/api/v3/klines?symbol=${crypto}&interval=${interval}&limit=1000`;
  const data = await fetch(apiURL);
  const json = await data.json();
  if (!data.ok && json.msg) throw new Error(json.msg);
  if (!data.ok) throw new Error(`${data.status} ${data.statusText}`);
  return json;
};

const computeRSI = (prices: number[], periods: number) => {
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < periods; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  const avgGain = gains / periods;
  const avgLoss = losses / periods;

  // Calculate the relative strength index (RSI).
  const rsi = 100 - 100 / (1 + avgGain / avgLoss);

  return rsi;
};

const main = async () => {
  // Define the command line flags that the script accepts.
  const { args } = Deno;
  const parsedArgs = parse(args);
  const crypto = parsedArgs.c || "BTCBUSD";
  const interval = parsedArgs.i || "4h";
  const period = parsedArgs.p || 1000;

  console.log(`Crypto: ${crypto}`);
  console.log(`Interval: ${interval}`);
  console.log(`Period: ${period}`);

  try {
    const binanceData = await getBinanceData(crypto, interval);
    const prices = binanceData.map((d: Candle) => +d[CandleKeysEnum.close]);
    const rsi = computeRSI(prices, +period);
    console.log(`RSI: ${rsi} s`);
  } catch (error) {
    console.log(error);
  }
};
await main();
