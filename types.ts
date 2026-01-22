
export interface VacationRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  duration: number;
  originalText: string;
}

export interface DetailedVacationRow {
  month: string;
  mrn: string;
  name: string;
  location: string;
  sheetName: string;
  startDate: string;
  endDate: string;
  duration: number;
  originalComments: string;
}

export interface ExceptionRow {
  month: string;
  mrn: string;
  name: string;
  location: string;
  sheetName: string;
  problemType: string;
  originalComments: string;
}

export interface MonthlyAuditStats {
  month: string;
  actualOnSiteTotal: number;
  usedVacationTotal: number;
  calculatedVacationCount: number;
  extractedVacationCount: number;
  totalVacationDays: number; // New field: Sum of all vacation durations for this month
  contractShortfall: number;
  matchStatus: 'Matched' | 'Mismatch';
  difference: number;
}

export interface MasterEmployee {
  mrn: string;
  name: string;
  location: string;
  position: string;
  lastSeenMonth: string;
  sourceSheet: string;
}

export interface ProcessingLog {
  fileName: string;
  sheetName: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  blocksFound?: number;
  rowsExtracted?: number;
}

export interface FullYearTotals {
  totalActualOnSite: number;
  totalUsedVacation: number;
  totalCalculatedVacation: number;
  totalConfirmedVacation: number;
  totalVacationDays: number; // New statistical field
  totalExceptions: number;
}

export interface AuditResult {
  monthlySummaries: MonthlyAuditStats[];
  detailedRegister: DetailedVacationRow[];
  exceptionReport: ExceptionRow[];
  masterEmployees: MasterEmployee[];
  fullYearTotals: FullYearTotals;
  logs: ProcessingLog[];
}

export interface EmployeeRecord {
  NAME?: string;
  MRN?: string;
  ID?: string;
  POSITION?: string;
  GENDER?: string;
  NATIONALITY?: string;
}
