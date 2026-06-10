/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PORTUGAL_MUNICIPALITIES, ProjectParams, MunicipalityPreset } from "./types";
import { calculateFeasibility } from "./utils";
import CadSandbox from "./components/CadSandbox";
import ReportView from "./components/ReportView";
import AiAdvisor from "./components/AiAdvisor";
import GisIntegration from "./components/GisIntegration";
import { Building2, Save, Trash2, Sparkles, TrendingUp, HelpCircle, MapPin, Layers, Coins, ClipboardList, Globe } from "lucide-react";

export default function App() {
  // 1. Core Project Parameters States
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>("lisboa");
  const [plotArea, setPlotArea] = useState<number>(1500);
  const [landCost, setLandCost] = useState<number>(1800000);
  const [customCOS, setCustomCOS] = useState<number>(1.8);
  const [customCES, setCustomCES] = useState<number>(0.6);
  const [customPermeability, setCustomPermeability] = useState<number>(0.3);
  const [customMaxFloors, setCustomMaxFloors] = useState<number>(6);
  const [customBuildCost, setCustomBuildCost] = useState<number>(1950);
  const [customSalesPrice, setCustomSalesPrice] = useState<number>(5500);
  const [avgUnitSize, setAvgUnitSize] = useState<number>(85);
  const [efficiencyRatio, setEfficiencyRatio] = useState<number>(0.82);
  const [additionalCostsPct, setAdditionalCostsPct] = useState<number>(0.12);
  const [projectName, setProjectName] = useState<string>("Estudo de Viabilidade Alvalade");

  // Local storage studies storage
  const [savedStudies, setSavedStudies] = useState<ProjectParams[]>([]);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"visual" | "report" | "ai" | "gis">("visual");
  const [gisInjectedText, setGisInjectedText] = useState<string>("");

  // Load preset elements automatically when municipality changes
  const applyPreset = (preset: MunicipalityPreset) => {
    setCustomCOS(preset.typicalCOS);
    setCustomCES(preset.typicalCES);
    setCustomPermeability(preset.typicalPermeability);
    setCustomMaxFloors(preset.typicalMaxFloors);
    setCustomBuildCost(preset.avgBuildCost);
    setCustomSalesPrice(preset.avgSalesPrice);
  };

  useEffect(() => {
    const preset = PORTUGAL_MUNICIPALITIES.find((m) => m.id === selectedMunicipalityId);
    if (preset) {
      applyPreset(preset);
    }
  }, [selectedMunicipalityId]);

  // Load saved studies from local storage
  useEffect(() => {
    const raw = localStorage.getItem("urban_data_lab_studies");
    if (raw) {
      try {
        setSavedStudies(JSON.parse(raw));
      } catch (e) {
        console.error("Error loading saved studies:", e);
      }
    }
  }, []);

  // Pack the active parameters into an object
  const activeProject: ProjectParams = {
    id: "active_project",
    name: projectName,
    municipalityId: selectedMunicipalityId,
    customCOS,
    customCES,
    customPermeability,
    customMaxFloors,
    plotArea,
    landCost,
    customBuildCost,
    customSalesPrice,
    avgUnitSize,
    efficiencyRatio,
    additionalCostsPct,
    parkingCostPerUnit: 15000, // underground parking construction average unit cost
    financialRatePct: 8.0, // interest rate average
    dateCreated: new Date().toLocaleDateString("pt-PT"),
  };

  const currentResults = calculateFeasibility(activeProject);

  // Save the current study to compare or retrieve later
  const handleSaveStudy = () => {
    const studyToSave: ProjectParams = {
      ...activeProject,
      id: "study_" + Date.now(),
      dateCreated: new Date().toLocaleString("pt-PT"),
    };

    const updated = [studyToSave, ...savedStudies.filter((s) => s.name !== projectName)];
    setSavedStudies(updated);
    localStorage.setItem("urban_data_lab_studies", JSON.stringify(updated));
    alert(`Cenário "${projectName}" guardado com sucesso!`);
  };

  // Delete a saved study
  const handleDeleteStudy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStudies.filter((s) => s.id !== id);
    setSavedStudies(updated);
    localStorage.setItem("urban_data_lab_studies", JSON.stringify(updated));
  };

  // Load a saved study
  const handleLoadStudy = (study: ProjectParams) => {
    setProjectName(study.name);
    setSelectedMunicipalityId(study.municipalityId);
    setPlotArea(study.plotArea);
    setLandCost(study.landCost);
    setCustomCOS(study.customCOS);
    setCustomCES(study.customCES);
    setCustomPermeability(study.customPermeability);
    setCustomMaxFloors(study.customMaxFloors);
    setCustomBuildCost(study.customBuildCost);
    setCustomSalesPrice(study.customSalesPrice);
    setAvgUnitSize(study.avgUnitSize);
    setEfficiencyRatio(study.efficiencyRatio);
    setAdditionalCostsPct(study.additionalCostsPct);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col p-4 sm:p-6 overflow-x-hidden">
      
      {/* HEADER BAR */}
      <header className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500 w-2 h-8 rounded-full hidden sm:inline-block"></span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-xl text-white tracking-tight leading-none">
                Urban Data Lab <span className="text-slate-500 font-light">/ PT</span>
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                Active Analysis
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">Urban Feasibility & Geospatial Intelligence</p>
          </div>
        </div>

        {/* Quick study preset bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 pl-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-400" /> Município:
            </span>
            <select
              id="municipality-select"
              value={selectedMunicipalityId}
              onChange={(e) => setSelectedMunicipalityId(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {PORTUGAL_MUNICIPALITIES.map((mun) => (
                <option key={mun.id} value={mun.id} className="bg-slate-950 text-slate-200">
                  {mun.name} ({mun.district})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              id="study-name-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nome do estudo..."
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              id="save-study-btn"
              onClick={handleSaveStudy}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar Estudo</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONTROL PANEL INDEPENDENT SLIDERS (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-5">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="h-5 w-5 text-emerald-400" />
              <h3 className="font-display font-semibold text-slate-200 text-sm tracking-wide uppercase">
                Parâmetros do Terreno & PDM
              </h3>
            </div>

            {/* Area do Terreno & Custo */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-400">Área Bruta do Lote:</span>
                  <span className="font-mono font-bold text-emerald-400">{plotArea.toLocaleString("pt-PT")} m²</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="50000"
                  step="50"
                  value={plotArea}
                  onChange={(e) => setPlotArea(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-400">Custo do Terreno:</span>
                  <span className="font-mono font-bold text-emerald-400">{landCost.toLocaleString("pt-PT")} €</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="15000000"
                  step="50000"
                  value={landCost}
                  onChange={(e) => setLandCost(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* fine tuning PDM coefficients */}
            <div className="pt-2 border-t border-slate-800 space-y-4">
              <h4 className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                Coeficientes Urbanísticos do Lote
              </h4>

              {/* Floor Area Ratio (COS) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-400 flex items-center gap-1">
                    Índice de Ocupação (COS)
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">PDM</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-400">{customCOS.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.05"
                  value={customCOS}
                  onChange={(e) => setCustomCOS(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              {/* Footprint Coverage Ratio (CES) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-400 flex items-center gap-1">
                    Índice de Implantação (CES)
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">Lote</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-400">{customCES.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={customCES}
                  onChange={(e) => setCustomCES(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              {/* Minimum Permeability Coefficient */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-400">Permeabilidade Natural Mínima:</span>
                  <span className="font-mono font-bold text-emerald-400">{(customPermeability * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={customPermeability}
                  onChange={(e) => setCustomPermeability(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Max floors permitted */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-400">Altura Máxima Edificação:</span>
                  <span className="font-mono font-bold text-slate-200">{customMaxFloors} Pisos</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={customMaxFloors}
                  onChange={(e) => setCustomMaxFloors(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-300"
                />
              </div>
            </div>

          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Coins className="h-5 w-5 text-indigo-400" />
              <h3 className="font-display font-semibold text-slate-200 text-sm tracking-wide uppercase">
                Metodologia & Custos de Operação
              </h3>
            </div>

            {/* Construction Cost Per m2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-400">Custo de Construção:</span>
                <span className="font-mono font-bold text-slate-200">{customBuildCost.toLocaleString("pt-PT")} €/m²</span>
              </div>
              <input
                type="range"
                min="800"
                max="3500"
                step="50"
                value={customBuildCost}
                onChange={(e) => setCustomBuildCost(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Sales Price Per selling m2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-400">Preço de Venda Médio:</span>
                <span className="font-mono font-bold text-indigo-400">{customSalesPrice.toLocaleString("pt-PT")} €/m²</span>
              </div>
              <input
                type="range"
                min="1000"
                max="12000"
                step="100"
                value={customSalesPrice}
                onChange={(e) => setCustomSalesPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Core average unit space / apartment size */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Área Média</span>
                <input
                  type="number"
                  min="40"
                  max="250"
                  value={avgUnitSize}
                  onChange={(e) => setAvgUnitSize(Math.max(40, Number(e.target.value) || 40))}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 mt-1 text-center"
                />
              </div>

              <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Eficiência%</span>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={Math.round(efficiencyRatio * 100)}
                  onChange={(e) => setEfficiencyRatio((Number(e.target.value) || 80) / 100)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 mt-1 text-center"
                />
              </div>
            </div>

          </div>

          {/* MEUS CENÁRIOS LIST */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-4">
            <h4 className="font-display font-semibold text-slate-200 text-xs tracking-wider uppercase flex items-center justify-between">
              <span>Meus Estudos ({savedStudies.length})</span>
            </h4>
            
            {savedStudies.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum estudo guardado ainda nesta máquina.</p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {savedStudies.map((study) => (
                  <div
                    key={study.id}
                    onClick={() => handleLoadStudy(study)}
                    className="flex items-center justify-between text-xs p-3 bg-slate-950/45 hover:bg-slate-800/60 rounded-2xl border border-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-200 block truncate">{study.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{study.dateCreated}</span>
                    </div>
                    <button
                      id={`delete-study-${study.id}`}
                      onClick={(e) => handleDeleteStudy(study.id, e)}
                      className="p-1 px-2 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: NAVIGATION INTERACTIVE VIEWER (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dashboard Tab Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
              
              <button
                id="tab-visual-btn"
                onClick={() => setActiveTab("visual")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "visual"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Simulador Volumétrico</span>
              </button>

              <button
                id="tab-report-btn"
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "report"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Viabilidade & Finanças</span>
              </button>

              <button
                id="tab-ai-btn"
                onClick={() => {
                  setActiveTab("ai");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Parecer AI (Perito)</span>
              </button>

              <button
                id="tab-gis-btn"
                onClick={() => {
                  setActiveTab("gis");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "gis"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-indigo-400" />
                <span>Geoportal & GIS</span>
              </button>

            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Estudo Ativo: {projectName}</span>
            </div>
          </div>

          {/* TAB RENDERINGS */}
          <div className="min-h-[480px]">
            {activeTab === "visual" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Visual Sandbox left pane for full metrics */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-5 h-full flex flex-col justify-between text-slate-200">
                    <div>
                      <h4 className="font-display font-semibold text-white text-base tracking-wide uppercase">
                        Aproveitamento do Lote
                      </h4>
                      <p className="text-xs text-slate-450 mb-4 font-light">Dimensões ideais de implantação</p>
                    </div>

                    <div className="space-y-4 flex-1">
                      
                      {/* Built Footprint */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Implantação do Edifício</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-emerald-400 italic font-display tracking-tight">
                            {currentResults.maxFootprint.toFixed(0)} m²
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Limite PDM: {(plotArea * customCES).toFixed(0)}m²
                          </span>
                        </div>
                      </div>

                      {/* Built Gross Construction Space */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Área Bruta de Construção</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-indigo-400 italic font-display tracking-tight">
                            {currentResults.maxGrossArea.toFixed(0)} m²
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Vol: {currentResults.buildingVolume.toFixed(0)} m³
                          </span>
                        </div>
                      </div>

                      {/* Green Permeable natural footprint */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Solo Natural Permeável</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-emerald-400 italic font-display tracking-tight">
                            {(plotArea * (1 - customCES)).toFixed(0)} m²
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Mínimo: {currentResults.requiredNaturalArea.toFixed(0)} m²
                          </span>
                        </div>
                      </div>

                      {/* Slabs breakdown details */}
                      <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Fração Média</span>
                          <span className="font-mono font-medium text-slate-300">{avgUnitSize} m²</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Eficiência Geral</span>
                          <span className="font-mono font-medium text-indigo-400">{(efficiencyRatio * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl text-xs leading-relaxed text-slate-400 font-light">
                      <strong className="text-slate-200">Parecer de Arquiteto:</strong> Os índices aplicados correspondem ao PDM preliminar.
                      O Simplex Urbanístico (DL 10/2024) permite a isenção de licenciamento sob parecer de conformidade do termo de responsabilidade do projetista.
                    </div>
                  </div>
                </div>

                {/* 2D/3D Sandbox Viewer Panel (md:col-span-7) */}
                <div className="md:col-span-7">
                  <CadSandbox
                    plotArea={plotArea}
                    ces={customCES}
                    maxFloors={customMaxFloors}
                    calculatedFloors={currentResults.calculatedFloors}
                    permeability={customPermeability}
                  />
                </div>

              </div>
            )}

            {activeTab === "report" && (
              <ReportView project={activeProject} results={currentResults} />
            )}

            {activeTab === "ai" && (
              <AiAdvisor project={activeProject} results={currentResults} preloadedGisText={gisInjectedText} />
            )}

            {activeTab === "gis" && (
              <GisIntegration 
                project={activeProject} 
                onInjectGisData={(gisText) => setGisInjectedText(gisText)}
                activeTabToAi={() => setActiveTab("ai")}
              />
            )}
          </div>

        </div>

      </main>

      {/* FOOTER METRICS SUMMARY BAR */}
      <footer className="mt-8 bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-[10.5px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-[9.5px]">URBAN DATA LAB • MOTOR DE CÁLCULO ATIVO (PDM/RGEU SEGURO)</span>
          </div>
          <div className="flex gap-4 font-mono">
            <span>ROI ESTIMADO: <strong className="text-emerald-400 font-bold">{currentResults.roiPct.toFixed(1)}%</strong></span>
            <span>VGV TOTAL: <strong className="text-indigo-400 font-semibold">{currentResults.estimatedVGV.toLocaleString("pt-PT")} €</strong></span>
            <span>ESTACIONAMENTO: <strong className="text-slate-200 font-semibold">{currentResults.requiredParkingPlaces} lugares</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
