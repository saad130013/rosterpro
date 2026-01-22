
import React from 'react';
import { ProcessingLog } from '../types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProcessingLogsProps {
  logs: ProcessingLog[];
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Info size={18} className="text-blue-500" />
          Parsing & Logic Logs
        </h3>
        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{logs.length} Events</span>
      </div>
      <div className="max-h-80 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.map((log, idx) => (
          <div key={idx} className={`p-3 rounded border-l-4 flex items-start gap-3 ${
            log.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
            log.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' :
            'bg-gray-50 border-blue-500 text-gray-700'
          }`}>
            <div className="mt-0.5">
              {log.type === 'info' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </div>
            <div>
              <div className="font-semibold text-xs opacity-70 uppercase tracking-tight">
                {log.fileName} &rsaquo; {log.sheetName}
              </div>
              <div>
                {log.message || `Detected ${log.blocksFound} blocks, extracted ${log.rowsExtracted} employee records.`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingLogs;
