import {analyzeCashFlows, CashFlowType, getNFV, getNPV} from "../docs/js/cash-flows.js";

describe('analyzeCashFlows', () => {
    test('should classify cash flows as ALL_INFLOW', () => {
        const cashFlows = [100, 200, 300];
        const result = analyzeCashFlows(cashFlows);
        expect(result.cashFlowType).toBe(CashFlowType.ALL_INFLOW);
        expect(result.positiveCashFlow).toBe(600);
        expect(result.negativeCashFlow).toBe(0);
        expect(result.netCashFlow).toBe(600);
    });

    test('should classify cash flows as ALL_OUTFLOW', () => {
        const cashFlows = [-100, -200, -300];
        const result = analyzeCashFlows(cashFlows);
        expect(result.cashFlowType).toBe(CashFlowType.ALL_OUTFLOW);
        expect(result.positiveCashFlow).toBe(0);
        expect(result.negativeCashFlow).toBe(-600);
        expect(result.netCashFlow).toBe(-600);
    });

    test('should classify cash flows as NET_ZERO', () => {
        const cashFlows = [-100, 50, 50];
        const result = analyzeCashFlows(cashFlows);
        expect(result.cashFlowType).toBe(CashFlowType.NET_ZERO);
        expect(result.positiveCashFlow).toBe(100);
        expect(result.negativeCashFlow).toBe(-100);
        expect(result.netCashFlow).toBe(0);
    });

    test('should classify cash flows as INFLOW_OUTFLOW', () => {
        const cashFlows = [300, -200];
        const result = analyzeCashFlows(cashFlows);
        expect(result.cashFlowType).toBe(CashFlowType.INFLOW_OUTFLOW);
        expect(result.positiveCashFlow).toBe(300);
        expect(result.negativeCashFlow).toBe(-200);
        expect(result.netCashFlow).toBe(100);
    });

    test('should classify cash flows as OUTFLOW_INFLOW', () => {
        const cashFlows = [-300, 200];
        const result = analyzeCashFlows(cashFlows);
        expect(result.cashFlowType).toBe(CashFlowType.OUTFLOW_INFLOW);
        expect(result.positiveCashFlow).toBe(200);
        expect(result.negativeCashFlow).toBe(-300);
        expect(result.netCashFlow).toBe(-100);
    });

    test('should classify cash flows as ZIGZAG', () => {
        const cashFlows = [100, -50, 30, -10];
        const result = analyzeCashFlows(cashFlows);
        expect(result.cashFlowType).toBe(CashFlowType.ZIGZAG);
        expect(result.positiveCashFlow).toBe(130);
        expect(result.negativeCashFlow).toBe(-60);
        expect(result.netCashFlow).toBe(70);
    });

    test('should throw an error for non-array input', () => {
        expect(() => analyzeCashFlows('invalid')).toThrow('Invalid cash flow input: Must be an array.');
    });

    test('should throw an error for empty array', () => {
        expect(() => analyzeCashFlows([])).toThrow('Invalid cash flow input: Must be an array.');
    });

    test('should throw an error for non-numeric cash flow values', () => {
        expect(() => analyzeCashFlows([100, 'invalid', -50])).toThrow('Invalid cash flow input: All elements must be numbers.');
    });
});

describe('getNFV', () => {
    test('should calculate NFV correctly', () => {
        const cashFlows = [100, -50, 30];
        const rate = 0.05;
        const result = getNFV(cashFlows, rate);
        expect(result).toBe(87.75);
    });
});

describe('getNPV', () => {
    test('should calculate NPV correctly', () => {
        const cashFlows = [100, -50, 30];
        const rate = 0.05;
        const result = getNPV(cashFlows, rate);
        expect(result).toBe(79.591837)
    });
});


