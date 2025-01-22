import { analyzeCashFlows, CashFlowType } from "./cash-flows.js";

export const CashFlowTarget = Object.freeze({
    ZERO: 'ZERO',
    POSITIVE: 'POSITIVE',
    NEGATIVE: 'NEGATIVE',
});

export default class RandomCashFlow {
    constructor(precision = 2) {
        this.cashFlows = []; // Each instance has its own cashFlows
        this.precision = precision; // Precision for rounding cash flows
    }

    // Private static helper for generating random amounts
    static #generateRandomAmount(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Private static helper for validating options
    static #validateOptions(options) {
        const { count, minAmount, maxAmount } = options;

        if (typeof count !== 'number' || count < 1 || !Number.isInteger(count)) {
            throw new Error('Invalid "count": It must be an integer greater than or equal to 1.');
        }

        if (typeof minAmount !== 'number' || typeof maxAmount !== 'number') {
            throw new Error('"minAmount" and "maxAmount" must be numbers.');
        }

        if (minAmount > maxAmount) {
            throw new Error('"minAmount" cannot be greater than "maxAmount".');
        }
    }

    static #getRandomCashFlows(settings, precision) {
        RandomCashFlow.#validateOptions(settings);

        const cashFlows = [];
        for (let i = 0; i < settings.count; i++) {
            const amount = RandomCashFlow.#generateRandomAmount(settings.minAmount, settings.maxAmount);
            cashFlows.push(Number(amount.toFixed(precision))); // Round to the specified precision
        }

        return cashFlows;
    }

    static #getAllPositiveCashFlows(options, precision) {
        const settings = { ...options, minAmount: 0 };
        return RandomCashFlow.#getRandomCashFlows(settings, precision);
    }

    static #getAllNegativeCashFlows(options, precision) {
        const settings = { ...options, maxAmount: 0 };
        return RandomCashFlow.#getRandomCashFlows(settings, precision);
    }

    // Public method to generate random cash flows
    generateRandomCashFlows(options = {}) {
        const defaults = {
            count: Math.floor(Math.random() * (10000 - 2 + 1)) + 2,
            minAmount: -10000,
            maxAmount: 10000
        };
        const settings = { ...defaults, ...options };
        this.cashFlows = RandomCashFlow.#getRandomCashFlows(settings, this.precision);
        return this;
    }

    generateRandomCashFlowsByCashFlowType(cashFlowType, options = {}) {
        const defaults = {
            cashFlowTarget: CashFlowTarget.POSITIVE,
            count: Math.floor(Math.random() * (10000 - 2 + 1)) + 2,
            minAmount: -10000,
            maxAmount: 10000
        };

        const settings = { ...defaults, ...options };

        const MAX_ITERATIONS = 1000;
        let iteration = 0;

        switch (cashFlowType) {
            case CashFlowType.NET_ZERO:
                this.cashFlows = RandomCashFlow.#getRandomCashFlows(settings, this.precision);
                this.adjustCashFlows(CashFlowTarget.ZERO);
                break;

            case CashFlowType.ALL_OUTFLOW:
                settings.maxAmount = 0;
                this.cashFlows = RandomCashFlow.#getAllNegativeCashFlows(settings, this.precision);
                break;

            case CashFlowType.ALL_INFLOW:
                settings.minAmount = 0;
                this.cashFlows = RandomCashFlow.#getAllPositiveCashFlows(settings, this.precision);
                break;

            case CashFlowType.OUTFLOW_INFLOW: {
                let isOutflowInflow = false;
                while(!isOutflowInflow && iteration < MAX_ITERATIONS) {
                    iteration++;
                    const firstPartCount = 1 + Math.floor(Math.random() * (settings.count - 1)); // At least 1 interval
                    const secondPartCount = settings.count - firstPartCount; // Remaining intervals (at least 1)
                    const firstPart = RandomCashFlow.#getAllNegativeCashFlows({
                        ...settings,
                        count: firstPartCount
                    }, this.precision);
                    const secondPart = RandomCashFlow.#getAllPositiveCashFlows({
                        ...settings,
                        count: secondPartCount
                    }, this.precision);
                    this.cashFlows = [...firstPart, ...secondPart];
                    this.adjustCashFlows(settings.cashFlowTarget);
                    const analysis = analyzeCashFlows(this.cashFlows);
                    isOutflowInflow = CashFlowType.INFLOW_OUTFLOW === analysis.cashFlowType;
                }
            }
            break;

            case CashFlowType.INFLOW_OUTFLOW: {
                let isInflowOutflow = false;
                while(!isInflowOutflow && iteration < MAX_ITERATIONS) {
                    iteration++;
                    const firstPartCount = 1 + Math.floor(Math.random() * (settings.count - 1)); // At least 1 interval
                    const secondPartCount = settings.count - firstPartCount; // Remaining intervals (at least 1)
                    const firstPart = RandomCashFlow.#getAllPositiveCashFlows({
                        ...settings,
                        count: firstPartCount
                    }, this.precision);
                    const secondPart = RandomCashFlow.#getAllNegativeCashFlows({
                        ...settings,
                        count: secondPartCount
                    }, this.precision);
                    this.cashFlows = [...firstPart, ...secondPart];
                    this.adjustCashFlows(settings.cashFlowTarget);
                    const analysis = analyzeCashFlows(this.cashFlows);
                    isInflowOutflow = CashFlowType.INFLOW_OUTFLOW === analysis.cashFlowType;
                }
            }
            break;

            case CashFlowType.ZIGZAG: {
                let isZigZag = false;
                while (!isZigZag && iteration < MAX_ITERATIONS) {
                    iteration++;
                    this.generateRandomCashFlows(settings);
                    this.adjustCashFlows(settings.cashFlowTarget);
                    const analysis = analyzeCashFlows(this.cashFlows);
                    isZigZag = CashFlowType.ZIGZAG === analysis.cashFlowType;
                }
                if (!isZigZag) {
                    throw new Error(`Unable to generate a ZigZag pattern after ${MAX_ITERATIONS} attempts.`);
                }
            }
            break;

            default:
                throw new Error(`Unsupported CashFlowType: ${cashFlowType}`);
        }
        return this;
    }

    adjustCashFlows(target = CashFlowTarget.ZERO, adjustment = RandomCashFlow.#generateRandomAmount(100,999)) {
        if (adjustment === 0) {
            throw new Error('Adjustment cannot tbe zero');
        }
        if (this.cashFlows.length === 0) {
            throw new Error('Cash flows array cannot be empty.');
        }

        // Calculate the current net cash flow
        const currentNet = this.cashFlows.reduce((sum, flow) => sum + flow, 0).toFixed(this.precision);
        let lastCashFlowAdjustment = 0;

        // Determine the adjustment based on the target
        switch (target.toUpperCase()) {
            case CashFlowTarget.ZERO:
                lastCashFlowAdjustment = -currentNet;
                break;

            case CashFlowTarget.POSITIVE:
                if (currentNet <= 0) {
                    lastCashFlowAdjustment = Math.abs(currentNet) + adjustment;
                }
                break;

            case CashFlowTarget.NEGATIVE:
                if (currentNet >= 0) {
                    lastCashFlowAdjustment = -(Math.abs(currentNet) + adjustment);
                }
                break;

            default:
                throw new Error('Invalid target specified. Use "ZERO", "POSITIVE", or "NEGATIVE".');
        }
        // Apply the adjustment to the last cash flow and ensure precision
        this.cashFlows[this.cashFlows.length - 1] = Number(
            (this.cashFlows[this.cashFlows.length - 1] + lastCashFlowAdjustment).toFixed(this.precision)
        );

        return this;
    }

    exportCashFlows(format = 'json') {
        if (!this.cashFlows || this.cashFlows.length === 0) {
            throw new Error('No cash flows available. Generate cash flows first.');
        }

        if (format === 'json') {
            return JSON.stringify(this.cashFlows, null, 2);
        } else if (format === 'csv') {
            return this.cashFlows.join('\n');
        } else {
            throw new Error('Unsupported format. Use "json" or "csv".');
        }
    }

    getCashFlows() {
        return this.cashFlows;
    }
}
