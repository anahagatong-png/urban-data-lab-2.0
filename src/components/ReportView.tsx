/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeasibilityResult, ProjectParams } from "../types";
import { formatCurrency, formatArea } from "../utils";
import { TrendingUp, AlertTriangle, ShieldCheck, Landmark, DollarSign, Building } from "lucide-react";

interface ReportViewProps {
  project: ProjectParams;
  results: FeasibilityResult;
}

export default function ReportView({ project, results }: ReportViewProps) {
  // Compute chart segments for the budget breakdown
  const segments = [
    { name: "Custo do Terreno", value: project.landCost, color: "#f59e0b" },
    { name: "Construção (Obras)", value: results.buildCostGlobal, color: "#6366f1" },
    { name: "Estacionamento Subterrâneo", value: results.basementParkingCost, color: "#3b82f6" },
    { name: "Licenças & Projetos", value: results.projectFeesCost, color: "#ec4899" },
    { name: "Custos Financeiros", value: results.financingCost, color: "#10b981" },
  ];

  const totalBudget = segments.reduce((sum, s) => sum + s.value, 0);

  // SVG parameters for the beautiful responsive donut ring
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div id="report-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* 1. URBANISTIC SAFETY LIMITS TABLE & CHECKS */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800/80 shadow-xl">
          <h3 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-400" />
            Verificação de Conformidade PDM / RGEU
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-[10px] uppercase bg-slate-950 text-slate-400 font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3">Parâmetro Urbanístico</th>
                  <th scope="col" className="px-4 py-3">Limite Regulatório (PDM)</th>
                  <th scope="col" className="px-4 py-3">Estimativa do Estudo</th>
                  <th scope="col" className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                
                {/* Floor Area Ratio Check (COS) */}
                <tr className="hover:bg-slate-850/35 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>Área Bruta de Construção (ABC)</div>
                    <span className="text-[11px] font-light text-slate-500">Coeficiente de Ocupação (COS): {project.customCOS}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{formatArea(results.maxGrossArea)}</td>
                  <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">{formatArea(results.maxGrossArea)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-xl font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Conforme
                    </span>
                  </td>
                </tr>

                {/* Ground Coverage Check (CES) */}
                <tr className="hover:bg-slate-850/35 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>Área de Implantação máxima</div>
                    <span className="text-[11px] font-light text-slate-500">Coeficiente de Implantação (CES): {project.customCES}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{formatArea(project.plotArea * project.customCES)}</td>
                  <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">{formatArea(results.maxFootprint)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-xl font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Conforme
                    </span>
                  </td>
                </tr>

                {/* Natural Permeability Check */}
                <tr className="hover:bg-slate-850/35 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>Espaço Livre Permeável Mínimo</div>
                    <span className="text-[11px] font-light text-slate-500">Permeabilidade mínima exigida: {(project.customPermeability * 100).toFixed(0)}%</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{formatArea(results.requiredNaturalArea)}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">{formatArea(project.plotArea * (1 - project.customCES))}</td>
                  <td className="px-4 py-3.5 text-right">
                    {project.customCES + project.customPermeability > 1 ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-550/20 text-xs px-2.5 py-1 rounded-xl font-medium animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5" /> Crítico
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-xl font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" /> Respeitado
                      </span>
                    )}
                  </td>
                </tr>

                {/* Floors Count Check */}
                <tr className="hover:bg-slate-850/35 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>Altura da Edificação (Gabarito)</div>
                    <span className="text-[11px] font-light text-slate-500">Número máximo de pisos regulado</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{project.customMaxFloors} Pisos</td>
                  <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">{results.calculatedFloors} Pisos</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-xl font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Conforme
                    </span>
                  </td>
                </tr>

                {/* Fractions estimate */}
                <tr className="hover:bg-slate-850/35 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>Estimativa de Frações Autónomas</div>
                    <span className="text-[11px] font-light text-slate-500">Com base na área privativa média de {project.avgUnitSize}m²</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono">—</td>
                  <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">{results.estimatedFractions} Frações</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-xl font-medium">
                      Estimativa
                    </span>
                  </td>
                </tr>

                {/* Parking requirement details */}
                <tr className="hover:bg-slate-850/35 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>Lugares de Estacionamento</div>
                    <span className="text-[11px] font-light text-slate-500">Estimativa regulamentar em cave subterrânea</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono">—</td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{results.requiredParkingPlaces} lugares</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-xl font-medium">
                      Obrigatório
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. CORE FINANCIAL KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800/80 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Custo Total Previsto</span>
              <h4 className="font-display font-semibold text-xl text-slate-200 mt-1">{formatCurrency(results.totalInvestment)}</h4>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/70 flex justify-between items-center text-xs">
              <span className="text-slate-450 font-light">Custo de Venda Break-Even</span>
              <span className="font-mono font-medium text-slate-300">{formatCurrency(results.breakEvenPrice)}/m²</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800/80 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">VGV Potencial (Vendas)</span>
              <h4 className="font-display font-semibold text-xl text-indigo-400 mt-1">{formatCurrency(results.estimatedVGV)}</h4>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/70 flex justify-between items-center text-xs">
              <span className="text-slate-450 font-light">Área Útil de Venda:</span>
              <span className="font-mono font-medium text-slate-300">{formatArea(results.sellingArea)}</span>
            </div>
          </div>

          <div className="bg-emerald-950/25 rounded-3xl p-5 border border-emerald-900/40 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">Margem Líquida</span>
              <h4 className="font-display font-bold text-xl text-emerald-400 mt-1">{formatCurrency(results.netDeveloperMargin)}</h4>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-900/30 flex justify-between items-center text-xs text-emerald-350">
              <span className="flex items-center gap-0.5 font-light"><TrendingUp className="h-3.5 w-3.5" /> ROI Estimado</span>
              <span className="font-mono font-bold text-emerald-400">{results.roiPct.toFixed(1)}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. FINANCIAL CHART BUDGET BREAKDOWN & ANALYSIS CARD */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800/80 shadow-xl h-full flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-400" />
              Distribuição de Capital
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">Proporções de investimento sobre o volume total</p>
          </div>

          {/* SVG Donut Ring rendering */}
          <div className="flex justify-center mb-6">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth={strokeWidth}
                />
                
                {segments.map((segment, index) => {
                  const percentage = (segment.value / (totalBudget || 1)) * 100;
                  const strokeDashoffset = circumference - (percentage / 100) * circumference;
                  const rotation = (cumulativePercent / 100) * 360;
                  cumulativePercent += percentage;

                  return (
                    <circle
                      key={index}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        transformOrigin: "center",
                        transform: `rotate(${rotation}deg)`,
                        transition: "all 0.4s ease-out",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Center indicators for metrics cost */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono uppercase text-slate-550 tracking-wider">Custo Previsto</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                  {formatCurrency(totalBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Table index representing budget components */}
          <div className="space-y-2.5 flex-1 mt-2">
            {segments.map((segment, index) => {
              const sharePct = (segment.value / (totalBudget || 1)) * 100;
              return (
                <div key={index} className="flex items-center justify-between text-xs border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-slate-400 font-light truncate max-w-[140px]">{segment.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-200 font-medium block">{formatCurrency(segment.value)}</span>
                    <span className="text-[9px] text-slate-500 block">{sharePct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
