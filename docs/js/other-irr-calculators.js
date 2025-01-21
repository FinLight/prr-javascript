import RaosIrrCalculator from "./raos-irr-calculator.js";

export class IRRCalculatorNR_NPV {
    static calculate(cashFlows) {
        return RaosIrrCalculator.irrNewtonRaphsonNPV(cashFlows)
    }
}

export class IRRCalculatorNR_NFV {
    static calculate(cashFlows) {
        return RaosIrrCalculator.irrNewtonRaphsonNFV(cashFlows)
    }
}

export class IRRCalculatorBrent {
    static calculate(cashFlows, lower = 0.0, upper = 1.0) {
        const precision = 1e-6;
        const maxIterations = 1000;

        let a = lower, b = upper, fa, fb;
        fa = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + a, t), 0);
        fb = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + b, t), 0);

        if (fa * fb > 0) return Number.NaN;

        let c = a, fc = fa, s, fs;

        for (let i = 0; i < maxIterations; i++) {
            if (fa !== fc && fb !== fc) {
                s = (a * fb * fc) / ((fa - fb) * (fa - fc)) +
                    (b * fa * fc) / ((fb - fa) * (fb - fc)) +
                    (c * fa * fb) / ((fc - fa) * (fc - fb));
            } else {
                s = b - fb * (b - a) / (fb - fa);
            }

            if (!((s > (3 * a + b) / 4 && s < b) || Math.abs(s - b) < precision)) {
                s = (a + b) / 2;
            }

            fs = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + s, t), 0);

            c = b;
            fc = fb;
            if (fa * fs < 0) b = s;
            else a = s;

            fb = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + b, t), 0);
            if (Math.abs(fb) < precision) return b;
        }

        return Number.NaN;
    }
}

export class IRRCalculatorBisection {
    static calculate(cashFlows, lower = 0.0, upper = 1.0) {
        const precision = 1e-6;
        const maxIterations = 1000;

        let a = lower, b = upper, mid;

        for (let i = 0; i < maxIterations; i++) {
            mid = (a + b) / 2;
            const fMid = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + mid, t), 0);
            const fA = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + a, t), 0);

            if (Math.abs(fMid) < precision) return mid;
            if (fMid * fA < 0) b = mid;
            else a = mid;
        }

        return Number.NaN;
    }
}

export class IRRCalculatorSecant {
    static calculate(cashFlows, x0 = 0.1, x1 = 0.2) {
        const maxIterations = 1000;
        const precision = 1e-6;

        let xPrev = x0, xCurr = x1;

        for (let i = 0; i < maxIterations; i++) {
            const fPrev = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + xPrev, t), 0);
            const fCurr = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + xCurr, t), 0);

            if (Math.abs(fCurr) < precision) return xCurr;

            const xNext = xCurr - fCurr * (xCurr - xPrev) / (fCurr - fPrev);
            if (Math.abs(xNext - xCurr) < precision) return xNext;

            xPrev = xCurr;
            xCurr = xNext;
        }

        return Number.NaN;
    }
}
