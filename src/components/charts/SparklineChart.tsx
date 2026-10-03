import React, { useState } from 'react';
import { TimeSeriesPoint } from '../../types';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  metricKey?: 'compositeScore' | 'waterQuality' | 'biodiversity' | 'habitat' | 'citizenSignal';
  height?: number;
  showAxes?: boolean;
  color?: string;
  metricLabel?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metricKey = 'compositeScore',
  height = 180,
  showAxes = true,
  color = '#0d9488', // teal-600
  metricLabel = 'Health Score',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs"
      >
        No historical telemetry available for this period.
      </div>
    );
  }

  const validPoints = data.map((d, index) => ({
    date: d.date,
    val: d[metricKey] !== null && d[metricKey] !== undefined ? Number(d[metricKey]) : null,
    raw: d,
    index,
  }));

  const numericPoints = validPoints.filter((p) => p.val !== null) as {
    date: string;
    val: number;
    raw: TimeSeriesPoint;
    index: number;
  }[];

  if (numericPoints.length < 2) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs"
      >
        Insufficient historical sampling points.
      </div>
    );
  }

  // Padding
  const padLeft = showAxes ? 40 : 10;
  const padRight = 15;
  const padTop = 15;
  const padBottom = showAxes ? 25 : 10;

  const width = 600;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const minVal = 0;
  const maxVal = 100;

  const getX = (idx: number) => padLeft + (idx / (validPoints.length - 1)) * plotWidth;
  const getY = (val: number) => padTop + (1 - (val - minVal) / (maxVal - minVal)) * plotHeight;

  // Generate SVG path for line
  let pathD = '';
  numericPoints.forEach((p, i) => {
    const x = getX(p.index);
    const y = getY(p.val);
    if (i === 0) pathD += `M ${x} ${y}`;
    else pathD += ` L ${x} ${y}`;
  });

  // Area under curve
  const firstX = getX(numericPoints[0].index);
  const lastX = getX(numericPoints[numericPoints.length - 1].index);
  const baselineY = getY(0);
  const areaD = `${pathD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

  const hoveredPoint = hoverIndex !== null ? validPoints[hoverIndex] : null;

  return (
    <div className="relative w-full select-none" onMouseLeave={() => setHoverIndex(null)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showAxes && (
          <g className="stroke-slate-100" strokeWidth="1">
            {[20, 40, 60, 80, 100].map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line x1={padLeft} y1={y} x2={width - padRight} y2={y} strokeDasharray="3 3" />
                  <text
                    x={padLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#grad-${metricKey})`} />

        {/* Line Curve */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {numericPoints.map((p) => {
          const cx = getX(p.index);
          const cy = getY(p.val);
          const isHovered = hoverIndex === p.index;
          return (
            <circle
              key={p.index}
              cx={cx}
              cy={cy}
              r={isHovered ? 4.5 : 2.5}
              fill="#ffffff"
              stroke={color}
              strokeWidth={isHovered ? 2.5 : 1.5}
              className="transition-all duration-100"
            />
          );
        })}

        {/* Date labels on X-axis */}
        {showAxes && (
          <g className="fill-slate-400 text-[10px] font-mono">
            {validPoints
              .filter((_, idx) => idx % Math.ceil(validPoints.length / 5) === 0 || idx === validPoints.length - 1)
              .map((p) => {
                const x = getX(p.index);
                return (
                  <text key={p.index} x={x} y={height - 6} textAnchor="middle">
                    {p.date.slice(5)}
                  </text>
                );
              })}
          </g>
        )}

        {/* Interactive Hover crosshair and hit areas */}
        {validPoints.map((p) => {
          const x = getX(p.index);
          const segWidth = plotWidth / (validPoints.length - 1);
          return (
            <rect
              key={`hit-${p.index}`}
              x={x - segWidth / 2}
              y={padTop}
              width={segWidth}
              height={plotHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(p.index)}
            />
          );
        })}

        {hoveredPoint && hoveredPoint.val !== null && (
          <g>
            <line
              x1={getX(hoveredPoint.index)}
              y1={padTop}
              x2={getX(hoveredPoint.index)}
              y2={padTop + plotHeight}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </g>
        )}
      </svg>

      {/* Floating tooltip */}
      {hoveredPoint && hoveredPoint.val !== null && (
        <div
          className="absolute z-10 -top-2 transform -translate-y-full px-2.5 py-1.5 bg-slate-900 text-white rounded text-xs shadow-md pointer-events-none transition-all duration-75"
          style={{
            left: `${(getX(hoveredPoint.index) / width) * 100}%`,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <div className="font-mono text-[10px] text-slate-400">{hoveredPoint.date}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-300">{metricLabel}:</span>
            <span className="font-mono font-bold text-teal-300">{hoveredPoint.val}</span>
            <span className="text-slate-400 font-mono text-[10px]">/ 100</span>
          </div>
          {hoveredPoint.raw.dissolvedOxygenMgL && (
            <div className="text-[10px] text-slate-300 font-mono mt-0.5">
              DO: {hoveredPoint.raw.dissolvedOxygenMgL} mg/L · Turb: {hoveredPoint.raw.turbidityNTU} NTU
            </div>
          )}
        </div>
      )}
    </div>
  );
};
