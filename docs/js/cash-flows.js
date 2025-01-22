// Enum for cash flow types
export const CashFlowType = Object.freeze({
    ALL_INFLOW: "ALL_INFLOW",
    ALL_OUTFLOW: "ALL_OUTFLOW",
    NET_ZERO: "NET_ZERO",
    INFLOW_OUTFLOW: "INFLOW_OUTFLOW",
    OUTFLOW_INFLOW: "OUTFLOW_INFLOW",
    ZIGZAG: "ZIGZAG"
});

export const getNFV = (cashFlows, rate, precision=6) => {
    const n = cashFlows.length - 1;
    const nfv = cashFlows.reduce((acc, cf, t) => acc + cf * Math.pow(1 + rate, n - t), 0);
    return parseFloat(nfv.toFixed(precision))
};

export const getNPV = (cashFlows, rate, precision = 6) => {
    const npv = cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
    return parseFloat(npv.toFixed(precision))
};

// Main function to analyze cash flows
export const analyzeCashFlows = (cashFlows, precision = 6) => {
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
        throw new Error("Invalid cash flow input: Must be an array.");
    }

    let positiveCashFlow = 0.0;
    let negativeCashFlow = 0.0;
    let transitions = 0.0;

    for (let i = 0; i < cashFlows.length; i++) {
        const cf = cashFlows[i];

        // Validate that all entries are numbers
        if (typeof cf !== "number") {
            throw new Error("Invalid cash flow input: All elements must be numbers.");
        }

        // Check positivity/negativity
        if (cf > 0) {
            positiveCashFlow += cf
        }
        if (cf < 0) {
            negativeCashFlow += cf
        }

        // Count transitions (sign changes between consecutive cash flows)
        if (i > 0 && ((cashFlows[i - 1] >= 0 && cf < 0) || (cashFlows[i - 1] < 0 && cf >= 0))) {
            transitions++;
        }
    }
    positiveCashFlow = parseFloat(positiveCashFlow.toFixed(precision))
    negativeCashFlow = parseFloat(negativeCashFlow.toFixed(precision))
    let netCashFlow = positiveCashFlow + negativeCashFlow;
    netCashFlow = parseFloat(netCashFlow.toFixed(precision))

    let cashFlowType = CashFlowType.ZIGZAG
    // Classification based on conditions
    if (netCashFlow === 0) cashFlowType =  CashFlowType.NET_ZERO;
    else if (negativeCashFlow === 0) cashFlowType =  CashFlowType.ALL_INFLOW;
    else if (positiveCashFlow === 0) cashFlowType =  CashFlowType.ALL_OUTFLOW;
    else if (transitions === 1) cashFlowType =  cashFlows[0] > 0 ? CashFlowType.INFLOW_OUTFLOW : CashFlowType.OUTFLOW_INFLOW;
    return {
        cashFlowType,
        positiveCashFlow,
        negativeCashFlow,
        netCashFlow,
    };
};

