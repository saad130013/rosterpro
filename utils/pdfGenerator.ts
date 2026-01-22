
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { AuditResult, MonthlyAuditStats, DetailedVacationRow } from "../types";
import { MONTH_MAP } from "../constants";

const CONTRACT_TOTAL = 531;

// Helper to get chronological value for sorting
const getMonthSortValue = (monthLabel: string): number => {
  const parts = monthLabel.split(' ');
  const name = parts[0].toUpperCase();
  const year = parts[1] || "2025";
  const monthNum = MONTH_MAP[name] || "00";
  return parseInt(`${year}${monthNum}`);
};

export const generateReconciliationPDF = (summaries: MonthlyAuditStats[]) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Sort summaries just in case
  const sortedSummaries = [...summaries].sort((a, b) => getMonthSortValue(a.month) - getMonthSortValue(b.month));

  // Header Styling
  doc.setFillColor(63, 70, 229); // Indigo-600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Reconciliation Summary", 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${timestamp}`, 15, 30);
  doc.text(`Fiscal Year: 2025 Audit`, 15, 35);

  (doc as any).autoTable({
    startY: 50,
    head: [['Month', 'Actual', 'Used', 'Vac. Count', 'Total Days', 'Shortfall', 'Status', 'Variance']],
    body: sortedSummaries.map(s => [
      s.month,
      s.actualOnSiteTotal,
      s.usedVacationTotal,
      s.extractedVacationCount,
      s.totalVacationDays,
      s.contractShortfall,
      s.matchStatus,
      s.difference
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [63, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      4: { fontStyle: 'bold', textColor: [5, 150, 105] },
      5: { fontStyle: 'bold' },
      6: { fontStyle: 'bold' },
      7: { fontStyle: 'bold' }
    }
  });

  doc.save(`Monthly_Reconciliation_Report_2025.pdf`);
};

export const generateBoardVacationReport = (result: AuditResult) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // 1. Chronological Sorting of Data
  const sortedSummaries = [...result.monthlySummaries].sort((a, b) => getMonthSortValue(a.month) - getMonthSortValue(b.month));
  const sortedRegister = [...result.detailedRegister].sort((a, b) => getMonthSortValue(a.month) - getMonthSortValue(b.month));

  // COVER SECTION / TOP HEADER
  doc.setFillColor(30, 41, 59); // Slate-900 (Professional Navy)
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ANNUAL VACATION REPORT", 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Prepared for: Environmental Services Department", 105, 35, { align: 'center' });
  doc.text(`FISCAL YEAR 2025`, 105, 42, { align: 'center' });

  // EXECUTIVE SUMMARY BOXES
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE SUMMARY & KPIS", 15, 65);
  doc.setLineWidth(0.5);
  doc.line(15, 68, 200, 68);

  // Summary Metrics Table
  (doc as any).autoTable({
    startY: 72,
    head: [['Key Performance Indicator', 'Value']],
    body: [
      ['Total Unique Employees with Leave', result.fullYearTotals.totalConfirmedVacation.toString()],
      ['Average Monthly Participation', `${Math.round(result.fullYearTotals.totalConfirmedVacation / (sortedSummaries.length || 1))} Staff/Month`],
      ['Data Integrity Score', `${Math.max(0, 100 - Math.round((result.exceptionReport.length / (result.masterEmployees.length || 1)) * 100))}%`]
    ],
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] }
  });

  // NEW SECTION: MONTHLY VACATION PARTICIPATION
  const participationY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("MONTHLY LEAVE PARTICIPATION", 15, participationY);
  
  (doc as any).autoTable({
    startY: participationY + 5,
    head: [['Reporting Month', 'Employee Count (Took Leave)', 'Percentage of Contract (531)']],
    body: sortedSummaries.map(s => [
      s.month,
      `${s.extractedVacationCount} Employees`,
      `${((s.extractedVacationCount / CONTRACT_TOTAL) * 100).toFixed(1)}%`
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 58, 138] }, // Deep Blue
    columnStyles: {
      1: { fontStyle: 'bold', textColor: [30, 58, 138] }
    }
  });

  // DETAILED REGISTER (Starts on new page)
  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("Individual Leave Records", 105, 13, { align: 'center' });

  (doc as any).autoTable({
    startY: 25,
    head: [['Month', 'Staff Name', 'MRN', 'Start Date', 'End Date', 'Duration']],
    body: sortedRegister.map(r => [
      r.month,
      r.name.toUpperCase(),
      r.mrn,
      r.startDate,
      r.endDate,
      `${r.duration} Days`
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      5: { fontStyle: 'bold', textColor: [30, 58, 138] }
    }
  });

  // Footer for all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Safari Company Employees’ Leave Report | Prepared by: Layla Alotaibi | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`Board_Vacation_Full_Audit_2025.pdf`);
};
