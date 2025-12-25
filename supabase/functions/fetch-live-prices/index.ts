import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface YahooFinanceQuote {
  regularMarketPrice: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
  regularMarketVolume: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: YahooFinanceQuote;
    }>;
    error?: {
      code: string;
      description: string;
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all symbols from database
    const { data: symbols, error: symbolsError } = await supabase
      .from("live_prices")
      .select("symbol");

    if (symbolsError) {
      throw new Error(`Failed to fetch symbols: ${symbolsError.message}`);
    }

    if (!symbols || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "No symbols found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updates = [];
    const errors = [];

    // Fetch prices for each symbol
    for (const { symbol } of symbols) {
      try {
        // Convert to Yahoo Finance format (e.g., RELIANCE -> RELIANCE.NS)
        const yahooSymbol = `${symbol}.NS`;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (!response.ok) {
          errors.push({ symbol, error: `HTTP ${response.status}` });
          continue;
        }

        const data: YahooFinanceResponse = await response.json();

        if (data.chart.error) {
          errors.push({ symbol, error: data.chart.error.description });
          continue;
        }

        if (!data.chart.result || data.chart.result.length === 0) {
          errors.push({ symbol, error: "No data returned" });
          continue;
        }

        const quote = data.chart.result[0].meta;

        // Prepare update data
        const updateData = {
          symbol: symbol,
          ltp: quote.regularMarketPrice,
          open_price: quote.regularMarketOpen,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          prev_close: quote.regularMarketPreviousClose,
          volume: quote.regularMarketVolume || 0,
          change: quote.regularMarketChange,
          change_percent: quote.regularMarketChangePercent,
          last_update: new Date().toISOString(),
        };

        updates.push(updateData);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({ symbol, error: errorMessage });
        console.error(`Error fetching ${symbol}:`, errorMessage);
      }
    }

    // Bulk update database
    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from("live_prices")
        .upsert(updates, { onConflict: "symbol" });

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error(`Failed to update prices: ${updateError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Updated ${updates.length} prices, ${errors.length} failed`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching live prices:", errorMessage, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});