import {analyzeCashFlows, CashFlowType, getNFV, getNPV} from "./cash-flows.js";

export default class RaosIrrCalculator {
    static calculate(cashFlows, guess = null, tolerance = 1e-6, maxIter = 1000) {
        const cashFlowResult = analyzeCashFlows(cashFlows);
        if (CashFlowType.NET_ZERO === cashFlowResult.cashFlowType) {
            return 0
        }

        if (CashFlowType.ALL_INFLOW === cashFlowResult.cashFlowType) {
            return Number.POSITIVE_INFINITY
        }

        if (CashFlowType.ALL_OUTFLOW === cashFlowResult.cashFlowType) {
            return Number.NEGATIVE_INFINITY
        }

        let irrByNFV = null
        let irrByNPV = null
        let absNfvForIrrByNFV = null
        let absNpvForIrrByNFV = null
        let absNfvForIrrByNPV = null
        let absNpvForIrrByNPV = null

        if (CashFlowType.OUTFLOW_INFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow > 0) {
            irrByNPV = RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows, guess, tolerance, maxIter)
        } else if (CashFlowType.OUTFLOW_INFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow < 0) {
            irrByNFV = RaosIrrCalculator.irrNewtonRaphsonNFV(cashFlows, guess, tolerance, maxIter)
        } else if (CashFlowType.INFLOW_OUTFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow < 0) {
            irrByNPV = RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows, guess, tolerance, maxIter)
        } else if (CashFlowType.INFLOW_OUTFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow > 0) {
            irrByNFV = RaosIrrCalculator.irrNewtonRaphsonNFV(cashFlows, guess, tolerance, maxIter)
        }

        if(irrByNFV != null && !Number.isNaN(irrByNFV)) {
            absNfvForIrrByNFV = Math.abs(getNFV(cashFlows, irrByNFV))
            absNpvForIrrByNFV = Math.abs(getNPV(cashFlows, irrByNFV))
            if(absNfvForIrrByNFV < tolerance || absNpvForIrrByNFV < tolerance) {
                return irrByNFV
            }
        }

        if(irrByNPV != null && !Number.isNaN(irrByNPV)) {
            absNfvForIrrByNPV = Math.abs(getNFV(cashFlows, irrByNPV))
            absNpvForIrrByNPV = Math.abs(getNPV(cashFlows, irrByNPV))
            if(absNfvForIrrByNPV < tolerance || absNpvForIrrByNPV < tolerance) {
                return irrByNPV
            }
        }

        if(irrByNFV == null) {
            irrByNFV = RaosIrrCalculator.irrNewtonRaphsonNFV(cashFlows, guess, tolerance, maxIter)
            absNfvForIrrByNFV = Math.abs(getNFV(cashFlows, irrByNFV))
            absNpvForIrrByNFV = Math.abs(getNPV(cashFlows, irrByNFV))
        }

        if(irrByNPV == null) {
            irrByNPV = RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows, guess, tolerance, maxIter)
            absNfvForIrrByNPV = Math.abs(getNFV(cashFlows, irrByNPV))
            absNpvForIrrByNPV = Math.abs(getNPV(cashFlows, irrByNPV))
        }

        if (Number.isNaN(irrByNFV)) {
            return irrByNPV
        }
        if (Number.isNaN(irrByNPV)) {
            return irrByNFV
        }
        absNfvForIrrByNFV = Number.isNaN(absNfvForIrrByNFV)? Number.POSITIVE_INFINITY : absNfvForIrrByNFV
        absNpvForIrrByNFV = Number.isNaN(absNpvForIrrByNFV)? Number.POSITIVE_INFINITY : absNpvForIrrByNFV
        absNfvForIrrByNPV = Number.isNaN(absNfvForIrrByNPV)? Number.POSITIVE_INFINITY : absNfvForIrrByNPV
        absNpvForIrrByNPV = Number.isNaN(absNpvForIrrByNPV)? Number.POSITIVE_INFINITY : absNpvForIrrByNPV

        if ((absNfvForIrrByNFV + absNpvForIrrByNFV) < (absNfvForIrrByNPV + absNpvForIrrByNPV)) {
            return irrByNFV
        }
        return irrByNPV
    }

    /**
     * IRR calculation using Newton-Raphson Method (based on NPV)
     */
    static irrNewtonRaphsonNPV(cashFlows, guess = null, tolerance = 1e-6, maxIter = 1000) {
        if (guess === null) {
            guess = this.getCentroid(cashFlows);
        }

        let iter = 0;
        let rate = guess;

        while (iter < maxIter) {
            const f = getNPV(cashFlows, rate);
            const fPrime = cashFlows.reduce((acc, cf, t) => acc - t * cf / Math.pow(1 + rate, t + 1), 0);

            if (Math.abs(fPrime) < tolerance) break; // Avoid division by zero

            const newRate = rate - f / fPrime;

            if (Math.abs(newRate - rate) < tolerance) {
                return newRate;
            }

            rate = newRate;
            iter++;
        }

        return rate;
    }


    /**
     * IRR calculation using Newton-Raphson Method (based on NFV)
     */
    static irrNewtonRaphsonNFV(cashFlows, guess = null, tolerance = 1e-6, maxIter = 1000) {
        if (guess === null) {
            guess = this.getCentroid(cashFlows);
        }

        let iter = 0;
        let rate = guess;
        const n = cashFlows.length - 1;

        while (iter < maxIter) {
            const f = getNFV(cashFlows, rate)
            const fPrime = cashFlows.reduce((acc, cf, t) => acc + (n - t) * cf * Math.pow(1 + rate, n - t - 1), 0);

            if (Math.abs(fPrime) < tolerance) break; // Avoid division by zero

            const newRate = rate - f / fPrime;

            if (Math.abs(newRate - rate) < tolerance) {
                return newRate
            }

            rate = newRate;
            iter++;
        }
        return rate
    }

    static getCentroid(cashFlows) {
        const totalCashFlow = cashFlows.reduce((acc, cf) => acc + cf, 0);
        const weightedSumTime = cashFlows.reduce((acc, cf, t) => acc + (cf * t), 0);
        return totalCashFlow !== 0 ? 1 / (weightedSumTime / totalCashFlow) : 0.1; // Default to 0.1 if total cash flow is zero
    }
}