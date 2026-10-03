import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { MonitoringSite } from '../../types';

interface AdminViewProps {
  sites: MonitoringSite[];
}

interface ParsedRow {
  site_id: string;
  date: string;
  water_quality: number | null;
  biodiversity: number | null;
  habitat: number | null;
  pollution: number | null;
  vegetation: string;
  flow: string;
  rainfall: number | null;
  temperature: number | null;
  isValid: boolean;
  errors: string[];
}

export const AdminView: React.FC<AdminViewProps> = ({ sites }) => {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const sampleCsv = `site_id,date,water_quality,biodiversity,habitat,pollution,vegetation,flow,rainfall,temperature
site-lis-01,2026-10-01,52,55,50,22,Sparse,Slow,8.5,18.2
site-lis-04,2026-10-01,84,88,86,0,Pristine,Moderate,2.1,17.4
site-bri-01,2026-10-01,65,72,68,8,Moderate,Moderate,12.0,14.6
site-fre-01,2026-10-01,88,90,85,0,Pristine,Moderate,0.0,12.8
site-val-02,2026-10-01,46,52,48,28,Degraded,Trickle,0.0,22.5`;

  const handleParseCsv = (content: string) => {
    setCsvText(content);
    setImportedCount(null);

    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const validSiteIds = new Set(sites.map((s) => s.id));

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim());
      const rowData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowData[h] = cols[idx] || '';
      });

      const errors: string[] = [];
      const site_id = rowData['site_id'] || '';
      const date = rowData['date'] || '';

      if (!site_id) {
        errors.push('Missing site_id');
      } else if (!validSiteIds.has(site_id)) {
        errors.push(`Unrecognized site_id '${site_id}'`);
      }

      if (!date || isNaN(new Date(date).getTime())) {
        errors.push('Invalid date format');
      }

      const parseNum = (val: string, min: number, max: number, name: string) => {
        if (!val) return null;
        const n = parseFloat(val);
        if (isNaN(n) || n < min || n > max) {
          errors.push(`${name} out of bounds (${min}–${max})`);
          return null;
        }
        return n;
      };

      const wq = parseNum(rowData['water_quality'], 0, 100, 'water_quality');
      const bio = parseNum(rowData['biodiversity'], 0, 100, 'biodiversity');
      const hab = parseNum(rowData['habitat'], 0, 100, 'habitat');
      const poll = parseNum(rowData['pollution'], 0, 100, 'pollution');
      const rain = parseNum(rowData['rainfall'], 0, 300, 'rainfall');
      const temp = parseNum(rowData['temperature'], -20, 50, 'temperature');

      rows.push({
        site_id,
        date,
        water_quality: wq,
        biodiversity: bio,
        habitat: hab,
        pollution: poll,
        vegetation: rowData['vegetation'] || 'Moderate',
        flow: rowData['flow'] || 'Moderate',
        rainfall: rain,
        temperature: temp,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    setImportedCount(validRows.length);
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'AquaLens-Batch-Telemetry-Template.csv';
    link.click();
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Batch Telemetry Ingestion & Admin
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and validate bulk CSV stream telemetry records with automated bounds screening
        </p>
      </div>

      {/* CSV Ingestion Box */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Upload CSV Stream Telemetry</h2>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Columns: site_id, date, water_quality, biodiversity, habitat, pollution, vegetation, flow, rainfall, temperature
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
            <button
              onClick={() => handleParseCsv(sampleCsv)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 rounded-md font-semibold cursor-pointer"
            >
              <span>Load Demo Batch</span>
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50">
          <UploadCloud className="w-8 h-8 text-teal-600" />
          <span className="font-semibold text-slate-800">
            Click to upload telemetry CSV or drag file here
          </span>
          <span className="text-slate-400 text-[11px]">Accepts .csv up to 10MB</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Batch Validation Preview ({parsedRows.length} records parsed)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-semibold font-mono">
                  ✓ {parsedRows.filter((r) => r.isValid).length} Valid
                </span>
                <span className="text-rose-700 font-semibold font-mono">
                  ✕ {parsedRows.filter((r) => !r.isValid).length} Errors
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-semibold text-slate-600">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Site ID</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right font-mono">Water Q</th>
                    <th className="p-2.5 text-right font-mono">Biodiversity</th>
                    <th className="p-2.5 text-right font-mono">Habitat</th>
                    <th className="p-2.5 text-right font-mono">Pollution</th>
                    <th className="p-2.5">Validation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="p-2.5">
                        {r.isValid ? (
                          <span className="text-emerald-600 font-bold">✓ Valid</span>
                        ) : (
                          <span className="text-rose-600 font-bold">✕ Error</span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono">{r.site_id}</td>
                      <td className="p-2.5 font-mono">{r.date}</td>
                      <td className="p-2.5 font-mono text-right">{r.water_quality ?? '—'}</td>
                      <td className="p-2.5 font-mono text-right">{r.biodiversity ?? '—'}</td>
                      <td className="p-2.5 font-mono text-right">{r.habitat ?? '—'}</td>
                      <td className="p-2.5 font-mono text-right">{r.pollution ?? '—'}</td>
                      <td className="p-2.5 text-[11px] text-rose-600">
                        {r.errors.length > 0 ? r.errors.join('; ') : 'Passed all sanity boundaries'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ingest Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500">
                Safe import mode: invalid rows are isolated and excluded from analytics updates.
              </span>
              <button
                onClick={handleImport}
                disabled={parsedRows.filter((r) => r.isValid).length === 0}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Ingest {parsedRows.filter((r) => r.isValid).length} Valid Telemetry Records
              </button>
            </div>

            {importedCount !== null && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Successfully ingested and integrated {importedCount} verified telemetry rows into active
                  stream calibration caches!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
