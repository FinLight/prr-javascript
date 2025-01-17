import {analyzeCashFlows, analyzeIRRs} from "./cash-flows.js";

$(document).ready(() => {
    $("#analyzeButton").on("click", () => {
        const input = $("#cashFlowInput").val();
        const $cashFlowAnalysis = $("#cashFlowAnalysis");
        const $tableBody = $("#comparisonTable tbody");

        if (!input) {
            $tableBody.html("<tr><td colspan='5'>Please enter cash flows.</td></tr>");
            return;
        }

        try {
            const cashFlows = input.split(",").map(Number);
            const cashFlowResult = analyzeCashFlows(cashFlows);
            $cashFlowAnalysis.empty()
            $cashFlowAnalysis.html(
                `<span>Cash Flow Type: ${cashFlowResult.cashFlowType}</span><br/>
                <span>Net Cash Flow: ${cashFlowResult.netCashFlow}</span>
                `
            )

            const irrResult = analyzeIRRs(cashFlows);
            // Clear existing rows
            $tableBody.empty();

            // Add rows for both IRR calculations
            const irrRow = `
        <tr>
          <td>Primary IRR</td>
          <td>${irrResult.irr}%</td>
          <td>${irrResult.timeTaken.toFixed(2)} ms</td>
          <td>${irrResult.irrNFV.toFixed(2)}</td>
          <td>${irrResult.irrNPV.toFixed(2)}</td>
        </tr>
      `;
            const newIrrRow = `
        <tr>
          <td>New IRR</td>
          <td>${irrResult.newIRR}%</td>
          <td>${irrResult.newIRRTimeTaken.toFixed(2)} ms</td>
          <td>${irrResult.newIrrNFV.toFixed(2)}</td>
          <td>${irrResult.newIrrNPV.toFixed(2)}</td>
        </tr>
      `;
            $tableBody.append(irrRow);
            $tableBody.append(newIrrRow);
        } catch (error) {
            $tableBody.html(`<tr><td colspan='5'>Error: ${error.message}</td></tr>`);
        }
    });
});
