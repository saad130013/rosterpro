
import * as XLSX from 'xlsx';
import { MONTH_MAP, COLUMN_SYNONYMS } from '../constants';
import { 
  AuditResult, 
  MonthlyAuditStats, 
  DetailedVacationRow, 
  ExceptionRow, 
  ProcessingLog, 
  VacationRange,
  MasterEmployee
} from '../types';

const CONTRACT_TOTAL = 531;

const normalize = (text: any): string => {
  if (text === null || text === undefined) return '';
  return String(text).toUpperCase().replace(/[\s\t\n]+/g, ' ').trim();
};

const matchesSynonym = (text: string, key: keyof typeof COLUMN_SYNONYMS): boolean => {
  const normText = normalize(text);
  return COLUMN_SYNONYMS[key].some(syn => normText.includes(normalize(syn)));
};

const extractMonthFromFilename = (fileName: string): string => {
  const norm = normalize(fileName);
  let year = "2025";
  let monthStr = "UNKNOWN";

  const yearMatch = norm.match(/\b(20\d{2})\b/);
  if (yearMatch) year = yearMatch[1];

  const sortedMonthNames = Object.keys(MONTH_MAP).sort((a, b) => b.length - a.length);
  for (const name of sortedMonthNames) {
    if (norm.includes(normalize(name))) {
      monthStr = name;
      break;
    }
  }
  return `${monthStr} ${year}`;
};

const getMonthSortValue = (monthLabel: string): number => {
  const parts = monthLabel.split(' ');
  const name = parts[0];
  const year = parts[1] || "2025";
  const monthNum = MONTH_MAP[name.toUpperCase()] || "00";
  return parseInt(`${year}${monthNum}`);
};

const parseCommentsForDates = (text: string): { ranges: VacationRange[], problems: string[] } => {
  if (!text) return { ranges: [], problems: [] };
  const ranges: VacationRange[] = [];
  const problems: string[] = [];

  // Robust date regex for DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
  const datePattern = /(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/g;
  const dateMatches = Array.from(text.matchAll(datePattern));
  
  if (dateMatches.length === 0) return { ranges, problems };

  const toDate = (m: RegExpMatchArray): Date | null => {
    try {
      let d = parseInt(m[1]);
      let mnt = parseInt(m[2]);
      let y = parseInt(m[3]);
      if (y < 100) y += 2000;
      const date = new Date(y, mnt - 1, d);
      return isNaN(date.getTime()) ? null : date;
    } catch { return null; }
  };

  for (let i = 0; i < dateMatches.length - 1; i += 2) {
    const start = toDate(dateMatches[i]);
    const end = toDate(dateMatches[i+1]);

    if (start && end) {
      let finalStart = start;
      let finalEnd = end;
      if (end < start) {
        [finalStart, finalEnd] = [end, start];
      }
      const diff = Math.ceil((finalEnd.getTime() - finalStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      ranges.push({
        startDate: finalStart.toISOString().split('T')[0],
        endDate: finalEnd.toISOString().split('T')[0],
        duration: diff,
        originalText: `${dateMatches[i][0]} - ${dateMatches[i+1][0]}`
      });
    }
  }

  if (dateMatches.length === 1) problems.push("Single date found (missing end date)");
  else if (dateMatches.length > 0 && dateMatches.length % 2 !== 0) problems.push("Unpaired dates detected");

  return { ranges, problems };
};

export const processAuditFiles = async (files: File[]): Promise<AuditResult> => {
  const monthlySummaries: MonthlyAuditStats[] = [];
  const detailedRegister: DetailedVacationRow[] = [];
  const exceptionReport: ExceptionRow[] = [];
  const masterEmployeeMap = new Map<string, MasterEmployee>();
  const logs: ProcessingLog[] = [];

  for (const file of files) {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const monthLabel = extractMonthFromFilename(file.name);

    let actualOnSiteTotal = 0;
    let usedVacationTotal = 0;
    let monthConfirmedKeys = new Set<string>();
    let monthTotalVacationDays = 0;

    // Table 1 Processing
    const summarySheet = wb.Sheets['Table 1'];
    if (summarySheet) {
      const aoa: any[][] = XLSX.utils.sheet_to_json(summarySheet, { header: 1, defval: null });
      let actualColIdx = -1;
      let usedColIdx = -1;
      let totalRowIdx = -1;

      for (let i = 0; i < Math.min(aoa.length, 50); i++) {
        const row = aoa[i] || [];
        row.forEach((cell, idx) => {
          const norm = normalize(cell);
          if (norm.includes("ACTUAL ON SITE")) actualColIdx = idx;
          if (norm.includes("USED VACATION")) usedColIdx = idx;
        });
      }

      for (let i = 0; i < aoa.length; i++) {
        if (normalize(aoa[i]?.[0]).includes("TOTAL=")) {
          totalRowIdx = i;
          break;
        }
      }

      if (totalRowIdx !== -1) {
        if (actualColIdx !== -1) actualOnSiteTotal = parseFloat(aoa[totalRowIdx][actualColIdx]) || 0;
        if (usedColIdx !== -1) usedVacationTotal = parseFloat(aoa[totalRowIdx][usedColIdx]) || 0;
      }
    }

    // Process all content sheets
    wb.SheetNames.forEach(sn => {
      if (sn === 'Table 1') return;
      const sheet = wb.Sheets[sn];
      const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
      
      let headerIdx = -1;
      let mapping: Record<string, number> = {};

      for (let i = 0; i < Math.min(aoa.length, 50); i++) {
        const row = aoa[i] || [];
        let foundName = false;
        let foundMrn = false;

        row.forEach((cell, idx) => {
          const norm = normalize(cell);
          // Prioritize English Name if specified
          if (norm.includes("NAME (ENG)") || norm === "NAME") {
            mapping.name = idx;
            foundName = true;
          } else if (matchesSynonym(cell, 'NAME') && mapping.name === undefined) {
            mapping.name = idx;
            foundName = true;
          }

          if (matchesSynonym(cell, 'MRN')) { mapping.mrn = idx; foundMrn = true; }
          if (matchesSynonym(cell, 'COMMENTS')) { mapping.comments = idx; }
          if (matchesSynonym(cell, 'POSITION')) { mapping.pos = idx; }
          if (matchesSynonym(cell, 'LOCATION_COMPONENTS')) { mapping.loc = idx; }
        });

        if (foundName) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx !== -1) {
        for (let i = headerIdx + 1; i < aoa.length; i++) {
          const row = aoa[i];
          if (!row || !row[mapping.name]) continue;

          const mrn = String(row[mapping.mrn] || '').trim();
          const name = String(row[mapping.name] || '').trim();
          const comments = String(row[mapping.comments] || '').trim();
          const loc = mapping.loc !== undefined ? String(row[mapping.loc] || '').trim() : '';
          const pos = mapping.pos !== undefined ? String(row[mapping.pos] || '').trim() : '';

          const key = mrn || name;
          if (key) {
            masterEmployeeMap.set(key, {
              mrn, name, location: loc, position: pos, lastSeenMonth: monthLabel, sourceSheet: sn
            });
          }

          if (comments) {
            const { ranges, problems } = parseCommentsForDates(comments);
            if (ranges.length > 0) {
              monthConfirmedKeys.add(key);
              ranges.forEach(r => {
                monthTotalVacationDays += r.duration;
                detailedRegister.push({
                  month: monthLabel, mrn, name, location: loc, sheetName: sn,
                  startDate: r.startDate, endDate: r.endDate, duration: r.duration, originalComments: comments
                });
              });
            } else if (problems.length > 0) {
              exceptionReport.push({
                month: monthLabel, mrn, name, location: loc, sheetName: sn,
                problemType: problems.join(", "), originalComments: comments
              });
            }
          }
        }
      }
    });

    const calculatedVacationCount = actualOnSiteTotal - usedVacationTotal;
    const extractedVacationCount = monthConfirmedKeys.size;
    const diff = extractedVacationCount - calculatedVacationCount;
    
    const contractShortfall = (usedVacationTotal > 0) 
      ? (CONTRACT_TOTAL - usedVacationTotal) 
      : (CONTRACT_TOTAL - actualOnSiteTotal);

    monthlySummaries.push({
      month: monthLabel,
      actualOnSiteTotal,
      usedVacationTotal,
      calculatedVacationCount,
      extractedVacationCount,
      totalVacationDays: monthTotalVacationDays,
      contractShortfall,
      matchStatus: Math.abs(diff) === 0 ? 'Matched' : 'Mismatch',
      difference: diff
    });
  }

  monthlySummaries.sort((a, b) => getMonthSortValue(a.month) - getMonthSortValue(b.month));

  return {
    monthlySummaries,
    detailedRegister,
    exceptionReport,
    masterEmployees: Array.from(masterEmployeeMap.values()),
    fullYearTotals: {
      totalActualOnSite: monthlySummaries.reduce((acc, s) => acc + s.actualOnSiteTotal, 0),
      totalUsedVacation: monthlySummaries.reduce((acc, s) => acc + s.usedVacationTotal, 0),
      totalCalculatedVacation: monthlySummaries.reduce((acc, s) => acc + s.calculatedVacationCount, 0),
      totalConfirmedVacation: new Set(detailedRegister.map(r => r.mrn || r.name)).size,
      totalVacationDays: monthlySummaries.reduce((acc, s) => acc + s.totalVacationDays, 0),
      totalExceptions: exceptionReport.length
    },
    logs
  };
};

export const generateAuditExport = (result: AuditResult): Blob => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(result.monthlySummaries), "Executive Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(result.detailedRegister), "Confirmed Vacations");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(result.exceptionReport), "Exceptions");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(result.masterEmployees), "All Employees");
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};

export const generateVacationOnlyExport = (vacations: DetailedVacationRow[]): Blob => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(vacations);
  XLSX.utils.book_append_sheet(wb, ws, "Yearly Vacation Records");
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};
