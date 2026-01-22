
export const MONTH_MAP: Record<string, string> = {
  "JANUARY": "01", "JAN": "01", "FEBRUARY": "02", "FEB": "02", "MARCH": "03", "MAR": "03", 
  "APRIL": "04", "APR": "04", "MAY": "05", "JUNE": "06", "JUN": "06",
  "JULY": "07", "JUL": "07", "AUGUST": "08", "AUG": "08", "SEPTEMBER": "09", "SEP": "09", 
  "OCTOBER": "10", "OCT": "10", "NOVEMBER": "11", "NOV": "11", "DECEMBER": "12", "DEC": "12",
  "يناير": "01", "فبراير": "02", "مارس": "03", "أبريل": "04", "مايو": "05", "يونيو": "06",
  "يوليو": "07", "أغسطس": "08", "سبتمبر": "09", "أكتوبر": "10", "نوفمبر": "11", "ديسمبر": "12"
};

export const COLUMN_SYNONYMS: Record<string, string[]> = {
  "NAME": ["NAME", "FULL NAME", "EMP NAME", "EMPLOYEE NAME", "الاسم", "اسم الموظف"],
  "EMP#": ["EMP#", "EMP NO", "BADGE", "رقم الموظف"],
  "MRN": ["MRN", "MEDICAL RECORD", "الملف الطبي", "رقم الملف", "M.R.N", "FILE NO"],
  "ID": ["ID", "ID#", "NATIONAL ID", "IQAMA", "الهوية"],
  "POSITION": ["POSITION", "JOB TITLE", "TITLE", "الوظيفة", "المسمى"],
  "COMMENTS": ["COMMENTS", "REMARKS", "ملاحظات"],
  "LOCATION_COMPONENTS": ["LOCATION", "LOC", "WARD", "UNIT", "DEPT", "الموقع", "القسم"]
};

export const SUMMARY_SYNONYMS = {
  ACTUAL: ["ACTUAL ON SITE", "TOTAL STAFF", "TOTAL REGISTERED", "TOTAL NUMBER (CONTRACT)", "الاجمالي", "العدد الكلي"],
  USED: ["USED VACATION", "ACTUALLY PRESENT", "TOTAL PRESENT", "STAFF ATTENDANCE", "الموجودين", "صافي العمل"],
  PERCENTAGE: ["VACATION PERCENTAGE", "PERCENTAGE", "نسبة الإجازة"]
};

export const VACATION_KEYWORDS = ["VAC", "LEAVE", "ANNUAL", "OFF", "إجازة", "اجازه", "L", "AL", "VL"];

export const HEADER_REQUISITES = {
  PRIMARY: ["NAME", "FULL NAME", "EMP NAME", "الاسم"],
  SECONDARY: ["EMP", "MRN", "ID", "POSITION", "LOC", "WARD", "UNIT"]
};
