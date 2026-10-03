import React, { useState } from 'react';
import { MonitoringSite, CityInfo, ExecutiveReport } from '../../types';
import { generateSiteReport, generateCityReport, exportToCsv } from '../../lib/reports/reportGenerator';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';
import { FileText, Download, Printer, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportsViewProps {
  sites: MonitoringSite[];
  cities: CityInfo[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sites, cities }) => {
  const [reportType, setReportType] = useState<'site' | 'city'>('site');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [selectedCityId, setSelectedCityId] = useState<string>(cities[0]?.id || '');
  const [dateRange, setDateRange] = useState<string>('Last 90 Days');

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const selectedCity = cities.find((c) => c.id === selectedCityId) || cities[0];

  const report: ExecutiveReport =
    reportType === 'site'
      ? generateSiteReport(selectedSite, dateRange)
      : generateCityReport(selectedCity, sites, dateRange);

  const handleExportCsv = () => {
    if (reportType === 'site') {
      const rows = [
        {
          Report: report.title,
          Target: report.targetName,
          DateRange: report.dateRange,
          CompositeScore: report.overallScore,
          Status: report.status,
          Confidence: report.confidence,
          Completeness: `${report.dataCompleteness}%`,
        },
        ...report.indicators.map((ind) => ({
          Report: report.title,
          Target: report.targetName,
          DateRange: report.dateRange,
          Indicator: ind.name,
          Score: ind.score,
          Trend: ind.trend,
        })),
      ];
      exportToCsv(`AquaLens-SiteReport-${selectedSite.code}.csv`, rows);
    } else {
      const citySites = sites.filter((s) => s.city.toLowerCase() === selectedCity.name.toLowerCase());
      const rows = citySites.map((s) => ({
        City: s.city,
        SiteCode: s.code,
        SiteName: s.name,
        Stream: s.streamName,
        CompositeScore: s.scores.composite,
        Status: s.status,
        Confidence: s.confidence,
        WaterQuality: s.scores.waterQuality,
        Biodiversity: s.scores.biodiversity,
        Habitat: s.scores.habitat,
        CitizenSignal: s.scores.citizenSignal,
        DataCompleteness: `${s.completeness.overall}%`,
      }));
      exportToCsv(`AquaLens-CatchmentReport-${selectedCity.name}.csv`, rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Stream Health Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate research-grade stream catchment summaries for environmental authorities and researchers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV Data</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Controls (Hidden in Print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs print:hidden">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Report Scope:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setReportType('site')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                reportType === 'site' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Reach-Specific Report
            </button>
            <button
              onClick={() => setReportType('city')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                reportType === 'city' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Municipal Catchment Overview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          {reportType === 'site' ? (
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Select Monitoring Reach</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800 outline-hidden"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.city}: {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Select Pilot City</label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800 outline-hidden"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country} ({c.streamCount} streams, {c.siteCount} reaches)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-500 mb-1 font-medium">Time Window Baseline</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800 outline-hidden"
            >
              <option value="Last 30 Days">Last 30 Days (Short-term)</option>
              <option value="Last 90 Days">Last 90 Days (Quarterly Baseline)</option>
              <option value="Last 1 Year">Last 12 Months (Annual Cycle)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-mono text-teal-700 uppercase tracking-wider font-semibold">
              AquaLens Environmental Intelligence · Ecosystem Health Report
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{report.title}</h2>
            <div className="text-xs text-slate-500 mt-1">
              Assessment Target: <strong className="text-slate-700">{report.targetName}</strong> · Window:{' '}
              {report.dateRange}
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-mono text-slate-400">Generated: {report.generatedAt}</div>
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <HealthBadge status={report.status} score={report.overallScore} />
              <ConfidenceBadge level={report.confidence} />
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Data Coverage: {report.dataCompleteness}%
            </div>
          </div>
        </div>

        {/* Section 1: Executive Key Changes */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Key Environmental Changes & Shifts
          </h3>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs leading-relaxed text-slate-700">
            {report.keyChanges.map((change, idx) => (
              <p key={idx}>{change}</p>
            ))}
          </div>
        </div>

        {/* Section 2: Indicator Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Core Health Indicator Matrix
          </h3>
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
              <tr>
                <th className="p-3">Indicator Component</th>
                <th className="p-3 font-mono text-right">Score (0–100)</th>
                <th className="p-3 text-right">Period Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.indicators.map((ind, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{ind.name}</td>
                  <td className="p-3 font-mono font-bold text-right tabular-nums text-slate-900">
                    {ind.score !== null ? ind.score : 'N/A'}
                  </td>
                  <td className="p-3 font-mono text-right text-slate-600">{ind.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Flagged Factors */}
        {report.flaggedFactors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-rose-700">
              3. Contributing Stressors & Flagged Observations
            </h3>
            <ul className="space-y-2 text-xs">
              {report.flaggedFactors.map((f, i) => (
                <li key={i} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 4: One Health Context */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            4. One Health Synthesis
          </h3>
          <p className="text-xs leading-relaxed text-slate-700 bg-teal-50/50 p-4 rounded-lg border border-teal-200/80">
            {report.oneHealthSummary}
          </p>
        </div>

        {/* Section 5: Recommended Surveillance Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            5. Actionable Follow-Up Recommendations
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
            {report.actionableRecommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Section 6: Limitations & Data Disclosure */}
        <div className="pt-6 border-t border-slate-200 space-y-3 text-[11px] text-slate-500">
          <div className="font-semibold text-slate-700 uppercase tracking-wider">
            6. Scientific Limitations & Data Attributions
          </div>
          <ul className="space-y-1 list-disc list-inside">
            {report.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 italic">
            {report.syntheticDataDisclosure}
          </div>
        </div>
      </div>
    </div>
  );
};
