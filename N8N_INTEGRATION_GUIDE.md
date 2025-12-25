# N8N Integration Guide for Financial Intelligence System

## Overview

This guide provides comprehensive instructions for connecting your n8n workflow automation to the Financial Intelligence Dashboard backend. The system is built on Supabase with a robust database schema designed for Indian Stock Market analysis (NSE/BSE).

---

## Architecture Overview

### System Components

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   n8n Workflow  │─────▶│  Supabase API    │─────▶│  PostgreSQL DB  │
│   Automation    │      │  (REST/GraphQL)  │      │  with RLS       │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                                                    │
         │                                                    │
         ▼                                                    ▼
┌─────────────────┐                              ┌─────────────────┐
│  Data Sources   │                              │   React App     │
│  - NSE/BSE APIs │                              │   (Frontend)    │
│  - News Feeds   │                              │                 │
│  - RBI Data     │                              │                 │
└─────────────────┘                              └─────────────────┘
```

---

## Database Schema

### Core Tables

#### 1. **stocks** - Stock Master Data
Stores all NSE/BSE listed stocks with sector classification.

**Columns:**
- `id` (uuid) - Primary key
- `symbol` (text) - Stock symbol (unique)
- `company_name` (text) - Company name
- `exchange` (text) - NSE, BSE, or BOTH
- `sector` (text) - Sector classification
- `market_cap` (bigint) - Market capitalization
- `is_nifty_50` (boolean) - Nifty 50 inclusion
- `is_active` (boolean) - Trading status

#### 2. **market_data** - OHLCV and Technical Indicators
Stores historical and real-time market data with technical calculations.

**Columns:**
- `stock_id` (uuid) - Foreign key to stocks
- `timestamp` (timestamptz) - Data timestamp
- `timeframe` (text) - 1m, 5m, 15m, 1h, 1d, 1w
- `open`, `high`, `low`, `close` (numeric) - OHLC prices
- `volume` (bigint) - Trading volume
- `avg_volume_20d` (bigint) - 20-day average volume
- `volume_ratio` (numeric) - Current vs average volume
- `cpr_pivot`, `cpr_bc`, `cpr_tc` (numeric) - CPR levels
- `vwap` (numeric) - Volume Weighted Average Price

#### 3. **sector_performance** - Sector Analysis
Tracks real-time sector performance and bias.

**Columns:**
- `sector` (text) - Sector name
- `timestamp` (timestamptz) - Analysis time
- `performance_1d`, `performance_1w`, `performance_1m` (numeric) - Performance metrics
- `market_bias` (text) - BULLISH, BEARISH, NEUTRAL
- `strength_score` (numeric) - 0-100 strength indicator
- `advancing_stocks`, `declining_stocks` (integer) - Breadth metrics

#### 4. **economic_indicators** - Macro Data
Stores macroeconomic indicators affecting market sentiment.

**Columns:**
- `indicator_type` (text) - GDP, INFLATION, REPO_RATE, FII_FLOW, DII_FLOW, RBI_POLICY
- `value` (numeric) - Indicator value
- `sentiment` (text) - POSITIVE, NEGATIVE, NEUTRAL
- `impact_score` (numeric) - 0-100 market impact

#### 5. **agent_decisions** - AI Trade Proposals
Logs all AI agent trading decisions for human approval.

**Columns:**
- `agent_type` (text) - MACRO_ANALYST, CASH_MARKET_SPECIALIST, STRATEGY_LOGIC, PATTERN_RECOGNITION
- `stock_symbol` (text) - Target stock
- `decision_type` (text) - BUY, SELL, HOLD, ALERT, WARNING
- `reasoning` (text) - AI explanation
- `confidence_score` (numeric) - 0-100 confidence
- `suggested_price`, `stop_loss`, `target_price` (numeric) - Trade parameters
- `status` (text) - PENDING, APPROVED, REJECTED, EXECUTED, EXPIRED

#### 6. **trap_detections** - Institutional Trap Alerts
Identifies potential market manipulation patterns.

**Columns:**
- `stock_symbol` (text) - Affected stock
- `trap_type` (text) - BULL_TRAP, BEAR_TRAP, INSTITUTIONAL_TRAP, VOLUME_TRAP
- `price_at_detection` (numeric) - Price level
- `volume_at_detection` (bigint) - Volume level
- `volume_ratio` (numeric) - Volume confirmation
- `confidence_score` (numeric) - Detection confidence
- `is_active` (boolean) - Active trap status

#### 7. **trade_signals** - Breakout Alerts
Real-time trade signals with probability scores.

**Columns:**
- `stock_symbol` (text) - Signal stock
- `signal_type` (text) - BUY, SELL, BREAKOUT, BREAKDOWN, REVERSAL
- `probability_score` (numeric) - Success probability
- `entry_price`, `stop_loss`, `target_1`, `target_2` (numeric) - Trade levels
- `pattern_detected` (text) - Chart pattern name
- `is_high_conviction` (boolean) - High probability flag

---

## N8N Workflow Examples

### Workflow 1: Real-Time Stock Data Ingestion

**Purpose:** Fetch NSE/BSE real-time data and store in `market_data` table.

**Steps:**
1. **Schedule Trigger** - Every 5 minutes during market hours (9:15 AM - 3:30 PM IST)
2. **HTTP Request** - Fetch data from NSE/BSE API
3. **Transform Data** - Calculate volume ratios, CPR levels, VWAP
4. **Supabase Insert** - Insert into `market_data` table

**N8N Configuration:**
```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "minutes", "minutesInterval": 5}]
        }
      }
    },
    {
      "name": "Fetch NSE Data",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://www.nseindia.com/api/quote-equity?symbol={{$json.symbol}}",
        "method": "GET"
      }
    },
    {
      "name": "Insert to Supabase",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "market_data",
        "data": {
          "stock_id": "={{$json.stock_id}}",
          "timestamp": "={{$now}}",
          "timeframe": "5m",
          "open": "={{$json.priceInfo.open}}",
          "high": "={{$json.priceInfo.intraDayHighLow.max}}",
          "low": "={{$json.priceInfo.intraDayHighLow.min}}",
          "close": "={{$json.priceInfo.lastPrice}}",
          "volume": "={{$json.preOpenMarket.totalTradedVolume}}"
        }
      }
    }
  ]
}
```

### Workflow 2: Trap Detection Agent

**Purpose:** Analyze volume and price action to detect institutional traps.

**Steps:**
1. **Schedule Trigger** - Every 15 minutes
2. **Supabase Query** - Fetch latest market data
3. **Function** - Run trap detection logic
4. **Conditional** - If trap detected
5. **Supabase Insert** - Insert into `trap_detections`
6. **Send Alert** - Notify via webhook/email

**Trap Detection Logic (JavaScript Function Node):**
```javascript
// Access Supabase environment variables
const SUPABASE_URL = $env.VITE_SUPABASE_URL;
const SUPABASE_KEY = $env.VITE_SUPABASE_ANON_KEY;

for (const item of $input.all()) {
  const currentVolume = item.json.volume;
  const avgVolume = item.json.avg_volume_20d;
  const priceChange = ((item.json.close - item.json.open) / item.json.open) * 100;

  const volumeRatio = currentVolume / avgVolume;
  const volumeMultiplier = 1.5; // Configurable threshold

  // Trap detection logic
  if (volumeRatio < volumeMultiplier && Math.abs(priceChange) > 3) {
    const trapType = priceChange > 0 ? 'BULL_TRAP' : 'BEAR_TRAP';
    const confidence = volumeRatio < 0.5 ? 90 : 75;

    item.json.trapDetected = true;
    item.json.trapData = {
      stock_symbol: item.json.symbol,
      trap_type: trapType,
      detection_timestamp: new Date().toISOString(),
      price_at_detection: item.json.close,
      volume_at_detection: currentVolume,
      volume_ratio: volumeRatio,
      confidence_score: confidence,
      description: `Price moved ${priceChange.toFixed(2)}% on ${volumeRatio.toFixed(2)}x avg volume`,
      is_active: true,
      outcome: 'PENDING'
    };
  } else {
    item.json.trapDetected = false;
  }
}

return $input.all();
```

### Workflow 3: Macro Analyst Agent

**Purpose:** Monitor economic indicators and generate macro analysis.

**Steps:**
1. **Schedule Trigger** - Daily at 6:00 PM IST
2. **Multiple HTTP Requests** - Fetch RBI data, FII/DII flows, GDP updates
3. **Transform Data** - Normalize and analyze
4. **Supabase Insert** - Store in `economic_indicators`
5. **AI Agent Logic** - Generate market sentiment
6. **Create Decision** - Insert into `agent_decisions` if actionable

**Environment Variables Required:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
RBI_API_KEY=your_rbi_api_key (if applicable)
```

### Workflow 4: Pattern Recognition & Signal Generation

**Purpose:** Identify chart patterns and generate trade signals.

**Steps:**
1. **Schedule Trigger** - Every 1 hour
2. **Supabase Query** - Fetch recent OHLCV data for top stocks
3. **Pattern Analysis** - Run pattern detection algorithms
4. **Calculate Targets** - Compute entry, stop-loss, targets
5. **Supabase Insert** - Store in `trade_signals`

**Pattern Detection Example:**
```javascript
// Detect bullish breakout pattern
const data = $input.all();

for (const stock of data) {
  const candles = stock.json.candles; // Array of OHLCV
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  // Breakout criteria
  const volumeIncrease = latest.volume > (stock.json.avg_volume_20d * 2);
  const priceBreakout = latest.close > Math.max(...candles.slice(-20).map(c => c.high));

  if (volumeIncrease && priceBreakout) {
    const signal = {
      stock_symbol: stock.json.symbol,
      signal_type: 'BREAKOUT',
      timestamp: new Date().toISOString(),
      price: latest.close,
      volume: latest.volume,
      probability_score: 75,
      timeframe: '1d',
      entry_price: latest.close,
      stop_loss: latest.close * 0.97, // 3% stop-loss
      target_1: latest.close * 1.05, // 5% target
      target_2: latest.close * 1.10, // 10% target
      pattern_detected: 'Volume Breakout',
      is_high_conviction: true
    };

    stock.json.signal = signal;
  }
}

return data;
```

---

## API Endpoints for N8N

### Supabase REST API Base URL
```
https://your-project-id.supabase.co/rest/v1/
```

### Authentication
Include in headers:
```
apikey: YOUR_SUPABASE_ANON_KEY
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

### Example API Calls

#### Insert Stock Data
```bash
POST /market_data
{
  "stock_id": "uuid-here",
  "timestamp": "2025-12-25T10:30:00Z",
  "timeframe": "1d",
  "open": 1500.50,
  "high": 1525.75,
  "low": 1495.25,
  "close": 1520.00,
  "volume": 5000000,
  "avg_volume_20d": 4000000,
  "volume_ratio": 1.25
}
```

#### Query Active Traps
```bash
GET /trap_detections?is_active=eq.true&order=detection_timestamp.desc
```

#### Insert Agent Decision
```bash
POST /agent_decisions
{
  "agent_type": "CASH_MARKET_SPECIALIST",
  "stock_symbol": "RELIANCE",
  "decision_type": "BUY",
  "reasoning": "Strong volume confirmation with breakout above resistance",
  "confidence_score": 85,
  "suggested_price": 2500,
  "stop_loss": 2425,
  "target_price": 2650,
  "risk_reward_ratio": 2.5,
  "status": "PENDING"
}
```

---

## Risk Management Integration

### Position Size Calculation

When generating trade signals, calculate position size using:

```javascript
function calculatePositionSize(capital, riskPercentage, entryPrice, stopLoss) {
  const capitalAtRisk = capital * (riskPercentage / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const quantity = Math.floor(capitalAtRisk / riskPerShare);
  const positionValue = quantity * entryPrice;

  return {
    quantity,
    positionValue,
    capitalAtRisk,
    riskReward: calculateRiskReward(entryPrice, stopLoss, targetPrice)
  };
}
```

### Institutional Filter

Always validate signals against institutional activity:

```javascript
// Reject if volume < 1.5x average
if (volumeRatio < 1.5) {
  signal.metadata = {
    ...signal.metadata,
    institutional_filter: 'FAILED',
    reason: 'Insufficient volume confirmation'
  };
  signal.is_high_conviction = false;
}
```

---

## Monitoring & Alerts

### Webhook Notifications

Configure n8n to send webhooks when:
- High-confidence trap detected
- AI decision requires approval
- Risk limits exceeded
- Market bias changes significantly

**Example Webhook Payload:**
```json
{
  "event": "trap_detected",
  "severity": "HIGH",
  "data": {
    "stock_symbol": "TATAMOTORS",
    "trap_type": "BULL_TRAP",
    "confidence": 90,
    "price": 750.50,
    "volume_ratio": 0.45,
    "action_required": "AVOID_BUYING"
  },
  "timestamp": "2025-12-25T11:45:00Z"
}
```

---

## Testing & Validation

### Test Workflow Execution

1. Create test stocks in `stocks` table
2. Insert sample market data
3. Run n8n workflows manually
4. Verify data appears in Supabase
5. Check RLS policies are enforced

### Sample Test Data

```sql
-- Insert test stock
INSERT INTO stocks (symbol, company_name, exchange, sector, market_cap, is_nifty_50)
VALUES ('TESTSTOCK', 'Test Company Ltd', 'NSE', 'Technology', 100000000000, false);

-- Insert test market data
INSERT INTO market_data (stock_id, timestamp, timeframe, open, high, low, close, volume, avg_volume_20d)
VALUES (
  (SELECT id FROM stocks WHERE symbol = 'TESTSTOCK'),
  NOW(),
  '1d',
  1000,
  1050,
  990,
  1040,
  5000000,
  3000000
);
```

---

## Security Best Practices

1. **Never expose service_role key** - Use anon key with RLS
2. **Validate all inputs** - Sanitize data before insertion
3. **Rate limiting** - Implement API rate limits
4. **Error handling** - Log errors without exposing sensitive data
5. **Encryption** - Use HTTPS for all API calls

---

## Next Steps

1. Set up n8n instance (cloud or self-hosted)
2. Import workflow templates
3. Configure Supabase credentials
4. Test with sample data
5. Deploy live workflows
6. Monitor performance and errors
7. Iterate and optimize

---

## Support & Resources

- Supabase Documentation: https://supabase.com/docs
- N8N Documentation: https://docs.n8n.io
- NSE API Documentation: https://www.nseindia.com
- Project GitHub: [Your Repository]

---

**System Version:** 1.0.0
**Last Updated:** December 25, 2025
**Contact:** [Your Contact Info]
