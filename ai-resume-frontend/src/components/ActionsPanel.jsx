import React from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ActionsPanel({ result }) {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  async function downloadPDF() {
    const node = document.getElementById("results");
    if (!node) {
      alert("No results to export");
      return;
    }

    // Increase scale for better resolution
    const canvas = await html2canvas(node, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("analysis.pdf");
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
      <button onClick={downloadJSON} className="w-full bg-slate-800 text-white py-2 rounded mb-3 hover:bg-slate-900">Export JSON</button>
      <button onClick={downloadPDF} className="w-full border py-2 rounded hover:bg-slate-50">Download PDF</button>

      <div className="mt-4">
        <h5 className="text-xs text-slate-500 mb-1">Raw response</h5>
        <pre className="text-xs max-h-44 overflow-auto bg-slate-50 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}
