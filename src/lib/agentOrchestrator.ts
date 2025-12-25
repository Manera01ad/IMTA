import { AgentType, AgentDecision, TrapDetection, TradeSignal, RiskSettings, PositionSizeCalculation } from '../types/financial';

export class AgentOrchestrator {
  calculatePositionSize(
    capital: number,
    riskPercentage: number,
    entryPrice: number,
    stopLoss: number
  ): PositionSizeCalculation {
    const capitalAtRisk = capital * (riskPercentage / 100);
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const recommendedQuantity = Math.floor(capitalAtRisk / riskPerShare);
    const positionValue = recommendedQuantity * entryPrice;

    return {
      capital,
      riskPercentage,
      entryPrice,
      stopLoss,
      recommendedQuantity,
      capitalAtRisk,
      positionValue,
    };
  }

  calculateRiskReward(entry: number, stopLoss: number, target: number): number {
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    return reward / risk;
  }

  detectInstitutionalTrap(
    currentVolume: number,
    avgVolume: number,
    priceChange: number,
    volumeMultiplier: number = 1.5
  ): { isTrap: boolean; confidence: number; reason: string } {
    const volumeRatio = currentVolume / avgVolume;

    if (volumeRatio < volumeMultiplier && Math.abs(priceChange) > 3) {
      return {
        isTrap: true,
        confidence: 75,
        reason: `Price moved ${priceChange.toFixed(2)}% on ${volumeRatio.toFixed(2)}x average volume. Low volume spike indicates potential institutional trap.`,
      };
    }

    if (volumeRatio < 0.5 && Math.abs(priceChange) > 5) {
      return {
        isTrap: true,
        confidence: 90,
        reason: `Extreme price movement (${priceChange.toFixed(2)}%) on abnormally low volume (${volumeRatio.toFixed(2)}x). High probability of manipulation.`,
      };
    }

    return {
      isTrap: false,
      confidence: 0,
      reason: 'Volume confirms price action. No trap detected.',
    };
  }

  assessTrapType(
    priceChange: number,
    volumeRatio: number,
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'
  ): 'BULL_TRAP' | 'BEAR_TRAP' | 'VOLUME_TRAP' | 'INSTITUTIONAL_TRAP' | null {
    if (volumeRatio < 1.5) {
      if (priceChange > 3 && trend !== 'UPTREND') {
        return 'BULL_TRAP';
      }
      if (priceChange < -3 && trend !== 'DOWNTREND') {
        return 'BEAR_TRAP';
      }
      return 'VOLUME_TRAP';
    }

    if (volumeRatio < 0.7 && Math.abs(priceChange) > 4) {
      return 'INSTITUTIONAL_TRAP';
    }

    return null;
  }

  calculateCPR(high: number, low: number, close: number) {
    const pivot = (high + low + close) / 3;
    const bc = (high + low) / 2;
    const tc = pivot - bc + pivot;

    return {
      pivot,
      bc,
      tc,
      range: tc - bc,
      isNarrow: (tc - bc) / close < 0.01,
    };
  }

  assessMarketBias(
    advancingStocks: number,
    decliningStocks: number,
    volumeRatio: number
  ): { bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; strength: number } {
    const total = advancingStocks + decliningStocks;
    const advanceRatio = advancingStocks / total;

    let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let strength = 50;

    if (advanceRatio > 0.6 && volumeRatio > 1.2) {
      bias = 'BULLISH';
      strength = Math.min(95, 50 + (advanceRatio - 0.6) * 100);
    } else if (advanceRatio < 0.4 && volumeRatio > 1.2) {
      bias = 'BEARISH';
      strength = Math.min(95, 50 + (0.4 - advanceRatio) * 100);
    } else {
      strength = 50;
    }

    return { bias, strength };
  }

  generateTradeReasoning(
    decision: Partial<AgentDecision>,
    technicals: {
      volumeConfirmation: boolean;
      trendAlignment: boolean;
      supportResistance: string;
    },
    fundamentals?: {
      sector: string;
      marketCap: number;
      institutionalInterest: boolean;
    }
  ): string {
    const parts = [];

    if (technicals.volumeConfirmation) {
      parts.push('Strong volume confirmation validates the move');
    }

    if (technicals.trendAlignment) {
      parts.push('Trade aligns with prevailing trend');
    }

    if (technicals.supportResistance) {
      parts.push(technicals.supportResistance);
    }

    if (fundamentals?.institutionalInterest) {
      parts.push(`Institutional interest detected in ${fundamentals.sector} sector`);
    }

    if (decision.risk_reward_ratio && decision.risk_reward_ratio > 2) {
      parts.push(`Favorable risk-reward ratio of ${decision.risk_reward_ratio.toFixed(2)}:1`);
    }

    return parts.join('. ') + '.';
  }

  prioritizeDecisions(decisions: AgentDecision[]): AgentDecision[] {
    return decisions.sort((a, b) => {
      const scoreA = (a.confidence_score || 0) * (a.risk_reward_ratio || 1);
      const scoreB = (b.confidence_score || 0) * (b.risk_reward_ratio || 1);
      return scoreB - scoreA;
    });
  }

  validateTradeAgainstRiskSettings(
    positionValue: number,
    capitalAtRisk: number,
    riskSettings: RiskSettings
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    const maxPositionSize = riskSettings.total_capital * (riskSettings.max_position_size_percentage / 100);
    if (positionValue > maxPositionSize) {
      violations.push(`Position size exceeds ${riskSettings.max_position_size_percentage}% limit`);
    }

    const maxRiskPerTrade = riskSettings.total_capital * (riskSettings.max_risk_per_trade_percentage / 100);
    if (capitalAtRisk > maxRiskPerTrade) {
      violations.push(`Risk per trade exceeds ${riskSettings.max_risk_per_trade_percentage}% limit`);
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
