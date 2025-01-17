
import { getNFV, getNPV } from "./cash-flows.js";
import RaosIrrCalculator from "./raos-irr-calculator.js";
import {
    IRRCalculatorBisection,
    IRRCalculatorBrent,
    IRRCalculatorNR_NFV,
    IRRCalculatorNR_NPV, IRRCalculatorSecant
} from "./other-irr-calculators.js";

export const analyzeIRRs = (cashFlows) => {
    const calculators = [
        { name: "Rao's Method", calc: RaosIrrCalculator },
        { name: "Newton-Raphson (NPV)", calc: IRRCalculatorNR_NPV},
        { name: "Newton-Raphson (NFV)", calc: IRRCalculatorNR_NFV },
        { name: "Brent's Method", calc: IRRCalculatorBrent},
        { name: "Bisection Method", calc: IRRCalculatorBisection },
        { name: "Secant Method", calc: IRRCalculatorSecant},
    ];

    return calculators.map(({ name, calc }) => {
        let irr;
        let startTime = performance.now();
        try {
            irr = calc.calculate(cashFlows);
        } catch (error) {
            irr = "Could not calculate IRR (invalid or non-convergent cash flows)";
            console.log(`Error in ${name}:`, error);
        }
        let endTime = performance.now();
        const timeTaken = endTime - startTime;

        const irrNFV = typeof irr === "number" ? getNFV(cashFlows, irr) : null;
        const irrNPV = typeof irr === "number" ? getNPV(cashFlows, irr) : null;

        return {
            method: name,
            irr: typeof irr === "number" ? irr * 100 : irr, // Convert to percentage if it's a number
            timeTaken,
            irrNFV,
            irrNPV,
        };
    });
};
