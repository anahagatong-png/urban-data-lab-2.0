/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Cpu, 
  Globe, 
  Layers, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Code, 
  Eye, 
  Sliders, 
  Activity, 
  Database,
  Award,
  Zap,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { ProjectParams } from "../types";

interface GeoBenchXTask {
  id: string;
  category: "spectral_indices" | "change_detection" | "terrain_elevation" | "land_cover_vqa";
  categoryLabel: string;
  title: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  question: string;
  expectedClass: string;
  groundTruthRegex: RegExp;
  satelliteMetadata: {
    satellite: string;
    resolution: string;
    cloudCoverPct: number;
    bands: Record<string, number>; // simulated reflectance values or indices
    timestamp: string;
  };
}

interface GeoBenchXProps {
  project: ProjectParams;
}

export default function GeoBenchX({ project }: GeoBenchXProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("spectral_indices");
  const [activeTaskId, setActiveTaskId] = useState<string>("ndvi_calc");
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [runningSingleId, setRunningSingleId] = useState<string | null>(null);

  // Spectral band sliders for interactive simulator
  const [bandRed, setBandRed] = useState<number>(0.12);
  const [bandNIR, setBandNIR] = useState<number>(0.54);
  const [bandSWIR, setBandSWIR] = useState<number>(0.21);
  const [bandGreen, setBandGreen] = useState<number>(0.15);
  
  // Spectral rendering mode
  const [renderingPreset, setRenderingPreset] = useState<"natural" | "false_veg" | "infra_water">("false_veg");

  // Benchmark results storage
  const [benchResults, setBenchResults] = useState<Record<string, {
    analyzedClass: string;
    confidencePct: number;
    spectralReview: string;
    justification: string;
    suggestedWorkflow: string;
    isCorrect: boolean;
    loading: boolean;
  }>>({});

  // Core dataset from the solirinai/geobenchx benchmark
  const geoBenchXTasks: GeoBenchXTask[] = [
    {
      id: "ndvi_calc",
      category: "spectral_indices",
      categoryLabel: "Índices Espectrais e Biofísica",
      title: "Análise de Vitalidade de Charco e Cultivo de Regadio",
      difficulty: "Fácil",
      question: `Tem um sensor satélite Sentinel-2 focado numa área agrícola em Alentejo/Portugal. A refletância registada no Lote é: Banda 4 (Vermelha - Red) = 0.08 e Banda 8 (Infravermelho Próximo - NIR) = 0.65.
Com base no cálculo exato do Normalized Difference Vegetation Index (NDVI), determine se o alvo geográfico corresponde a:
A) Solo Exposto/Área Urbana Estéril (NDVI < 0.2)
B) Vegetação Moderadamente Saudável / Cultivo de canseira (NDVI entre 0.3 e 0.5)
C) Vegetação Densa / Floresta de Eucalipto Saudável (NDVI > 0.7)
Indique a fórmula matemática e a classificação física do alvo.`,
      expectedClass: "C) Vegetação Densa / Floresta de Eucalipto Saudável (NDVI > 0.7)",
      groundTruthRegex: /(vegetação densa|floresta|saudável|0\.78|c)/i,
      satelliteMetadata: {
        satellite: "Sentinel-2B",
        resolution: "10 metros",
        cloudCoverPct: 1.5,
        bands: { "B4 (Red)": 0.08, "B8 (NIR)": 0.65, "B3 (Green)": 0.12, "B11 (SWIR)": 0.14 },
        timestamp: "2026-05-18T11:21:04Z"
      }
    },
    {
      id: "index_water",
      category: "spectral_indices",
      categoryLabel: "Índices Espectrais e Biofísica",
      title: "Mapeamento Térmico/Hídrico de Linha de Água (NDWI)",
      difficulty: "Médio",
      question: `O NDWI (Normalized Difference Water Index) é calculado utilizando a Banda do Verde (B3) e a Banda do Infravermelho Próximo (B8) ou SWIR (B11).
Assuma os metadados onde Verde = 0.35 e NIR = 0.10. Calcule o NDWI com a fórmula (Green - NIR) / (Green + NIR).
A) Qual é o valor matemático aproximado do NDWI?
B) Este valor positivo elevado confirma a presença de um Espelho de Água Contínuo (ex: Albufeira/Rio) ou de Vegetação de Sequeiro com Elevado Stress Hídrico?`,
      expectedClass: "A) NDWI ≈ 0.55. B) Espelho de Água Contínuo",
      groundTruthRegex: /(espelho de água|0\.55|água contínua)/i,
      satelliteMetadata: {
        satellite: "Sentinel-2A",
        resolution: "10 metros",
        cloudCoverPct: 0.0,
        bands: { "B3 (Green)": 0.35, "B8 (NIR)": 0.10, "B11 (SWIR)": 0.05, "B4 (Red)": 0.08 },
        timestamp: "2026-06-02T11:25:12Z"
      }
    },
    {
      id: "fire_burn",
      category: "change_detection",
      categoryLabel: "Deteção de Alterações Temporais",
      title: "Mapeamento de Cicatrizes de Incêndios e NBR",
      difficulty: "Difícil",
      question: `No centro de Portugal (concelho de Pedrógão Grande), analisam-se imagens Landsat-9 pré e pós-evento de fogo usando o índice NBR (Normalized Burn Ratio) obtido por (NIR - SWIR) / (NIR + SWIR).
Os valores pós-fogo dão NIR (B5) = 0.15 e SWIR-2 (B7) = 0.50.
A diferença do índice delta NBR (dNBR = NBR_pre - NBR_pos) resultou em 0.62.
De acordo com as tabelas recomendadas pelo USGS para severidade de queimada, esta área sofreu um dano de severidade:
A) Baixa severidade ou regeneração moderada (< 0.1)
B) Severidade Alta a Muito Alta (> 0.5)
Determine a classe de severidade de incêndio compatível com este desvio espectral brutal.`,
      expectedClass: "B) Severidade Alta a Muito Alta (> 0.5)",
      groundTruthRegex: /(severidade alta|muito alta|b)/i,
      satelliteMetadata: {
        satellite: "Landsat-9 OLI-2",
        resolution: "30 metros",
        cloudCoverPct: 4.8,
        bands: { "B5 (NIR)": 0.15, "B7 (SWIR)": 0.50, "B4 (Red)": 0.25, "NBR Pre-fogo": 0.45 },
        timestamp: "2026-08-11T10:48:33Z"
      }
    },
    {
      id: "terrain_slope",
      category: "terrain_elevation",
      categoryLabel: "Modelos Digitais de Elevação",
      title: "Análise de Declive de Encosta e Risco de Erosão",
      difficulty: "Médio",
      question: `Utilizando o Modelo Digital de Elevação ALOS PALSAR com resolução espacial de 12.5 metros, mediu-se duas células horizontais adjacentes distantes de 12.5 metros no terreno.
A altitude registada na Célula A é de 145 metros, e na Célula B é de 152 metros.
Calcule:
1) A inclinação aproximada da encosta em percentagem (%) (Desnível / Distância Horizontal).
2) Se esta encosta observa o limite máximo regulamentar de declive do RGEU para vias ordinárias pedonais de acesso público (que não devem exceder 6-8% sustentados).`,
      expectedClass: "1) Declive = 56% (Encosta extremamente íngreme). 2) Não cumpre o critério pedonal do RGEU.",
      groundTruthRegex: /(56%|não cumpre|excede|íngreme)/i,
      satelliteMetadata: {
        satellite: "ALOS PALSAR DEM",
        resolution: "12.5 metros",
        cloudCoverPct: 0.0,
        bands: { "Célula A (Elev)": 145, "Célula B (Elev)": 152, "Passo Horizontal": 12.5 },
        timestamp: "2024-03-10T00:00:00Z"
      }
    },
    {
      id: "sprawl_vqa",
      category: "land_cover_vqa",
      categoryLabel: "Classificação Multimodal VQA",
      title: "Consolidação de Espaço Urbano e Impermeabilidade",
      difficulty: "Difícil",
      question: `Com base em dados multispectrais integrados Copernicus Global Land Cover, observa-se uma quadrícula periurbana densa em Coimbra. O rácio de brilho pancromático, aliado a assinatura espectral de infravermelho de ondas curtas (SWIR), deteta uma taxa de pixel com impermeabilização superior a 75%.
A classificação regulamentar de uso de solo correspondente para efeitos de gestão territorial no PDM é:
A) Área Florestal de Salvaguarda Ecológica e Silvicultura
B) Espaço Urbano Consolidado de Alta Densidade / Área Industrial Estacionária
Indique se o pixel retrata solo natural de infiltração hídrica ou malha urbana contínua.`,
      expectedClass: "B) Espaço Urbano Consolidado de Alta Densidade",
      groundTruthRegex: /(espaço urbano|urbano consolidado|malha urbana|b)/i,
      satelliteMetadata: {
        satellite: "Copernicus Land",
        resolution: "100 metros",
        cloudCoverPct: 0.2,
        bands: { "SWIR Reflectance": 0.38, "Impermeability Pct": 0.78, "Green Reflectance": 0.12 },
        timestamp: "2025-10-09T11:02:11Z"
      }
    }
  ];

  // Filters tasks based on selected category and returns list
  const activeTasks = geoBenchXTasks.filter(t => t.category === activeCategoryId);
  const currentTask = geoBenchXTasks.find(t => t.id === activeTaskId) || activeTasks[0] || geoBenchXTasks[0];

  // Sync sliders to simulated active task bands for quick preview
  React.useEffect(() => {
    if (currentTask.satelliteMetadata.bands) {
      const b = currentTask.satelliteMetadata.bands;
      if (b["B4 (Red)"] !== undefined) setBandRed(b["B4 (Red)"]);
      if (b["B8 (NIR)"] !== undefined) setBandNIR(b["B8 (NIR)"]);
      if (b["B11 (SWIR)"] !== undefined) setBandSWIR(b["B11 (SWIR)"]);
      if (b["B3 (Green)"] !== undefined) setBandGreen(b["B3 (Green)"]);
    }
  }, [activeTaskId]);

  const handleRunSingle = async (task: GeoBenchXTask) => {
    setRunningSingleId(task.id);
    setBenchResults(prev => ({
      ...prev,
      [task.id]: {
        analyzedClass: "",
        confidencePct: 0,
        spectralReview: "",
        justification: "",
        suggestedWorkflow: "",
        isCorrect: false,
        loading: true
      }
    }));

    try {
      const resp = await fetch("/api/gemini/geo-bench-x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          category: task.categoryLabel,
          question: task.question,
          satelliteMetadata: task.satelliteMetadata
        })
      });

      if (!resp.ok) throw new Error("Falha ao comunicar com o avaliador remoto GeoBenchX.");

      const data = await resp.json();
      
      // Perform Ground Truth validation regex match on answer & reasoning
      const isOk = task.groundTruthRegex.test(data.analyzedClass) || 
                   task.groundTruthRegex.test(data.justification) ||
                   task.groundTruthRegex.test(data.spectralReview);

      setBenchResults(prev => ({
        ...prev,
        [task.id]: {
          analyzedClass: data.analyzedClass || "Desconhecido",
          confidencePct: Number(data.confidencePct) || 85,
          spectralReview: data.spectralReview || "Sem revisão de bandas",
          justification: data.justification || "Sem fundamentação",
          suggestedWorkflow: data.suggestedWorkflow || "Sem pipeline disponível",
          isCorrect: isOk,
          loading: false
        }
      }));

    } catch (e: any) {
      console.error(e);
      setBenchResults(prev => ({
        ...prev,
        [task.id]: {
          analyzedClass: "Erro de Conexão",
          confidencePct: 0,
          spectralReview: "Houve um problema de processamento: " + e.message,
          justification: "N/A",
          suggestedWorkflow: "N/A",
          isCorrect: false,
          loading: false
        }
      }));
    } finally {
      setRunningSingleId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    for (const task of geoBenchXTasks) {
      await handleRunSingle(task);
    }
    setIsRunningAll(false);
  };

  // Scorecard variables
  const processedKeys = Object.keys(benchResults).filter(k => !benchResults[k].loading);
  const correctCount = processedKeys.filter(k => benchResults[k].isCorrect).length;
  const scorePct = processedKeys.length > 0 ? Math.round((correctCount / processedKeys.length) * 100) : 0;

  // Compute calculated interactive indices based on sliders
  const interactiveNDVI = ((bandNIR - bandRed) / (bandNIR + bandRed || 0.001)).toFixed(3);
  const interactiveNDWI = ((bandGreen - bandNIR) / (bandGreen + bandNIR || 0.001)).toFixed(3);

  // Return simulated color grid styling based on presets and active slider values
  const getSimulatedTileColor = () => {
    if (renderingPreset === "natural") {
      // Scale sliders to standard RGB colors (Red, Green, Red as proxy etc.)
      const r = Math.min(255, Math.max(0, Math.round(bandRed * 1000)));
      const g = Math.min(255, Math.max(0, Math.round(bandGreen * 1000)));
      const b = 60; // Blue constant
      return `rgb(${r}, ${g}, ${b})`;
    } else if (renderingPreset === "false_veg") {
      // Vegetation shows up as red/crimson in NIR false-color composite (NIR -> Red band)
      const r = Math.min(255, Math.max(0, Math.round(bandNIR * 400)));
      const g = Math.min(255, Math.max(0, Math.round(bandRed * 300)));
      const b = Math.min(255, Math.max(0, Math.round(bandGreen * 200)));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // SWIR infrawater mode: water shows dark green/deep dark blue, vegetation blue, soil orange
      const r = Math.min(255, Math.max(0, Math.round(bandSWIR * 300)));
      const g = Math.min(255, Math.max(0, Math.round(bandNIR * 350)));
      const b = Math.min(255, Math.max(0, Math.round(bandRed * 500)));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const categories = [
    { id: "spectral_indices", label: "Índices Espectrais" },
    { id: "change_detection", label: "Deteção Alterações" },
    { id: "terrain_elevation", label: "Modelos Relevo" },
    { id: "land_cover_vqa", label: "Multimodal VQA" }
  ];

  return (
    <div id="geobenchx-workspace-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-200 mt-2 font-sans">
      
      {/* 1. DATASET FILTERS & INTERACTIVE BAND SLIDER PREVIEW - Left (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* GeoBenchX Education & Card Banner */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-550/15 text-emerald-400 rounded-2xl border border-emerald-500/10">
              <Cpu className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono tracking-wider uppercase text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Repo: solirinai / geobenchx
                </span>
                <span className="text-[10px] bg-slate-950 px-1 py-0.5 rounded font-mono text-indigo-400 border border-slate-850">v1.4</span>
              </div>
              <h3 className="font-display font-semibold text-sm text-slate-100 tracking-wide mt-1">GeoBenchX Multi-Modal EO Explorer</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-light mt-3 leading-relaxed">
            Repositório científico para benchmark de inteligência e sensoriamento remoto de alta fidelidade em alvos terrestres. Mede a proficiência em VQA de satélites e cálculo de índices biofísicos.
          </p>
        </div>

        {/* Interactive Satellite Spectral Band Simulator */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-250">
                Simulador Espectral Sentinel-2
              </h4>
            </div>
            <div className="text-[9px] bg-slate-950 border border-slate-850 p-1 px-2 rounded-lg text-emerald-400 font-mono">
              Banda Ativa: Lote {project.name}
            </div>
          </div>

          {/* Interactive virtual multispectral spatial preview tile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
            {/* Left quadrant: visual fake satellite render */}
            <div className="space-y-2 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Renderizador de Falsa Cor Composite:</span>
              
              <div 
                className="w-full h-28 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden transition-all duration-300" 
                style={{ backgroundColor: getSimulatedTileColor() }}
              >
                {/* Fake satellite overlay markings */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-20 border-t border-slate-900 pointer-events-none">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                </div>
                
                {/* Simulated coordinate aim */}
                <div className="w-12 h-12 border border-dashed border-white/40 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                </div>

                <div className="absolute bottom-1 right-2 text-[9px] bg-slate-950/80 px-1 py-0.5 rounded text-white font-mono opacity-80">
                  Res: 10m
                </div>
              </div>

              {/* Composition selection */}
              <div className="grid grid-cols-3 gap-1 font-mono text-[8px]">
                <button
                  onClick={() => setRenderingPreset("natural")}
                  className={`p-1.5 rounded border transition-all cursor-pointer text-center ${
                    renderingPreset === "natural" 
                      ? "bg-slate-900 text-slate-100 border-slate-700" 
                      : "bg-slate-900/10 text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  Cor Natural (RGB)
                </button>
                <button
                  onClick={() => setRenderingPreset("false_veg")}
                  className={`p-1.5 rounded border transition-all cursor-pointer text-center ${
                    renderingPreset === "false_veg" 
                      ? "bg-slate-900 text-rose-400 border-slate-700" 
                      : "bg-slate-900/10 text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  Falsa Cor Veg (8,4,3)
                </button>
                <button
                  onClick={() => setRenderingPreset("infra_water")}
                  className={`p-1.5 rounded border transition-all cursor-pointer text-center ${
                    renderingPreset === "infra_water" 
                      ? "bg-slate-900 text-teal-400 border-slate-700" 
                      : "bg-slate-900/10 text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  SWIR Hídrico (11,8,4)
                </button>
              </div>
            </div>

            {/* Right quadrant: real-time computed vegetation indices */}
            <div className="space-y-3 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Índices de Observação Calculados:</span>
              
              <div className="space-y-2">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">NDVI (Vegetação):</span>
                    <strong className={`font-mono text-xs ${Number(interactiveNDVI) > 0.6 ? "text-emerald-400" : Number(interactiveNDVI) > 0.2 ? "text-amber-400" : "text-rose-400"}`}>
                      {interactiveNDVI}
                    </strong>
                  </div>
                  <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">Assinatura de fotossíntese de solo real</span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">NDWI (Espelho Água):</span>
                    <strong className={`font-mono text-xs ${Number(interactiveNDWI) > 0.3 ? "text-indigo-400" : "text-slate-500"}`}>
                      {interactiveNDWI}
                    </strong>
                  </div>
                  <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">Conteúdo de humidade e linhas hídricas</span>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 leading-none">
                Estes índices guiam o classificador e avaliam o enquadramento de REN do projeto.
              </div>
            </div>
          </div>

          {/* Interactive band slider inputs */}
          <div className="space-y-2.5 pt-1.5">
            <div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-rose-450">Banda 4 (Vermelha - Red):</span>
                <span className="font-bold">{bandRed.toFixed(2)} [665 nm]</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={bandRed} 
                onChange={(e) => setBandRed(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1 bg-slate-950 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400">Banda 3 (Verde - Green):</span>
                <span className="font-bold">{bandGreen.toFixed(2)} [560 nm]</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={bandGreen} 
                onChange={(e) => setBandGreen(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-950 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-orange-400">Banda 8 (Infravermelho Próximo - NIR):</span>
                <span className="font-bold">{bandNIR.toFixed(2)} [842 nm]</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={bandNIR} 
                onChange={(e) => setBandNIR(parseFloat(e.target.value))}
                className="w-full accent-orange-500 h-1 bg-slate-950 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-teal-400">Banda 11 (Infravermelho Ondas Curtas - SWIR):</span>
                <span className="font-bold">{bandSWIR.toFixed(2)} [1610 nm]</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={bandSWIR} 
                onChange={(e) => setBandSWIR(parseFloat(e.target.value))}
                className="w-full accent-teal-500 h-1 bg-slate-950 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 2. TASK EXECUTION VIEWPORT AND RESULTS - Right (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Category Toggles and Tasks Grid */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800/85 pb-3">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-emerald-400" />
              Dataset GeoBenchX
            </h4>

            <button
              id="geobenchx-run-all-btn"
              disabled={isRunningAll || runningSingleId !== null}
              onClick={handleRunAll}
              className="text-[9.5px] bg-emerald-600 hover:bg-emerald-550 text-white font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-3 w-3 animate-pulse" />
              {isRunningAll ? "A avaliar..." : "Correr Todos"}
            </button>
          </div>

          {/* Subsets horizontal scrolls */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                id={`cat-btn-${cat.id}`}
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  // Auto-switch active task inside category
                  const found = geoBenchXTasks.find(t => t.category === cat.id);
                  if (found) setActiveTaskId(found.id);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategoryId === cat.id
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-205"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Tasks list in subset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTasks.map((task) => {
              const active = task.id === activeTaskId;
              const res = benchResults[task.id];
              return (
                <button
                  id={`benchx-task-btn-${task.id}`}
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer block relative overflow-hidden ${
                    active 
                      ? "bg-slate-950 border-emerald-500/50 text-white shadow-inner" 
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wide text-slate-200 truncate pr-2">{task.title}</span>
                    <span className={`text-[8px] font-mono px-1 rounded ${
                      task.difficulty === "Fácil" ? "bg-emerald-500/10 text-emerald-400" :
                      task.difficulty === "Médio" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {task.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[9px] text-slate-505 font-mono">{task.satelliteMetadata.satellite}</span>
                    {res && !res.loading && (
                      <span className="flex items-center gap-0.5">
                        {res.isCorrect ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-rose-450" />
                        )}
                      </span>
                    )}
                    {res && res.loading && (
                      <span className="text-[8.5px] text-emerald-400 font-mono animate-pulse">A calcular...</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Evaluator Output Window */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl min-h-[460px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            {/* Run Task bar header */}
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Consola GeoBenchX Executável</span>
                <h3 className="font-display font-semibold text-sm text-slate-100 mt-0.5">{currentTask.title}</h3>
              </div>

              <button
                id={`run-one-benchx-btn-${currentTask.id}`}
                disabled={runningSingleId !== null || isRunningAll}
                onClick={() => handleRunSingle(currentTask)}
                className="bg-emerald-600 hover:bg-emerald-550 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-3 w-3 fill-white text-white" />
                Interrogar LLM
              </button>
            </div>

            {/* Simulated Satellite Header metadata strip */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex justify-between items-center flex-wrap gap-3 text-[10px] font-mono">
              <div>
                <span className="text-slate-500">SATÉLITE:</span> <strong className="text-slate-300">{currentTask.satelliteMetadata.satellite}</strong>
              </div>
              <div>
                <span className="text-slate-500">RESOLUÇÃO:</span> <strong className="text-slate-300">{currentTask.satelliteMetadata.resolution}</strong>
              </div>
              <div>
                <span className="text-slate-500">NUVENS:</span> <strong className="text-slate-300">{currentTask.satelliteMetadata.cloudCoverPct}%</strong>
              </div>
              <div>
                <span className="text-slate-500">TIMESTAMP:</span> <strong className="text-slate-300">{currentTask.satelliteMetadata.timestamp.replace("T", " ").replace("Z", "")}</strong>
              </div>
            </div>

            {/* Question description */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold text-slate-300 block uppercase font-mono tracking-wider">Metodologia e Pergunta:</span>
              <p className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-xs text-slate-300 leading-relaxed font-light font-sans">
                {currentTask.question}
              </p>
            </div>

            {/* Answer targets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-955/50 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Gabarito de Alvo (Ground Truth):</span>
                <p className="text-xs text-emerald-400 font-semibold mt-1">{currentTask.expectedClass}</p>
              </div>
              <div className="bg-slate-955/50 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Validação Filtros (Regex):</span>
                <code className="text-xs text-slate-300 font-mono block mt-1">{currentTask.groundTruthRegex.toString()}</code>
              </div>
            </div>

            {/* LLM evaluation Response Terminal output */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300 block font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Code className="h-4 w-4 text-emerald-400" />
                Saída do Interpretador GeoBenchX:
              </span>

              {/* Empty state */}
              {!benchResults[currentTask.id] && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-dashed border-slate-850 text-center flex flex-col items-center justify-center min-h-[140px]">
                  <Cpu className="h-6 w-6 text-emerald-550 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400 max-w-sm font-light">
                    O classificador científico do GeoBenchX não foi executado para esta cena. Clique em <strong className="text-emerald-400">"Interrogar LLM"</strong> para iniciar simulação.
                  </p>
                </div>
              )}

              {/* Loading state */}
              {benchResults[currentTask.id]?.loading && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col items-center justify-center min-h-[140px] space-y-2">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: "150ms" }} />
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: "300ms" }} />
                  </div>
                  <p className="text-xs text-slate-300 font-mono animate-pulse mt-1">Computando assinaturas espectrais no Gemini 3.5...</p>
                </div>
              )}

              {/* Resolved output */}
              {benchResults[currentTask.id] && !benchResults[currentTask.id].loading && (
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 space-y-3 max-h-60 overflow-y-auto text-xs font-mono shadow-inner">
                  
                  {/* Verdict badge */}
                  <div className={`p-2 rounded-lg border flex items-center justify-between font-bold ${
                    benchResults[currentTask.id].isCorrect 
                      ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/10 text-rose-450"
                  }`}>
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      {benchResults[currentTask.id].isCorrect ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {benchResults[currentTask.id].isCorrect ? "GeoBenchX VERIFIED (MÉTRICA OK)" : "VERIFICAÇÃO FALHOU / CRITÉRIO DIVERGENTE"}
                    </span>
                    <span className="text-[9.5px] font-normal font-sans opacity-90">Confiança VLM: {benchResults[currentTask.id].confidencePct}%</span>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-slate-500 block uppercase">Alvo Identificado:</span>
                    <p className="text-slate-100 font-bold bg-slate-900/60 p-2 rounded-lg border border-slate-900 mt-1">
                      {benchResults[currentTask.id].analyzedClass}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-slate-505 block uppercase">Revisão Física de Bandas Espectrais:</span>
                    <p className="text-slate-350 font-sans font-light leading-relaxed mt-1 whitespace-pre-line pl-1.5">
                      {benchResults[currentTask.id].spectralReview}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-slate-505 block uppercase">Fundamentação Científica:</span>
                    <p className="text-slate-400 font-sans font-light leading-relaxed mt-1 whitespace-pre-line pl-1.5">
                      {benchResults[currentTask.id].justification}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-900">
                    <span className="text-[9.5px] text-emerald-400 uppercase font-bold block mb-1">Pipeline Recomendado (QGIS/GEE Python API):</span>
                    <pre className="bg-slate-900/80 p-2.5 rounded border border-slate-900 text-[9.5px] select-all overflow-x-auto text-slate-350">
                      {benchResults[currentTask.id].suggestedWorkflow}
                    </pre>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Core Scorecard panel footer */}
          {processedKeys.length > 0 && (
            <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-400">Precisão Geral do Motor GeoBenchX:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-850 text-slate-300">
                  {correctCount} de {processedKeys.length} resolvidas
                </span>
                <strong className="text-sm font-mono text-emerald-400 font-bold">{scorePct}%</strong>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
