
import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Download, 
  ShieldAlert, 
  Calendar, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  FileText, 
  BarChart3,
  TrendingUp,
  History,
  Search,
  FileOutput,
  Briefcase,
  FileSpreadsheet,
  FilePieChart,
  ShieldCheck,
  SearchCheck,
  Info,
  FileDown
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessingLogs from './components/ProcessingLogs';
import { AuditResult } from './types';
import { processAuditFiles, generateAuditExport, generateVacationOnlyExport } from './utils/excelParser';
import { generateReconciliationPDF, generateBoardVacationReport } from './utils/pdfGenerator';

const CONTRACT_TOTAL = 531;

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'register' | 'exceptions' | 'search' | 'year' | 'integrity'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [vacationSearch, setVacationSearch] = useState('');

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setResult(null);
  };

  const runProcessing = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const output = await processAuditFiles(files);
      setResult(output);
      setActiveTab('summary');
    } catch (err) {
      console.error(err);
      alert("Error processing audit files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!result || !searchQuery) return [];
    const q = searchQuery.toUpperCase();
    return result.masterEmployees.filter(e => 
      e.name.toUpperCase().includes(q) || e.mrn.toUpperCase().includes(q)
    );
  }, [result, searchQuery]);

  const filteredVacations = useMemo(() => {
    if (!result) return [];
    if (!vacationSearch) return result.detailedRegister;
    const q = vacationSearch.toUpperCase();
    return result.detailedRegister.filter(r => 
      r.name.toUpperCase().includes(q) || r.mrn.toUpperCase().includes(q)
    );
  }, [result, vacationSearch]);

  const downloadFullExcel = () => {
    if (!result) return;
    const blob = generateAuditExport(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Full_Audit_Report_2025.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadVacationsExcel = () => {
    if (!result) return;
    const blob = generateVacationOnlyExport(result.detailedRegister);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yearly_Vacation_Registry_2025.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMonthlyVacationExcel = (monthName: string) => {
    if (!result) return;
    const monthVacations = result.detailedRegister.filter(v => v.month === monthName);
    if (monthVacations.length === 0) {
      alert("No vacation records found for this month.");
      return;
    }
    const blob = generateVacationOnlyExport(monthVacations);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vacations_${monthName.replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSummaryPDF = () => {
    if (result) generateReconciliationPDF(result.monthlySummaries);
  };

  const downloadBoardPDF = () => {
    if (result) generateBoardVacationReport(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded text-white shadow-indigo-200 shadow-lg">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              Roster <span className="text-indigo-600">Audit</span> 2025
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {result && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={downloadVacationsExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded border border-indigo-100 hover:bg-indigo-100 transition-all uppercase tracking-wider shadow-sm"
                >
                  <FileSpreadsheet size={14} />
                  Vacations Excel (All)
                </button>
                <button 
                  onClick={downloadFullExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded hover:bg-emerald-700 transition-all uppercase tracking-wider shadow-sm"
                >
                  <Download size={14} />
                  Full Audit Excel
                </button>
              </div>
            )}
            <button 
              onClick={runProcessing}
              disabled={files.length === 0 || isProcessing}
              className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider ${
                isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95'
              }`}
            >
              <Play size={14} fill="currentColor" />
              {isProcessing ? 'Auditing...' : 'Run Full Audit'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={14} />
                Monthly Files
              </h2>
              <FileUpload 
                onFilesSelected={handleFilesSelected} 
                selectedFiles={files} 
                onRemoveFile={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))} 
              />
            </div>

            {result && (
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl overflow-hidden relative border-b-4 border-indigo-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BarChart3 size={80} />
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Total Staff</div>
                      <div className="text-2xl font-black text-white">{result.masterEmployees.length}</div>
                    </div>
                    <Users size={20} className="text-indigo-400 mb-1" />
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Confirmed Vac.</div>
                      <div className="text-2xl font-black text-emerald-400">{result.fullYearTotals.totalConfirmedVacation}</div>
                    </div>
                    <Calendar size={20} className="text-emerald-400 mb-1" />
                  </div>
                   <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Total Leave Days</div>
                      <div className="text-2xl font-black text-indigo-400">{result.fullYearTotals.totalVacationDays}</div>
                    </div>
                    <Briefcase size={20} className="text-indigo-400 mb-1" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-9 space-y-6">
            {!result && !isProcessing && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl h-96 flex flex-col items-center justify-center text-slate-400 p-10 text-center shadow-inner">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <History size={48} className="opacity-20" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Ready for Roster Audit</h3>
                <p className="text-sm mt-2 max-w-sm text-slate-500 font-medium">Upload monthly Duty Roster Excel files to extract vacation data and perform reconciliation.</p>
              </div>
            )}

            {isProcessing && (
              <div className="bg-white p-24 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Analyzing Roster Files...</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium italic">Processing English names and scanning comments for vacation dates...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar shadow-inner">
                  {[
                    { id: 'summary', label: 'Summary', icon: <TrendingUp size={14}/> },
                    { id: 'register', label: 'Vacation Register', icon: <Briefcase size={14}/> },
                    { id: 'search', label: 'Global Registry', icon: <Search size={14}/> },
                    { id: 'integrity', label: 'Audit Verification', icon: <ShieldCheck size={14}/> },
                    { id: 'exceptions', label: 'Audit Errors', icon: <AlertTriangle size={14}/> },
                    { id: 'year', label: 'Year Totals', icon: <BarChart3 size={14}/> }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)} 
                      className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
                        activeTab === tab.id ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileOutput size={14} />
                        Monthly Reconciliation Report (English Names Only)
                       </h3>
                       <div className="flex gap-2">
                         <button 
                           onClick={downloadSummaryPDF}
                           className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg border border-rose-100 hover:bg-rose-100 transition-all uppercase tracking-tighter"
                         >
                           <FileText size={12} />
                           Download PDF Summary
                         </button>
                       </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-tighter border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4">Month</th>
                              <th className="px-4 py-4 text-center">Actual (T1)</th>
                              <th className="px-4 py-4 text-center">Used (T1)</th>
                              <th className="px-4 py-4 text-center bg-indigo-50/50">Vac. Extracted</th>
                              <th className="px-4 py-4 text-center bg-emerald-50/50 text-emerald-600">Total Leave Days</th>
                              <th className="px-4 py-4 text-center bg-rose-50/50 text-rose-600 font-black">Shortfall (531)</th>
                              <th className="px-4 py-4 text-center">Status</th>
                              <th className="px-4 py-4 text-center">Variance</th>
                              <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {result.monthlySummaries.map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-900">{s.month}</td>
                                <td className="px-4 py-4 text-center font-mono text-slate-500">{s.actualOnSiteTotal}</td>
                                <td className="px-4 py-4 text-center font-mono text-slate-500">{s.usedVacationTotal}</td>
                                <td className="px-4 py-4 text-center font-black bg-indigo-50/30 text-indigo-600">{s.extractedVacationCount}</td>
                                <td className="px-4 py-4 text-center font-black bg-emerald-50/30 text-emerald-600">{s.totalVacationDays}</td>
                                <td className="px-4 py-4 text-center font-black bg-rose-50/30 text-rose-600">{s.contractShortfall}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    s.matchStatus === 'Matched' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {s.matchStatus}
                                  </span>
                                </td>
                                <td className={`px-4 py-4 text-center font-black ${s.difference === 0 ? 'text-slate-400' : 'text-rose-600'}`}>
                                  {s.difference > 0 ? `+${s.difference}` : s.difference}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => downloadMonthlyVacationExcel(s.month)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    title={`Download ${s.month} Vacations Excel`}
                                  >
                                    <FileDown size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'integrity' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                          <ShieldCheck size={28} className="text-indigo-400" />
                          دليل التحقق من صحة البيانات (100% Accuracy Guide)
                        </h3>
                        <p className="mt-4 text-indigo-100 text-sm leading-relaxed max-w-2xl">
                          للتأكد من عدم وجود نقص أو زيادة، يعتمد النظام على **المطابقة الرياضية** بين ملخص الإدارة (Table 1) وبين ما تم استخراجه فعلياً من جداول العمل.
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldAlert size={160} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm">
                        <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                          <SearchCheck size={20} />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm uppercase mb-2">1. قاعدة Variance = 0</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          إذا كان الفرق (Variance) صفراً، فهذا يعني أن البرنامج وجد بالضبط نفس عدد الموظفين المذكورين في ملخص الشهر. أي زيادة أو نقص ستظهر كرقم أحمر فوراً.
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border-l-4 border-rose-500 shadow-sm">
                        <div className="bg-rose-50 w-10 h-10 rounded-lg flex items-center justify-center text-rose-600 mb-4">
                          <AlertTriangle size={20} />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm uppercase mb-2">2. تصفية الأخطاء اليدوية</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          راجع تبويب **"Audit Errors"**. إذا كتب المنسق "Vacation" بدون تاريخ، البرنامج سيعتبره خطأ ولن يحسبه لضمان عدم رصد أيام غير محددة.
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm">
                        <div className="bg-indigo-50 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                          <Info size={20} />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm uppercase mb-2">3. جودة استخراج التواريخ</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          يتعرف البرنامج على تنسيقات التواريخ (DD/MM/YYYY) بدقة. إذا كان هناك تداخل في التواريخ، سيتم إدراجها كاستثناء للمراجعة البشرية.
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                       <h5 className="text-amber-800 font-black text-xs uppercase flex items-center gap-2 mb-2">
                         <ShieldAlert size={14} />
                         نصيحة للمدقق الزميل
                       </h5>
                       <p className="text-amber-700 text-xs leading-relaxed">
                         لضمان الدقة الكاملة، تأكد دائماً من أن جميع ملفات الروستر تحتوي على عمود "Comments" أو "Remarks" وأن التواريخ مكتوبة بوضوح. البرنامج يقوم بالعمل الشاق، ولكن دقة المدخلات في ملف الإكسل هي الأساس.
                       </p>
                    </div>
                  </div>
                )}

                {activeTab === 'register' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                      <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Yearly Leave Days</div>
                          <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{result.fullYearTotals.totalVacationDays}</div>
                        </div>
                        <Calendar size={32} className="text-slate-200 group-hover:text-indigo-100 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <button 
                          onClick={downloadBoardPDF}
                          className="w-full h-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl p-6 flex items-center justify-between transition-all group active:scale-95 border-b-4 border-indigo-500"
                        >
                          <div className="text-left">
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Formal Reporting</div>
                            <div className="text-xl font-black uppercase tracking-tighter">Board of Directors PDF</div>
                          </div>
                          <FilePieChart size={32} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text"
                          placeholder="Search vacation registry by English name or MRN..."
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 placeholder:text-slate-300"
                          value={vacationSearch}
                          onChange={(e) => setVacationSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="max-h-[600px] overflow-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-tighter border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-4">Month</th>
                              <th className="px-4 py-4">Name (English)</th>
                              <th className="px-4 py-4">MRN</th>
                              <th className="px-4 py-4">Start</th>
                              <th className="px-4 py-4">End</th>
                              <th className="px-4 py-4 text-center bg-indigo-50/50">Days</th>
                              <th className="px-6 py-4">Extracted From</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredVacations.map((r, idx) => (
                              <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                                <td className="px-6 py-4 font-black text-slate-500 uppercase">{r.month}</td>
                                <td className="px-4 py-4 font-black text-slate-900 uppercase tracking-tight">{r.name}</td>
                                <td className="px-4 py-4 font-mono text-slate-400 font-bold">{r.mrn}</td>
                                <td className="px-4 py-4 text-emerald-600 font-bold">{r.startDate}</td>
                                <td className="px-4 py-4 text-rose-600 font-bold">{r.endDate}</td>
                                <td className="px-4 py-4 text-center font-black bg-indigo-50/20 text-indigo-700">{r.duration}</td>
                                <td className="px-6 py-4 text-[10px] italic text-slate-400 truncate max-w-[200px]" title={r.originalComments}>
                                  {r.originalComments}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'search' && (
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text"
                          placeholder="Search Global Employee Database..."
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 placeholder:text-slate-300"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="max-h-[500px] overflow-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-tighter border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-4">Staff Name (English)</th>
                              <th className="px-4 py-4">MRN / Badge</th>
                              <th className="px-4 py-4">Job Title</th>
                              <th className="px-4 py-4">Last Month</th>
                              <th className="px-6 py-4 text-right">Last Dept</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredEmployees.map((e, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-[10px] shadow-sm uppercase">
                                      {e.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                                    </div>
                                    <span className="font-black text-slate-900 uppercase tracking-tight">{e.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 font-mono text-indigo-600 font-black">{e.mrn}</td>
                                <td className="px-4 py-4 text-slate-500 uppercase tracking-tighter text-[10px] font-black">{e.position || 'N/A'}</td>
                                <td className="px-4 py-4">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black text-slate-600 uppercase">{e.lastSeenMonth}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 italic uppercase">{e.location || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'exceptions' && (
                  <div className="space-y-4">
                    {result.exceptionReport.length === 0 ? (
                      <div className="bg-emerald-50 text-emerald-700 p-16 rounded-3xl text-center border border-emerald-100 shadow-sm">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400" />
                        <h4 className="text-xl font-black uppercase tracking-tight">Clean Audit</h4>
                        <p className="text-sm mt-1 opacity-70">No formatting issues or missing date ranges detected in roster comments.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                         <div className="px-6 py-4 bg-rose-600 flex justify-between items-center">
                          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} />
                            Comment Parsing Exceptions
                          </h3>
                          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black text-white">{result.exceptionReport.length} Events Detected</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-tighter border-b border-slate-200">
                              <tr>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-4 py-4">Name (English)</th>
                                <th className="px-4 py-4">Issue</th>
                                <th className="px-6 py-4">Original Comment Text</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {result.exceptionReport.map((ex, idx) => (
                                <tr key={idx} className="hover:bg-rose-50/50 transition-colors">
                                  <td className="px-6 py-4 font-black text-slate-400 uppercase">{ex.month}</td>
                                  <td className="px-4 py-4">
                                    <div className="font-black text-slate-900 uppercase tracking-tighter">{ex.name}</div>
                                    <div className="text-[9px] text-indigo-400 font-mono font-bold">{ex.mrn}</div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md font-black text-[9px] uppercase">{ex.problemType}</span>
                                  </td>
                                  <td className="px-6 py-4 italic text-slate-400 text-[10px] font-mono break-all">{ex.originalComments}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'year' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Actual Staff</div>
                        <div className="text-2xl font-black text-slate-900">
                          {Math.round(result.fullYearTotals.totalActualOnSite / result.monthlySummaries.length)}
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[80%]"></div>
                        </div>
                      </div>
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unique Staff</div>
                        <div className="text-2xl font-black text-emerald-500">
                          {result.masterEmployees.length}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Indexed in Global Registry</div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Health Score</div>
                        <div className="text-2xl font-black text-indigo-600">
                          {Math.max(0, 100 - Math.round((result.exceptionReport.length / result.masterEmployees.length) * 100))}%
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-2">Successful Date Extraction</div>
                      </div>
                       <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white flex flex-col justify-between border-b-4 border-emerald-500">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Vacation Days</div>
                        <div className="text-3xl font-black text-emerald-400">{result.fullYearTotals.totalVacationDays}</div>
                        <div className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Fiscal Year 2025 Accumulated</div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden text-center border-b-8 border-b-indigo-600">
                       <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Staff Members with Confirmed Leave</div>
                      <div className="text-7xl font-black text-slate-900 tracking-tighter">{result.fullYearTotals.totalConfirmedVacation}</div>
                      <p className="mt-4 text-slate-500 text-sm font-medium max-w-lg mx-auto leading-relaxed">Unique MRNs/IDs mapped to English names with valid vacation dates parsed from the comments section across all uploaded files.</p>
                    </div>
                  </div>
                )}

                <ProcessingLogs logs={result.logs} />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={12} className="text-indigo-600" />
            BOARD-LEVEL AUDIT SYSTEM • ENHANCED VACATION REPORTING ACTIVE
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
