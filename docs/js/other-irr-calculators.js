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

        let a = lower, b = upper;
        let fa = this.netPresentValue(cashFlows, a);
        let fb = this.netPresentValue(cashFlows, b);

        if (fa * fb > 0) {
            console.log("Root is not bracketed within the specified bounds.");
            return Number.NaN
        }

        let c = a, fc = fa, s, fs;

        for (let i = 0; i < maxIterations; i++) {
            if (fa !== fc && fb !== fc) {
                // Use inverse quadratic interpolation
                s = (a * fb * fc) / ((fa - fb) * (fa - fc)) +
                    (b * fa * fc) / ((fb - fa) * (fb - fc)) +
                    (c * fa * fb) / ((fc - fa) * (fc - fb));
            } else {
                // Use secant method
                s = b - fb * (b - a) / (fb - fa);
            }

            // Ensure s is within bounds or fallback to bisection
            if (!(s > (3 * a + b) / 4 && s < b) || Math.abs(s - b) < precision) {
                s = (a + b) / 2;
            }

            fs = this.netPresentValue(cashFlows, s);

            c = b;
            fc = fb;
            if (fa * fs < 0) {
                b = s;
                fb = fs;
            } else {
                a = s;
                fa = fs;
            }

            // Check convergence
            if (Math.abs(fs) < precision || Math.abs(b - a) < precision) {
                return s;
            }
        }

        console.log("Failed to converge to a solution within the maximum iterations.");
        return Number.NaN
    }

    static netPresentValue(cashFlows, rate) {
        return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
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
