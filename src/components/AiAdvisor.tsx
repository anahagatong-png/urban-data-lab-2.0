/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AiReportResponse, FeasibilityResult, ProjectParams } from "../types";
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, MessageSquare, Download, Check } from "lucide-react";

interface AiAdvisorProps {
  project: ProjectParams;
  results: FeasibilityResult;
  preloadedGisText?: string;
}

export default function AiAdvisor({ project, results, preloadedGisText }: AiAdvisorProps) {
  const [report, setReport] = useState<AiReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadStep, setLoadStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // State configurations for optional custom PDM/regulation document loads
  const [pdmSource, setPdmSource] = useState<"text" | "pdf">("text");
  const [uploadedPdmText, setUploadedPdmText] = useState<string>("");

  useEffect(() => {
    if (preloadedGisText) {
      setUploadedPdmText(preloadedGisText);
      setPdmSource("text");
    }
  }, [preloadedGisText]);
  const [uploadedPdmFilename, setUploadedPdmFilename] = useState<string>("");
  const [uploadedPdmPdfBase64, setUploadedPdmPdfBase64] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Custom chat states for specific Portuguese urbanistic inquiries
  const [chatInquiry, setChatInquiry] = useState<string>("");
  const [chatAnswer, setChatAnswer] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const steps = [
    "A analisar enquadramento legal e alinhamento do PDM...",
    "A examinar conformidade de cota de pisos e RGEU...",
    "A avaliar coeficientes de impermeabilidade e impacto ambiental...",
    "A simular rentabilidade líquida do promotor (ROI%)...",
    "A formular parecer com base no Simplex Urbanístico (Decreto-Lei n.º 10/2024)...",
  ];

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    setUploadedPdmFilename(file.name);

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        setUploadedPdmPdfBase64(base64String);
        setUploadedPdmText("");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        setUploadedPdmText(reader.result as string);
        setUploadedPdmPdfBase64("");
      };
      reader.readAsText(file);
    }
  };

  const resetPdm = () => {
    setUploadedPdmText("");
    setUploadedPdmPdfBase64("");
    setUploadedPdmFilename("");
  };

  const generateReport = async () => {
    setIsLoading(true);
    setLoadStep(0);

    // Dynamic visual sequence of steps
    const interval = setInterval(() => {
      setLoadStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    try {
      const resp = await fetch("/api/gemini/feasibility-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          project, 
          results, 
          uploadedPdmText: pdmSource === "text" ? uploadedPdmText : "", 
          uploadedPdmPdfBase64: pdmSource === "pdf" ? uploadedPdmPdfBase64 : "" 
        }),
      });

      if (!resp.ok) {
        throw new Error("Falha ao comunicar com o servidor. Verifique a CHAVE API do Gemini.");
      }

      const data = await resp.json();
      setReport(data);
    } catch (err: any) {
      alert("Erro ao gerar parecer AI: " + err.message);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // Immediate custom questions handler
  const handleQuickQuestion = async (question: string) => {
    setChatInquiry(question);
    setIsChatLoading(true);
    setChatAnswer("");

    try {
      const resp = await fetch("/api/gemini/feasibility-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            ...project,
            name: `${project.name} | Pergunta: ${question}`,
          },
          results,
        }),
      });

      if (!resp.ok) {
        throw new Error("Não foi possível carregar a resposta.");
      }

      const data = await resp.json();
      setChatAnswer(data.summary + "\n\n" + data.suggestedOptimizations);
    } catch (err: any) {
      setChatAnswer("Erro ao ligar ao perito AI: " + err.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    const textToCopy = `
=== PARECER AI DE VIABILIDADE - ${project.name} ===
Classificação Geral: ${report.feasibilityRating}
Resumo Executivo: ${report.summary}

Pontos Fortes:
${report.strengths.map((s) => "• " + s).join("\n")}

Condicionantes / Riscos:
${report.risks.map((r) => "• " + r).join("\n")}

Avisos Regulamentares (RGEU / Simplex):
${report.regulatoryWarnings.map((w) => "• " + w).join("\n")}

Sugestão de Otimização Técnica:
${report.suggestedOptimizations}
    `;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color mappings for viability badges
  const badgeClasses = {
    Excelente: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Viável com Condições": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Risco Elevado": "bg-orange-500/15 text-orange-400 border-orange-500/30",
    Inviável: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  return (
    <div id="ai-advisor-root" className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      
      {/* LEFT COLUMN: ACTIVE INTEGRATED REPORT GENERATOR */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 border-b border-slate-800/80 pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
              Parecer de Viabilidade AI
            </span>
            <h3 className="font-display font-semibold text-lg text-slate-100 mt-1">
              Relatório de Licenciamento & Impacto
            </h3>
            <p className="text-xs text-slate-400 font-light mt-1">
              Análise jurídica e paramétrica cruzando o RGEU, as regras de estacionamento, acessibilidades e o Simplex (DL 10/2024).
            </p>
          </div>

          {/* BASE NORMATIVA / CUSTOM PDM WORKFLOW BOX */}
          <div className="relative z-10 mt-5 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <span className="text-xs font-bold font-mono">PDM</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Base Normativa do Município (Opcional)</h4>
                  <p className="text-[10px] text-slate-400 font-light">Carregue ou cole o regulamento urbanístico aplicável como base de avaliação preliminar.</p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => { setPdmSource("text"); resetPdm(); }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pdmSource === "text" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Excerto de Texto
                </button>
                <button
                  type="button"
                  onClick={() => { setPdmSource("pdf"); resetPdm(); }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${pdmSource === "pdf" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Upload de PDF
                </button>
              </div>
            </div>

            {pdmSource === "text" ? (
              <div className="space-y-2">
                <textarea
                  placeholder="Cole regras do regulamento urbanístico aplicável ou Plano Diretor Municipal (PDM). Exemplo: 'O índice de ocupação (COS) acumulável máximo nesta subzona é de 1.5, e o afastamento lateral mínimo deve respeitar cota de 3 metros.'"
                  value={uploadedPdmText}
                  onChange={(e) => setUploadedPdmText(e.target.value)}
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-light placeholder:text-slate-600"
                />
                {uploadedPdmText && (
                  <div className="flex justify-between items-center text-[10px] text-indigo-400 font-mono">
                    <span>✓ Texto de regulação incorporado ({uploadedPdmText.length} carateres)</span>
                    <button type="button" onClick={resetPdm} className="text-rose-400 hover:text-rose-300">Limpar</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 font-sans">
                {!uploadedPdmFilename ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${dragActive ? "border-indigo-500 bg-indigo-950/10" : "border-slate-800 hover:border-slate-700 bg-slate-950/20"}`}
                    onClick={() => document.getElementById("pdm-file-input")?.click()}
                  >
                    <input
                      id="pdm-file-input"
                      type="file"
                      accept=".pdf, .txt, .md"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFile(file);
                      }}
                    />
                    <Download className="h-6 w-6 text-indigo-400 mb-2 animate-pulse" />
                    <p className="text-xs text-slate-300 font-medium">Solte o PDF/regulamento aqui ou clique para selecionar</p>
                    <p className="text-[10px] text-slate-505 mt-1">Carregar ficheiro para guiar regras específicas da viabilidade AI</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 font-bold font-mono text-[9px]">DOC</div>
                      <div>
                        <p className="text-slate-200 font-medium truncate max-w-xs">{uploadedPdmFilename}</p>
                        <p className="text-[9px] text-slate-505">
                          {uploadedPdmPdfBase64 ? "Ficheiro PDF codificado em Base64" : "Ficheiro de texto regulamentar carregado"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetPdm}
                      className="text-[11px] bg-slate-950 px-2 py-1 hover:bg-slate-800 border border-slate-800 rounded-lg text-rose-400 transition-colors cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 flex-wrap gap-2">
              <span className="text-[10px] text-slate-400 italic">
                {uploadedPdmFilename || uploadedPdmText 
                  ? "✓ Usará enquadramento normativo personalizado" 
                  : "Usará enquadramento municipal padrão"}
              </span>

              <button
                id="generate-ai-report"
                disabled={isLoading}
                onClick={generateReport}
                className="bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-4 transition-all shadow-md shadow-indigo-900/40 disabled:opacity-55 cursor-pointer border border-indigo-550/50 ml-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    A Analisar com PDM...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {uploadedPdmFilename || uploadedPdmText ? "Analisar com Base Normativa Carregada" : "Gerar Parecer AI"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LOADING STATE SCROLL IN PHASES */}
          {isLoading && (
            <div className="mt-8 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs text-indigo-300">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="font-mono uppercase tracking-wider">A processar dados territoriais em Portugal</span>
              </div>
              <div className="text-sm font-medium text-slate-200 animate-pulse">
                {steps[loadStep]}
              </div>
              {/* Proportional custom percentage bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-1000"
                  style={{ width: `${((loadStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* GENERATED OUTCOME DISPLAY */}
          {report && !isLoading && (
            <div className="mt-8 space-y-6 text-slate-300 bg-slate-950 rounded-2xl p-6 border border-slate-850 shadow-inner relative z-10">
              
              {/* Header result info */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-855/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-500 font-mono uppercase">Viabilidade Geral do Projeto:</span>
                  <span className={`px-3 py-1 text-xs font-bold border rounded-full ${badgeClasses[report.feasibilityRating] || badgeClasses["Viável com Condições"]}`}>
                    {report.feasibilityRating}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    id="copy-to-clipboard"
                    onClick={copyToClipboard}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-xl text-slate-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copiar Relatório"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              {/* Summary description */}
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-300">
                <h4 className="font-display font-semibold text-slate-100 text-xs tracking-wider uppercase mb-2 text-indigo-400">Resumo Consultivo</h4>
                <p className="font-light">{report.summary}</p>
              </div>

              {/* Strengths and Risks side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="bg-emerald-950/20 rounded-2xl p-4 border border-emerald-900/40 text-slate-300">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Pontos Fortes
                  </h5>
                  <ul className="text-xs text-slate-350 space-y-1.5 list-disc pl-4 font-light">
                    {report.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/20 rounded-2xl p-4 border border-rose-900/40 text-slate-300">
                  <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    Condicionantes / Riscos
                  </h5>
                  <ul className="text-xs text-slate-350 space-y-1.5 list-disc pl-4 font-light">
                    {report.risks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Regulatory Alerts specific to Portugal */}
              <div className="space-y-2 border-t border-slate-855/60 pt-4">
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
                  Parecer Técnico-Legal (Simplex & RGEU)
                </h5>
                <ul className="text-xs text-slate-350 space-y-1.5 pl-1 font-light">
                  {report.regulatoryWarnings.map((warning, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Design Recommendations */}
              <div className="space-y-2 border-t border-slate-855/60 pt-4">
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Diretrizes Técnicas de Desenho
                </h5>
                <ul className="text-xs text-slate-350 space-y-1.5 pl-1 font-light">
                  {report.designRecommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested parameter adjustments */}
              <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4 text-xs text-slate-350 space-y-1.5">
                <span className="font-bold text-indigo-300 uppercase tracking-wider">Caminhos de Otimização Propostos:</span>
                <p className="leading-relaxed font-light">{report.suggestedOptimizations}</p>
              </div>

            </div>
          )}

          {!report && !isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/25 text-center">
              <Sparkles className="h-8 w-8 text-indigo-500/40 mb-3 animate-pulse" />
              <p className="text-sm text-slate-400 max-w-sm font-light">
                Clique no botão de geração acima para iniciar o raciocínio geoespacial e compilar o seu Parecer AI personalizado.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: PRE-PACKAGED PORTUGUESE REGULATOR INQUIRIES */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between h-full">
          <div>
            <h4 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
              Pergunte ao Perito Urbanista
            </h4>
            <p className="text-xs text-slate-400 font-light mb-6">
              Tire dúvidas específicas sobre o regime legal de construção em Portugal e enquadre o projeto.
            </p>

            <div className="space-y-2.5">
              <button
                id="preset-q-1"
                onClick={() => handleQuickQuestion("O que altera na prática o Simplex DL 10/2024 na aprovação do PDM?")}
                className="w-full text-left font-sans text-xs bg-slate-950 hover:bg-slate-850/60 border border-slate-850/85 text-slate-300 px-4 py-3 rounded-xl transition-all hover:translate-x-0.5 cursor-pointer block"
              >
                Como funciona o Simplex (DL 10/2024) neste lote?
              </button>
              
              <button
                id="preset-q-2"
                onClick={() => handleQuickQuestion("Como funciona o Coeficiente de Permeabilidade nos municípios portugueses?")}
                className="w-full text-left font-sans text-xs bg-slate-950 hover:bg-slate-850/60 border border-slate-850/85 text-slate-300 px-4 py-3 rounded-xl transition-all hover:translate-x-0.5 cursor-pointer block"
              >
                Regras e dicas para o Coeficiente de Permeabilidade
              </button>

              <button
                id="preset-q-3"
                onClick={() => handleQuickQuestion("Quais as regras gerais do RGEU quanto à acessibilidade (Decreto-Lei 163/2006)?")}
                className="w-full text-left font-sans text-xs bg-slate-950 hover:bg-slate-850/60 border border-slate-850/85 text-slate-300 px-4 py-3 rounded-xl transition-all hover:translate-x-0.5 cursor-pointer block"
              >
                Regulamentos de acessibilidade física
              </button>

              <button
                id="preset-q-4"
                onClick={() => handleQuickQuestion("Quais as penalizações por falta de lugares de estacionamento regulamentar?")}
                className="w-full text-left font-sans text-xs bg-slate-950 hover:bg-slate-850/60 border border-slate-850/85 text-slate-300 px-4 py-3 rounded-xl transition-all hover:translate-x-0.5 cursor-pointer block"
              >
                Compensações por falta de estacionamento
              </button>
            </div>
          </div>

          {/* CHAT OUTPUT SCREEN */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            {chatInquiry && (
              <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs">
                <span className="font-semibold text-slate-400 block font-mono text-[10px] uppercase">Pergunta efetuada:</span>
                <p className="text-slate-300 italic mt-0.5 font-light">{chatInquiry}</p>
              </div>
            )}

            {isChatLoading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>O perito virtual está a formular a resposta técnica...</span>
              </div>
            )}

            {chatAnswer && !isChatLoading && (
              <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl text-xs leading-relaxed text-slate-300 max-h-[160px] overflow-y-auto font-light">
                <span className="font-semibold text-indigo-400 block mb-1 uppercase font-mono text-[10px]">Parecer Sumário:</span>
                <p className="whitespace-pre-line">{chatAnswer}</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
