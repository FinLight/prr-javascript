import RandomCashFlow, { CashFlowTarget } from "../docs/js/random-cash-flow.js";
import { analyzeCashFlows, CashFlowType } from '../docs/js/cash-flows.js';

describe('RandomCashFlow', () => {
    let instance;

    beforeEach(() => {
        instance = new RandomCashFlow();
    });

    describe('generateRandomCashFlows', () => {
        test('should generate random cash flows with default options', () => {
            instance.generateRandomCashFlows();
            const cashFlows = instance.getCashFlows();

            expect(cashFlows).toBeInstanceOf(Array);
            expect(cashFlows.length).toBeGreaterThan(1); // Default count should generate at least 2 cash flows
            cashFlows.forEach(amount => {
                expect(amount).toBeGreaterThanOrEqual(-10000);
                expect(amount).toBeLessThanOrEqual(10000);
            });
        });

        test('should generate random cash flows with custom options', () => {
            instance.generateRandomCashFlows({
                count: 5,
                minAmount: 100,
                maxAmount: 500
            });

            const cashFlows = instance.getCashFlows();
            expect(cashFlows).toHaveLength(5);
            cashFlows.forEach(amount => {
                expect(amount).toBeGreaterThanOrEqual(100);
                expect(amount).toBeLessThanOrEqual(500);
            });
        });

        test('should throw an error if options are invalid', () => {
            // Invalid count: Less than
            expect(() => {
                instance.generateRandomCashFlows({ count: 0 });
            }).toThrow('Invalid "count": It must be an integer greater than or equal to 1.');

            // Invalid count: Non-integer
            expect(() => {
                instance.generateRandomCashFlows({ count: 2.5 });
            }).toThrow('Invalid "count": It must be an integer greater than or equal to 1.');

            // Invalid count: Not a number
            expect(() => {
                instance.generateRandomCashFlows({ count: 'five' });
            }).toThrow('Invalid "count": It must be an integer greater than or equal to 1.');

            // Invalid minAmount: Not a number
            expect(() => {
                instance.generateRandomCashFlows({ minAmount: 'low', maxAmount: 500 });
            }).toThrow('"minAmount" and "maxAmount" must be numbers.');

            // Invalid maxAmount: Not a number
            expect(() => {
                instance.generateRandomCashFlows({ minAmount: 100, maxAmount: 'high' });
            }).toThrow('"minAmount" and "maxAmount" must be numbers.');

            // Invalid range: minAmount > maxAmount
            expect(() => {
                instance.generateRandomCashFlows({ minAmount: 500, maxAmount: 100 });
            }).toThrow('"minAmount" cannot be greater than "maxAmount".');

            // Invalid options: No options provided
            // This should NOT throw because defaults are applied
            expect(() => {
                instance.generateRandomCashFlows();
            }).not.toThrow();

            // Invalid options: Extra properties (should be ignored)
            expect(() => {
                instance.generateRandomCashFlows({ count: 5, minAmount: 100, maxAmount: 500, extra: 'ignored' });
            }).not.toThrow();
        });
    });

    describe('RandomCashFlow.adjustCashFlows', () => {
        let instance;

        beforeEach(() => {
            instance = new RandomCashFlow();
        });

        test('should throw an error if cash flows are empty', () => {
            expect(() => instance.adjustCashFlows(CashFlowTarget.ZERO)).toThrow(
                'Cash flows array cannot be empty.'
            );
        });

        test('should adjust cash flows to make the net cash flow zero', () => {
            instance.cashFlows = [-932.59, 389.85, 12.9, -229.17];
            instance.adjustCashFlows(CashFlowTarget.ZERO);

            const netCashFlow = instance.cashFlows.reduce((sum, flow) => sum + flow, 0);

            expect(netCashFlow).toBeCloseTo(0, instance.precision);
        });

        test('should adjust cash flows to make the net cash flow positive', () => {
            instance.cashFlows = [-932.59, 389.85, 12.9, -229.17];
            instance.adjustCashFlows(CashFlowTarget.POSITIVE);

            const netCashFlow = instance.cashFlows.reduce((sum, flow) => sum + flow, 0);

            expect(netCashFlow).toBeGreaterThan(0);
        });

        test('should adjust cash flows to make the net cash flow positive with adjustment', () => {
            instance.cashFlows = [-932.59, 389.85, 12.9, -229.17];
            instance.adjustCashFlows(CashFlowTarget.POSITIVE, 100);

            const netCashFlow = instance.cashFlows.reduce((sum, flow) => sum + flow, 0);

            expect(netCashFlow).toBeGreaterThanOrEqual(100);
        });

        test('should adjust cash flows to make the net cash flow negative', () => {
            instance.cashFlows = [932.59, -389.85, -12.9, 229.17];
            instance.adjustCashFlows(CashFlowTarget.NEGATIVE);

            const netCashFlow = instance.cashFlows.reduce((sum, flow) => sum + flow, 0);

            expect(netCashFlow).toBeLessThan(0);
        });

        test('should adjust cash flows to make the net cash flow negative with adjustment', () => {
            instance.cashFlows = [932.59, -389.85, -12.9, 229.17];
            instance.adjustCashFlows(CashFlowTarget.NEGATIVE, 200);

            const netCashFlow = instance.cashFlows.reduce((sum, flow) => sum + flow, 0);

            expect(netCashFlow).toBeLessThanOrEqual(-200);
        });

        test('should throw an error for invalid target', () => {
            instance.cashFlows = [932.59, -389.85, -12.9, 229.17];
            expect(() => instance.adjustCashFlows('INVALID_TARGET')).toThrow(
                'Invalid target specified. Use "ZERO", "POSITIVE", or "NEGATIVE".'
            );
        });
    });


    describe('exportCashFlows', () => {
        test('should export cash flows in JSON format', () => {
            instance.generateRandomCashFlows({ count: 3, minAmount: 100, maxAmount: 500 });
            const jsonExport = instance.exportCashFlows('json');

            expect(jsonExport).toBeDefined();
            const parsed = JSON.parse(jsonExport);
            expect(parsed).toBeInstanceOf(Array);
            expect(parsed).toHaveLength(3);
            parsed.forEach(amount => {
                expect(amount).toBeGreaterThanOrEqual(100);
                expect(amount).toBeLessThanOrEqual(500);
            });
        });

        test('should export cash flows in CSV format', () => {
            instance.generateRandomCashFlows({ count: 3, minAmount: 100, maxAmount: 500 });
            const csvExport = instance.exportCashFlows('csv');

            expect(csvExport).toBeDefined();
            const rows = csvExport.split('\n');
            expect(rows).toHaveLength(3);
            rows.forEach(amount => {
                const num = parseFloat(amount);
                expect(num).toBeGreaterThanOrEqual(100);
                expect(num).toBeLessThanOrEqual(500);
            });
        });

        test('should throw an error if no cash flows are generated', () => {
            expect(() => {
                instance.exportCashFlows('json');
            }).toThrow('No cash flows available. Generate cash flows first.');

            expect(() => {
                instance.exportCashFlows('csv');
            }).toThrow('No cash flows available. Generate cash flows first.');
        });

        test('should throw an error for unsupported formats', () => {
            instance.generateRandomCashFlows({ count: 3, minAmount: 100, maxAmount: 500 });
            expect(() => {
                instance.exportCashFlows('xml');
            }).toThrow('Unsupported format. Use "json" or "csv".');
        });
    });

    describe('getCashFlows', () => {
        test('should return an empty array if no cash flows are generated', () => {
            const cashFlows = instance.getCashFlows();
            expect(cashFlows).toEqual([]);
        });

        test('should return the generated cash flows', () => {
            instance.generateRandomCashFlows({ count: 5, minAmount: 100, maxAmount: 500 });
            const cashFlows = instance.getCashFlows();

            expect(cashFlows).toHaveLength(5);
            cashFlows.forEach(amount => {
                expect(amount).toBeGreaterThanOrEqual(100);
                expect(amount).toBeLessThanOrEqual(500);
            });
        });
    });

    describe('RandomCashFlow.generateRandomCashFlowsByCashFlowType', () => {
        let instance;

        beforeEach(() => {
            instance = new RandomCashFlow();
        });

        test('should generate net zero cash flows', () => {
            instance.generateRandomCashFlowsByCashFlowType(CashFlowType.NET_ZERO, {
                count: 5,
                minAmount: -1000,
                maxAmount: 1000
            });
            const cashFlows = instance.getCashFlows();
            const analysis = analyzeCashFlows(cashFlows);
            expect(analysis.netCashFlow).toBe(0)
            expect(analysis.cashFlowType).toBe(CashFlowType.NET_ZERO);
        });

        test('should generate all outflow cash flows', () => {
            instance.generateRandomCashFlowsByCashFlowType(CashFlowType.ALL_OUTFLOW, {
                count: 5,
                minAmount: -1000,
                maxAmount: -10
            });
            const cashFlows = instance.getCashFlows();
            expect(cashFlows).toHaveLength(5);
            const analysis = analyzeCashFlows(cashFlows);
            expect(analysis.netCashFlow).toBeLessThan(0)
            expect(analysis.cashFlowType).toBe(CashFlowType.ALL_OUTFLOW);
        });

        test('should generate all inflow cash flows', () => {
            instance.generateRandomCashFlowsByCashFlowType(CashFlowType.ALL_INFLOW, {
                count: 5,
                minAmount: 10,
                maxAmount: 1000
            });
            const cashFlows = instance.getCashFlows();
            expect(cashFlows).toHaveLength(5);
            const analysis = analyzeCashFlows(cashFlows);
            expect(analysis.netCashFlow).toBeGreaterThanOrEqual(0)
            expect(analysis.cashFlowType).toBe(CashFlowType.ALL_INFLOW);
        });

        test('should generate outflow followed by inflow cash flows', () => {
            instance.generateRandomCashFlowsByCashFlowType(CashFlowType.OUTFLOW_INFLOW, {
                count: 10,
                minAmount: -500,
                maxAmount: 500
            });
            const cashFlows = instance.getCashFlows();
            const analysis = analyzeCashFlows(cashFlows);
            expect(analysis.cashFlowType).toBe(CashFlowType.OUTFLOW_INFLOW);
        });

        test('should generate inflow followed by outflow cash flows', () => {
            instance.generateRandomCashFlowsByCashFlowType(CashFlowType.INFLOW_OUTFLOW, {
                count: 10,
                minAmount: -500,
                maxAmount: 500
            });
            const cashFlows = instance.getCashFlows();
            expect(cashFlows).toHaveLength(10);
            const analysis = analyzeCashFlows(cashFlows);
            expect(analysis.cashFlowType).toBe(CashFlowType.INFLOW_OUTFLOW);
        });

        test('should generate zigzag cash flows', () => {
            instance.generateRandomCashFlowsByCashFlowType(CashFlowType.ZIGZAG, {
                count: 10,
                minAmount: -500,
                maxAmount: 500
            });
            const cashFlows = instance.getCashFlows();
            expect(cashFlows).toHaveLength(10);
            const analysis = analyzeCashFlows(cashFlows);
            expect(analysis.cashFlowType).toBe(CashFlowType.ZIGZAG);
        });

        test('should throw an error for unsupported cash flow type', () => {
            expect(() =>
                instance.generateRandomCashFlowsByCashFlowType('UNSUPPORTED_TYPE')
            ).toThrow('Unsupported CashFlowType: UNSUPPORTED_TYPE');
        });

        test('should throw an error if unable to generate zigzag cash flows', () => {
            const maxIterations = 1000;
            const options = {
                count: 10,
                minAmount: -500,
                maxAmount: 500
            };

            try {
                instance.generateRandomCashFlowsByCashFlowType(CashFlowType.ZIGZAG, options);
            } catch (error) {
                expect(error.message).toBe(`Unable to generate a ZigZag pattern after ${maxIterations} attempts.`);
            }
        });
    });
});
