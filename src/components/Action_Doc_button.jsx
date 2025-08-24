// ActionDocument.jsx
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ActionDocument = ({ 
  selectedChapter, 
  selectedSchool, 
  observationAnalysisData, 
  questionStatsAnalysisData 
}) => {

  const generatePDF = () => {
    if (!selectedChapter || !selectedSchool) {
      alert("Please select both Chapter and School before generating the report.");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Consolidated Report", 14, 20);

    // Chapter & School info
    doc.setFontSize(12);
    doc.text(`Chapter: ${selectedChapter}`, 14, 30);
    doc.text(`School: ${selectedSchool}`, 14, 38);

    // Observation Analysis Table
    if (observationAnalysisData && observationAnalysisData.length > 0) {
      const observationTable = observationAnalysisData.map((item) => [
        item.q,
        item.yes,
        item.no,
      ]);

      autoTable(doc, {
        startY: 50,
        head: [["Question", "Yes", "No"]],
        body: observationTable,
      });
    }

    // Question Stats Table (if available)
    if (questionStatsAnalysisData && questionStatsAnalysisData.length > 0) {
      const bodyData = [];
      questionStatsAnalysisData.forEach((q) => {
        q.rides.forEach((ride) => {
          bodyData.push([
            q.qName,
            ride.ride,
            ride.yes,
            ride.no,
            ride.total,
          ]);
        });
      });

      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80,
        head: [["Question", "Ride", "Yes", "No", "Total"]],
        body: bodyData,
      });
    }

    // Save PDF
    doc.save(`Report_${selectedChapter}_${selectedSchool}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
    >
      📄 Action Document
    </button>
  );
};

export default ActionDocument;
