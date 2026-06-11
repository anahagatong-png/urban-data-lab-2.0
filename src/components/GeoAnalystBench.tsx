/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Cpu, 
  Settings, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Play, 
  Layers, 
  TrendingUp, 
  Award, 
  Globe, 
  GitBranch, 
  ArrowRight, 
  BookOpen,
  Zap,
  HelpCircle,
  Code
} from "lucide-react";
import { ProjectParams } from "../types";

interface GeoTask {
  id: string;
  category: string;
  title: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  question: string;
  expectedAnswer: string;
  groundTruthRegex: RegExp;
  postGisFuncs: string;
  portugueseStandard: string;
}

interface GeoAnalystBenchProps {
  project: ProjectParams;
}

export default function GeoAnalystBench({ project }: GeoAnalystBenchProps) {
  const [activeTaskId, setActiveTaskId] = useState<string>("crs_proj");
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [runningSingleId, setRunningSingleId] = useState<string | null>(null);
  
  // Results of the evaluation per task ID
  const [taskResults, setTaskResults] = useState<Record<string, {
    modelAnswer: string;
    reasoningSteps: string;
    spatialFormulas: string;
    portugueseStandard: string;
    isCorrect: boolean;
    loading: boolean;
  }>>({});

  const geoTasks: GeoTask[] = [
    {
      id: "crs_proj",
      category: "Sistema de Referência de Coordenadas (CRS)",
      title: "Transformação de Coordenadas PT-TM06",
      difficulty: "Fácil",
      question: `Um município português como ${project.municipalityId.toUpperCase()} exige que todos os levantamentos topográficos do Plano Diretor Municipal (PDM) sejam entregues no sistema oficial PT-TM06 sobre o datum ETRS89. Um engenheiro entregou os cantos do polígono do lote em coordenadas geográficas globais WGS 84 (EPSG:4326), com o centroide na Latitude 38.7452 e Longitude -9.1412. 
Qual é o código EPSG numérico exato correspondente ao sistema de projeção nacional PT-TM06/ETRS89 para Portugal Continental exigido para compatibilidade imediata de camadas no visualizador municipal SIG? E explique sumariamente porque são preferíveis coordenadas projetadas (em metros) sobre geográficas (em graus) para apurar a área de implantação real do prédio.`,
      expectedAnswer: "EPSG:3763",
      groundTruthRegex: /3763/,
      postGisFuncs: "ST_Transform(geom, 3763)",
      portugueseStandard: "Decreto-Lei n.º 141/2014 (Regulamentação Geográfica Nacional)"
    },
    {
      id: "containment",
      category: "Topologia e Relações Espaciais",
      title: "Geofencing de Solo / Reserva Ecológica (REN)",
      difficulty: "Médio",
      question: `Tem um lote retangular regular definido geograficamente pelas seguintes coordenadas de canto em formato de bounding box (PT-TM06 coordenadas métricas aproximadas):
Canto Sudoeste: X= -92500m, Y= -103500m
Canto Nordeste: X= -92100m, Y= -103100m
Uma linha de água e respetiva faixa de servidão de Reserva Ecológica Nacional (Decreto-Lei n.º 166/2008) constitui um buffer poligonal de REN com centroide numa área sensível. Determine com rigor geométrico se um poço projetado para captação de águas localizado na coordenada exata X = -92300, Y = -103300 está localizado DENTRO ou FORA do perímetro do lote. E refira qual a principal função PostGIS para apurar a área de colisão entre ambos polígonos.`,
      expectedAnswer: "DENTRO (Inside)",
      groundTruthRegex: /(dentro|inside)/i,
      postGisFuncs: "ST_Contains(parcel.geom, point.geom) / ST_Within",
      portugueseStandard: "Regime Jurídico da Reserva Ecológica Nacional (DL 166/2008)"
    },
    {
      id: "buffer_overlap",
      category: "Buffer & Proximidade Crítica",
      title: "Faixa de Resguardo de Linhas de Média/Alta Tensão",
      difficulty: "Médio",
      question: `Nos regulamentos portugueses de planeamento urbano, as construções de habitação devem observar uma faixa de proteção (canal de resguardo de infraestruturas) com o afastamento mínimo de 15 metros a contar da projeção horizontal dos condutores de linhas aéreas de transporte de eletricidade de AT (Alta Tensão).
Se o eixo geométrico de uma linha de transporte de eletricidade passa na coordenada linear estrita X = 120m no seu terreno plano, e o seu plano de implantação do edifício estende-se linearmente desde a coordenada X = 100m até X = 140m:
A) O edifício colide com a zona de exclusão de proteção regulamentar?
B) Qual é a extensão da largura (em metros) do edifício que estaria abrangida pela zona interdita de construção?`,
      expectedAnswer: "A) Sim, colide. B) 30 metros (entre X=105m e X=135m)",
      groundTruthRegex: /(sim|yes|30)/i,
      postGisFuncs: "ST_Buffer(powerline.geom, 15) e ST_Intersection",
      portugueseStandard: "Decreto Regulamentar n.º 1/92 (Regulamento de Segurança de Linhas Elétricas)"
    },
    {
      id: "network_routing",
      category: "Planeamento de Redes e Acessibilidade",
      title: "Acessibilidade de Viaturas de Socorro SCIE",
      difficulty: "Difícil",
      question: `De acordo com as Normas Técnicas do Despacho n.º 2074/2009 (Segurança Contra Incêndios em Edifícios - SCIE), as viaturas pesadas de socorro necessitam de vias de acesso contínuas e desimpedidas até às fachadas úteis.
Considere um grafo de tráfego com três nós rodoviários principais:
- Nó A: Entrada principal da via pública
- Nó B: Ramal e área de viragem de veículos
- Nó C: Facha de estacionamento de socorristas adjacente ao prédio.
As distâncias operacionais são:
Segmento A -> B: 130 metros
Segmento B -> C: 90 metros
A ligação direta A -> C constitui um beco pedonal estreito inacessível a veículos pesados de socorro (peso bruto superior a 15 toneladas).
Qual é a distância de circulação real mais curta e em conformidade técnica (em metros) para que uma viatura pesada de bombeiros aceda do Nó A ao Nó C? Indique o algoritmo ou função SIG estruturada usada para esta computação.`,
      expectedAnswer: "220 metros (passando pelo nó B)",
      groundTruthRegex: /220/,
      postGisFuncs: "pgr_dijkstra('SELECT id, source, target, cost FROM edges', A, C)",
      portugueseStandard: "Portaria n.º 1532/2008 (Regulamento Técnico de SCIE)"
    },
    {
      id: "density_cos",
      category: "Cálculos Paramétricos Avançados",
      title: "Verificação de COS (Índice de Utilização do Solo)",
      difficulty: "Fácil",
      question: `Um promotor imobiliário solicita o licenciamento de um edifício plurifamiliar de habitação. O polígono do lote georreferenciado possui uma área total exata de 3000 m². O projeto planeia uma Área Bruta de Construção (ABC) total acima do solo de 5100 m² distribuída por ${project.customMaxFloors} pisos.
A classificação de solo no PDM local define um COS máximo aplicável (Índice de Utilização do Solo) de 1.6 para esta subzona de consolidação mista.
Calcule o Coeficiente de Ocupação do Solo (COS) real planeado pela proposta do promotor. Indique se o projeto cumpre (Conforme) ou excede (Não Conforme) a imposição de ocupação máxima e a percentagem de desvio.`,
      expectedAnswer: "COS Real = 1.70. Não Conforme (excede em 6.25%)",
      groundTruthRegex: /(1\.7|Não Conforme|excede)/i,
      postGisFuncs: "ABC / Area_Lote",
      portugueseStandard: "Regulamento do Plano Diretor Municipal (PDM)"
    }
  ];

  const handleRunSingle = async (task: GeoTask) => {
    setRunningSingleId(task.id);
    setTaskResults(prev => ({
      ...prev,
      [task.id]: {
        modelAnswer: "",
        reasoningSteps: "",
        spatialFormulas: "",
        portugueseStandard: "",
        isCorrect: false,
        loading: true
      }
    }));

    try {
      const resp = await fetch("/api/gemini/geo-analyst-bench", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          question: task.question,
          expectedAnswer: task.expectedAnswer,
          extraContext: `Estudo de lote de ${project.plotArea} m² no concelho de ${project.municipalityId}.`
        })
      });

      if (!resp.ok) throw new Error("Erro na chamada de avaliação remota do benchmark.");

      const data = await resp.json();
      
      // Perform Ground Truth validation match using Regex
      const passesGroundTruth = task.groundTruthRegex.test(data.modelAnswer) || 
                                 task.groundTruthRegex.test(data.reasoningSteps);

      setTaskResults(prev => ({
        ...prev,
        [task.id]: {
          modelAnswer: data.modelAnswer || "Inacessível",
          reasoningSteps: data.reasoningSteps || "Não especificado pelo modelo",
          spatialFormulas: data.spatialFormulas || "A avaliar",
          portugueseStandard: data.portugueseStandard || "Vago",
          isCorrect: passesGroundTruth,
          loading: false
        }
      }));

    } catch (err: any) {
      console.error(err);
      setTaskResults(prev => ({
        ...prev,
        [task.id]: {
          modelAnswer: "Erro de Conexão",
          reasoningSteps: "Falha ao consultar a API do Gemini local: " + err.message,
          spatialFormulas: "N/A",
          portugueseStandard: "N/A",
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
    for (const task of geoTasks) {
      await handleRunSingle(task);
    }
    setIsRunningAll(false);
  };

  const currentTask = geoTasks.find(t => t.id === activeTaskId) || geoTasks[0];
  const activeResult = taskResults[currentTask.id];

  // Global scorecard stats
  const runTasks = Object.keys(taskResults).filter(k => !taskResults[k].loading);
  const correctCount = runTasks.filter(k => taskResults[k].isCorrect).length;
  const accuracyPct = runTasks.length > 0 ? Math.round((correctCount / runTasks.length) * 100) : 0;

  return (
    <div id="geo-analyst-bench-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-200 mt-2 font-sans">
      
      {/* LEFT: Task Catalog & Educational Context (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Education on geo benchmarking */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-550/15 text-indigo-400 rounded-xl border border-indigo-550/20">
              <Globe className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                  Benchmark SIG
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Integrado</span>
              </div>
              <h3 className="font-display font-semibold text-sm text-slate-100 tracking-wide mt-1">GeoAnalystBench Explorer</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            O <strong>GeoAnalystBench</strong> é um referencial aberto concebido pelo laboratório de investigação GeoDS para quantificar a proficiência de modelos de linguagem em raciocínio geoespacial complexo.
          </p>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850/80 text-[11px] leading-relaxed text-slate-400 font-light">
            <p className="mb-2"><strong>Porquê testar isto num App de urbanismo?</strong></p>
            O motor de licenciamento virtual utiliza modelos LLM para avaliar enquadramentos legais, limites do PDM e regras do RGEU. Este laboratório permite verificar se a IA compreende noções de topologia, distâncias de segurança (buffers) e códigos de projeção portugueses.
          </div>
        </div>

        {/* Catalog of Spatial Tasks */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-200">Bateria de Testes SIG</h4>
            </div>
            
            <button
              id="run-all-bench-btn"
              disabled={isRunningAll || runningSingleId !== null}
              onClick={handleRunAll}
              className="text-[10px] bg-indigo-600 hover:bg-indigo-550 text-white font-mono px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Cpu className="h-3 w-3 animate-pulse" />
              {isRunningAll ? "A avaliar..." : "Correr Todos"}
            </button>
          </div>

          <div className="space-y-2">
            {geoTasks.map((task) => {
              const active = task.id === activeTaskId;
              const result = taskResults[task.id];
              return (
                <button
                  id={`bench-task-${task.id}`}
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer block ${
                    active 
                      ? "bg-slate-950 border-indigo-500/50 text-white shadow-inner" 
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold block text-slate-200 truncate max-w-[180px]">{task.title}</span>
                    <div className="flex gap-1.5">
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border ${
                        task.difficulty === "Fácil" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                          : task.difficulty === "Médio" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/10"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/10"
                      }`}>
                        {task.difficulty}
                      </span>
                      {result && !result.loading && (
                        <span>
                          {result.isCorrect ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[9px] text-slate-500">
                    <span className="font-mono truncate max-w-[210px]">{task.category}</span>
                    {result && result.loading && (
                      <span className="font-mono text-indigo-400 animate-pulse">A calcular...</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Scorecard Stats card */}
        {runTasks.length > 0 && (
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Scorecard de Precisão</span>
                <h4 className="font-display font-semibold text-slate-200 text-xs">Exatidão do Modelo em SIG</h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-indigo-400">{accuracyPct}%</span>
                <span className="text-[9px] block text-slate-500">({correctCount} / {runTasks.length} corretas) </span>
              </div>
            </div>

            <div className="mt-3.5 space-y-1.5">
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${accuracyPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-light">
                {accuracyPct >= 80 
                  ? "✓ Fantástico! O motor de IA atual cumpre os requisitos mais estritos de raciocínio espacial e normativo europeu." 
                  : "✓ Recomendável: Cruze os pareceres automáticos com a tab Geoportal para cálculos geométricos PostGIS complementares."}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Live Bench Evaluator Window (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl min-h-[580px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-5">
            
            {/* Header / Active Task indicator */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-bold">
                  <Terminal className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  Consola de Teste de Raciocínio Espacial
                </span>
                <h3 className="font-display font-semibold text-base text-slate-100 mt-1">
                  {currentTask.title}
                </h3>
              </div>
              <button
                id={`run-one-bench-${currentTask.id}`}
                disabled={runningSingleId !== null || isRunningAll}
                onClick={() => handleRunSingle(currentTask)}
                className="bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 text-white fill-white" />
                Interrogar Modelo
              </button>
            </div>

            {/* Task Question Box */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-semibold text-slate-300 block">Enunciado da Questão:</span>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-xs text-slate-300 leading-relaxed font-light">
                {currentTask.question}
              </div>
            </div>

            {/* Ground Truth Expected response */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Resposta Ground-Truth Alvo:</span>
                  <p className="text-xs font-semibold text-indigo-300 mt-1 h-5">{currentTask.expectedAnswer}</p>
                </div>
                <div className="text-[9px] text-slate-500 font-light mt-1">
                  Aferição por padrão objetivo regulamentar.
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Norma Legal Associada:</span>
                  <p className="text-xs font-semibold text-slate-300 mt-1 truncate">{currentTask.portugueseStandard}</p>
                </div>
                <div className="text-[9px] text-slate-505 font-mono mt-1 flex items-center gap-0.5">
                  <BookOpen className="h-3 w-3 inline text-indigo-400" /> {currentTask.postGisFuncs}
                </div>
              </div>
            </div>

            {/* AI Response output area */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Resposta Analítica Emitida pelo Gemini:</span>
              
              {!activeResult && (
                <div className="bg-slate-950 p-8 border border-dashed border-slate-850 rounded-2xl text-center h-44 flex flex-col items-center justify-center">
                  <HelpCircle className="h-7 w-7 text-indigo-500/20 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400 max-w-xs font-light">
                    O modelo ainda não foi interrogado nesta tarefa espacial. Clique em <strong className="text-indigo-400">"Interrogar Modelo"</strong> acima para avaliar.
                  </p>
                </div>
              )}

              {activeResult && activeResult.loading && (
                <div className="bg-slate-950 p-8 border border-slate-850 rounded-2xl text-center h-44 flex flex-col items-center justify-center space-y-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 bg-indigo-505 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-indigo-505 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 bg-indigo-505 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-mono leading-none font-semibold">Gemini 3.5 Flash interrogado...</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">Analisando CRS, enquadramentos e avaliando a conformação de vetores em Portugal.</p>
                  </div>
                </div>
              )}

              {activeResult && !activeResult.loading && (
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 space-y-4 max-h-56 overflow-y-auto">
                  
                  {/* Validation Verdict banner */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    activeResult.isCorrect 
                      ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/10 text-rose-400"
                  }`}>
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      {activeResult.isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {activeResult.isCorrect ? "Teste Comprovado (Pass)" : "Rever Resposta (Falha / Divergente)"}
                    </span>
                    <span className="text-[10px] font-normal font-sans italic opacity-90">
                      Regex: {currentTask.expectedAnswer}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">1. Decisão do Modelo:</span>
                    <p className="text-slate-200 text-xs font-semibold mt-1 font-mono bg-slate-900/50 p-2 rounded-xl border border-slate-900 leading-snug">
                      {activeResult.modelAnswer}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">2. Demonstração e Passos de Raciocínio Espacial:</span>
                    <p className="text-slate-300 text-xs mt-1.5 leading-relaxed font-light whitespace-pre-line font-sans">
                      {activeResult.reasoningSteps}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-900 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-mono block uppercase">Abordagem PostGIS recomendada:</span>
                      <code className="text-indigo-400 font-mono font-bold block mt-1 bg-slate-900/80 p-1 rounded font-xs border border-slate-900">{activeResult.spatialFormulas}</code>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block uppercase">Referência de Portugal:</span>
                      <p className="text-slate-300 font-sans tracking-wide block mt-1 font-medium">{activeResult.portugueseStandard}</p>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

          <div className="text-[10.5px] text-slate-500 italic mt-4 pt-3 border-t border-slate-900/65 flex items-center justify-between">
            <span>✓ Integração direta com GeoAnalystBench de livre download científico.</span>
            <span>Estudo Ativo: {project.name}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
