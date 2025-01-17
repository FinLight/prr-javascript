import {analyzeCashFlows, CashFlowType, getNFV, getNPV} from "./cash-flows.js";

export default class RaosIrrCalculator {
    static calculate(cashFlows, guess = 0.1, tolerance = 1e-6, maxIter = 100) {
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

        if (CashFlowType.INFLOW_OUTFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow < 0) {
            return RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows, guess, tolerance, maxIter)
        } else if (CashFlowType.OUTFLOW_INFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow > 0) {
            return RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows, guess, tolerance, maxIter)
        } else if (CashFlowType.OUTFLOW_INFLOW === cashFlowResult.cashFlowType && cashFlowResult.netCashFlow < 0) {
            return RaosIrrCalculator.irrNewtonRaphsonNFV(cashFlows, guess, tolerance, maxIter)
        }

        const irrByNFV = RaosIrrCalculator.irrNewtonRaphsonNFV(cashFlows, guess, tolerance, maxIter)
        const irrByNPV = RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows, guess, tolerance, maxIter)
        if (Number.isNaN(irrByNFV)) {
            return irrByNPV
        }
        if (Number.isNaN(irrByNPV)) {
            return irrByNFV
        }
        let absNfvForIrrByNFV = Math.abs(getNFV(cashFlows, irrByNFV))
        absNfvForIrrByNFV = Number.isNaN(absNfvForIrrByNFV)? Number.POSITIVE_INFINITY : absNfvForIrrByNFV
        let absNpvForIrrByNFV = Math.abs(getNPV(cashFlows, irrByNFV))
        absNpvForIrrByNFV = Number.isNaN(absNpvForIrrByNFV)? Number.POSITIVE_INFINITY : absNpvForIrrByNFV
        let absNfvForIrrByNPV = Math.abs(getNFV(cashFlows, irrByNPV))
        absNfvForIrrByNPV = Number.isNaN(absNfvForIrrByNPV)? Number.POSITIVE_INFINITY : absNfvForIrrByNPV
        let absNpvForIrrByNPV = Math.abs(getNPV(cashFlows, irrByNPV))
        absNpvForIrrByNPV = Number.isNaN(absNpvForIrrByNPV)? Number.POSITIVE_INFINITY : absNpvForIrrByNPV

        if (Math.min(absNfvForIrrByNFV, absNpvForIrrByNFV) < Math.min(absNfvForIrrByNPV, absNpvForIrrByNPV)) {
            return irrByNFV
        }
        return irrByNPV
    }

    /**
     * IRR calculation using Newton-Raphson Method (based on NPV)
     */
    static irrNewtonRaphsonNPV(cashFlows, guess = 0.1, tolerance = 1e-6, maxIter = 1000) {
        let iter = 0;
        let rate = guess;

        while (iter < maxIter) {
            const f = getNPV(cashFlows, rate)
            const fPrime = cashFlows.reduce((acc, cf, t) => acc - t * cf / Math.pow(1 + rate, t + 1), 0);

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

    /**
     * IRR calculation using Newton-Raphson Method (based on NFV)
     */
    static irrNewtonRaphsonNFV(cashFlows, guess = 0.1, tolerance = 1e-6, maxIter = 1000) {
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
}