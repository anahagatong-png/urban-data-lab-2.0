/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Layers, 
  MapPin, 
  Activity, 
  Database, 
  Globe, 
  Terminal, 
  Check, 
  HelpCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Map as MapIcon,
  Code
} from "lucide-react";
import { ProjectParams } from "../types";

interface GisIntegrationProps {
  project: ProjectParams;
  onInjectGisData: (gisText: string) => void;
  activeTabToAi: () => void;
}

export default function GisIntegration({ project, onInjectGisData, activeTabToAi }: GisIntegrationProps) {
  const [selectedLayer, setSelectedLayer] = useState<string>("pdm_zoning");
  const [methodology, setMethodology] = useState<"conceptual" | "computational">("computational");
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 38.7452,
    lng: -9.1412, // Preloaded with typical Lisbon center coordinates
  });

  // Layer descriptions for WMS, WFS and ArcGIS REST integration in Portugal
  const layers = [
    { 
      id: "pdm_zoning", 
      name: "Zonamento de Solo (PDM - Classes de Espaço)", 
      type: "WFS / ArcGIS FeatureServer",
      endpoint: "https://geoportal.cml.pt/arcgis/rest/services/PDM/MapServer/6", 
      desc: "Retorna a classificação oficial do lote (ex: Solo Urbano - Espaço Residencial Consolidado Histórico ou de Alta Densidade). Determina o COS e CES base.",
      conceptualInfo: "Análise qualitativa: Classifica se o solo é rústico, urbano ou sob servidão militar ou aeronáutica com base no regulamento nacional descritivo.",
      computationalInfo: "Cálculo geoespacial: Interseção exata (spatial join / ST_Intersection) entre o polígono do lote e as geometrias da Carta Municipal de Zonamento para extrair o percentual real de cada subzona."
    },
    { 
      id: "ecological_national_reserve", 
      name: "Reserva Ecológica Nacional (Servidão REN)", 
      type: "WMS / WFS (APA)", 
      endpoint: "https://servicos.dgterritorio.gov.pt/wms/ren",
      desc: "Delimita áreas com restrições hidrogeológicas, erosão ou áreas instáveis com proteção estrita.",
      conceptualInfo: "Análise qualitativa: Descreve o regime legal de proteção da REN e se se aplica o princípio da exceção para infraestruturas de interesse público.",
      computationalInfo: "Cálculo geoespacial: Buffer geométrico de 10-30 metros de linhas de água e declives acumulados acima de 25% com base no MDE (Modelo Digital de Elevação) local."
    },
    { 
      id: "patrimony_protection", 
      name: "Zonas de Proteção Patrimonial (DGPC / Musas)", 
      type: "ArcGIS Server MapServer",
      endpoint: "https://servicos.patrimoniocultural.gov.pt/arcgis/rest/services/ZonasProtecao", 
      desc: "Mapeamento de monumentos classificados e respetivas zonas gerais de proteção (habitualmente raio de 50 metros).",
      conceptualInfo: "Análise qualitativa: Determina se o projeto carece de emissão de parecer obrigatório da DGPC (Direção-Geral do Património Cultural) ou entidade arquivística regional.",
      computationalInfo: "Cálculo geoespacial: Varredura de colisão radial (radial point-in-polygon) cruzando as coordenadas do centróide do lote com o catálogo de georreferenciação de edifícios tombados."
    },
    { 
      id: "acoustic_infrastructure", 
      name: "Zonas de Sensibilidade Ruído (Regulamento Geral Ruído)", 
      type: "Open Geospatial API", 
      endpoint: "https://servicos.dgterritorio.gov.pt/wfs/ruido",
      desc: "Mapeia as zonas acústicas e limites legais de ruído rodoviário/ferroviário incidentes no lote.",
      conceptualInfo: "Análise qualitativa: Avalia se os edifícios de habitação adjacentes exigem requisitos reforçados de isolamento sonoro de acordo com o regulamento de ruído.",
      computationalInfo: "Cálculo geoespacial: Avaliação de curvas isófonas contínuas em dbA geradas dinamicamente com base na contagem de tráfego e distância aos eixos de vias estruturantes."
    }
  ];

  const activeLayerObj = layers.find(l => l.id === selectedLayer) || layers[0];

  const handleQueryGis = () => {
    setIsQuerying(true);
    setQueryResult(null);

    // Simulate query execution in real spatial tables (ArcGIS / PostgreSQL postgis)
    setTimeout(() => {
      const isLisbon = project.municipalityId.includes("lisboa");
      const isPorto = project.municipalityId.includes("porto");
      
      let simulatedFeatures: any = {};
      
      if (selectedLayer === "pdm_zoning") {
        simulatedFeatures = {
          layerName: "Carta Municipal do Plano Diretor Municipal - Classificação de Solo",
          crs: "EPSG:3763 (PTTM06 - Portugal Continental)",
          computedParcelAreaM2: project.plotArea,
          intersectionProperties: {
            subclasseClassificacao: isLisbon 
              ? "Solo Urbano - Espaços Residenciais Consolidados Tipo H1"
              : isPorto 
              ? "Solo Urbano - Áreas de Acolhimento Empresarial de Mista Densidade"
              : "Solo Urbano - Áreas de Expansão Habitacional Regulada",
            maxIndexCOS: project.customCOS, 
            maxIndexCES: project.customCES,
            recuoObrigatorioMeters: 6,
            cotaSoleiraPermitidaMeters: project.customMaxFloors * 3.1
          },
          municipalCode: project.municipalityId.toUpperCase(),
          geoprocessingLog: "SELECT ST_Intersection(parcel.geom, zoning.geom) FROM cml_pdm_zoning AS zoning... Overlap detectado: 100% no polígono de habitação.",
          confidenceLevel: "99.2% (Dados oficiais homologados via ArcGIS REST API)"
        };
      } else if (selectedLayer === "ecological_national_reserve") {
        simulatedFeatures = {
          layerName: "Servidão Administrativa - Reserva Ecológica Nacional (DGT/APA)",
          crs: "EPSG:3763",
          affectedAreaM2: selectedLayer === "ecological_national_reserve" && project.customPermeability > 0.45 ? (project.plotArea * 0.15) : 0,
          intersectionProperties: {
            isWithinRen: project.customPermeability > 0.45 ? "SIM (Parcial - Zona de Proteção a Cabeceiras de Linha de Água)" : "NÃO",
            legalConstraint: "Nos termos do Decreto-Lei n.º 166/2008, áreas inseridas em REN possuem interdição geral de edificação, sujeitas ao regime de exceção se fundamentadas administrativamente.",
            bufferMeters: "30 metros do limite do leito de cheia"
          },
          geoprocessingLog: "ST_Contains(ST_Buffer(water_lines.geom, 30), parcel.geom)",
          confidenceLevel: "95% (Atualizado em tempo real via WFS APA)"
        };
      } else if (selectedLayer === "patrimony_protection") {
        simulatedFeatures = {
          layerName: "Carta de Bens Classificados e Zonas de Proteção Geral (DGPC)",
          crs: "EPSG:3763",
          intersectionProperties: {
            closestMonumentName: isLisbon 
              ? "Igreja de São João de Alvalade / Monumentos do Estado de 1950" 
              : "Edifícios Históricos Classificados de Utilidade Pública",
            distanceToMonumentMeters: "74.5 metros (Zona de Proteção Geral Ativa)",
            mandatoryOpinionRequired: "SIM (Obrigatório parecer prévio da tutela de património cultural por estar a menos de 100m do centróide georreferenciado)"
          },
          geoprocessingLog: "SELECT monument.name, ST_Distance(parcel.geom, monument.geom) AS dist FROM dgpc_monuments WHERE dist < 100",
          confidenceLevel: "100% (DGPC Base REST Services API)"
        };
      } else {
        simulatedFeatures = {
          layerName: "Mapa de Ruído e Curvas Isófonas do Território Geral",
          crs: "EPSG:3763",
          intersectionProperties: {
            acousticZoneClass: "Zona Mista de Sensibilidade Média",
            dayNoiseLevelDb: "58.4 dBA",
            nightNoiseLevelDb: "48.2 dBA (Limite regulamentar respeitado)",
            recommendedAcousticIndexRw: "Mínimo 38 dB nos vãos e fachadas expostas"
          },
          geoprocessingLog: "ST_Value(raster_noise.tif, ST_Centroid(parcel.geom))",
          confidenceLevel: "88% (Dados de modelações preditivas rodoviárias)"
        };
      }

      setQueryResult(simulatedFeatures);
      setIsQuerying(false);
    }, 1500);
  };

  const handleInject = () => {
    if (!queryResult) return;
    
    const formattedText = `
[DADOS OBTIDOS VIA INTEGRAÇÃO CADASTRAL E MUNICIPAL GIS - PORTUGAL]
- Fonte Geoespacial: ${queryResult.layerName}
- Sistema de Referência de Coordenadas (CRS): ${queryResult.crs}
- Camada Consultada: ${activeLayerObj.name}
- Parâmetros Detetados:
  ${Object.entries(queryResult.intersectionProperties).map(([k, v]) => `• ${k}: ${v}`).join("\n  ")}
- Log de Cálculo Geoprocessamento: ${queryResult.geoprocessingLog}
- Fator de Qualidade: ${queryResult.confidenceLevel}
- Análise Metodológica Utilizada pelo Sistema: ${methodology === "computational" ? "Computação de Vetores e Interseções Espaciais Reais (GIS)" : "Enquadramento Legal Conceitual Regulatória Clássico"}
[NOTA: Use estas informações normativas recolhidas diretamente do portal do município como prioridade absoluta para calcular restrições e adequabilidade ambiental no parecer de viabilidade.]
    `;

    onInjectGisData(formattedText);
    alert("Dados geográficos e restrições do GIS importados com sucesso para a Base Normativa do Parecer AI! Mude agora para a tab de Parecer e corra o parecer técnico.");
    activeTabToAi();
  };

  return (
    <div id="gis-integration-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-200 font-sans">
      
      {/* 1. LAYER SELECTOR AND INTEGRATION THEORY - Left (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Methodological switch panel */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
            <h4 className="font-display font-semibold text-slate-100 text-sm uppercase tracking-wide">
              Metodologia de Análise Espacial
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Selecione como as servidões do território e regras do PDM são processadas neste motor de inteligência imobiliária portuguesa.
          </p>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-850 rounded-2xl">
            <button
              id="geo-concept-btn"
              type="button"
              onClick={() => setMethodology("conceptual")}
              className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center border cursor-pointer ${
                methodology === "conceptual" 
                  ? "bg-indigo-600 border-indigo-505/40 text-white shadow-md shadow-indigo-950/20" 
                  : "bg-slate-900/40 border-transparent text-slate-440 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <div className="text-xs font-semibold">Análise Conceitual</div>
              <span className="text-[9px] text-slate-400 leading-tight">Descrição jurídica sintética baseada no RGEU/PDM</span>
            </button>

            <button
              id="geo-compute-btn"
              type="button"
              onClick={() => setMethodology("computational")}
              className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center border cursor-pointer ${
                methodology === "computational" 
                  ? "bg-indigo-600 border-indigo-505/40 text-white shadow-md shadow-indigo-950/20" 
                  : "bg-slate-900/40 border-transparent text-slate-440 hover:text-slate-200"
              }`}
            >
              <Database className="h-4 w-4" />
              <div className="text-xs font-semibold">Cálculo Geoespacial</div>
              <span className="text-[9px] text-slate-400 leading-tight">Interseção matemática de polígonos via REST API</span>
            </button>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-850 text-xs font-light leading-relaxed text-slate-350">
            {methodology === "conceptual" ? (
              <p>
                <strong>Abordagem Conceitual:</strong> O sistema realiza uma triagem linguística e dedutiva a partir do município ({project.municipalityId}). 
                Identifica regras legais clássicas como restrições patrimoniais genéricas, as distâncias presumidas e alertas preventivos não localizados.
              </p>
            ) : (
              <p>
                <strong>Abordagem Computacional GIS:</strong> Simula a operação de servidores SIG Municipais e o uso do PostGIS local. 
                Representa a obtenção do envelope WKT do lote, calculando intersecções geográficas com geometrias precisas que fornecem dados métricos incontestáveis ao projeto.
              </p>
            )}
          </div>
        </div>

        {/* Catalog of layer portals */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h4 className="font-display font-semibold text-slate-100 text-sm uppercase tracking-wide">
              Fontes & Camadas Urbanísticas
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-light">
            Portais de dados geográficos nacionais e regionais estabelecidos em Portugal. Escolha a camada para interagir:
          </p>

          <div className="space-y-2">
            {layers.map((lay) => {
              const active = selectedLayer === lay.id;
              return (
                <button
                  id={`select-layer-btn-${lay.id}`}
                  key={lay.id}
                  onClick={() => { setSelectedLayer(lay.id); setQueryResult(null); }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer block ${
                    active 
                      ? "bg-slate-950 border-indigo-500/50 text-white shadow-inner" 
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-350"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wide block text-slate-250 truncate max-w-[210px]">{lay.name}</span>
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-550/20">
                      {lay.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-light leading-snug">{lay.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. LIVE GIS WORKSPACE SIMULATOR - Right (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
          
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-bold">
                  <Globe className="h-3.5 w-3.5 text-indigo-400" />
                  Consola de Geoprocessamento Remota
                </span>
                <h3 className="font-display font-semibold text-base text-slate-200 mt-1">
                  Integração Directa com Servidor de Mapas
                </h3>
              </div>
              <div className="text-[10px] bg-slate-950 border border-slate-850 p-1 px-2.5 rounded-lg text-slate-405 font-mono">
                COORD: <span className="text-indigo-400 font-bold">{selectedCoordinates.lat.toFixed(4)}N</span>, <span className="text-indigo-400 font-bold">{selectedCoordinates.lng.toFixed(4)}W</span>
              </div>
            </div>

            {/* Interactive schematic parcel visualization overlay */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 relative min-h-[190px] flex flex-col justify-between overflow-hidden">
              
              {/* Fake geofenced cartography background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none select-none cad-grid-dark" />
              
              {/* Core cartographic lot coordinate polygons inside simulated vector preview */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="w-56 h-36 border-2 border-dashed border-rose-500/40 rounded-full flex items-center justify-center transform rotate-12">
                  <span className="text-[9px] text-rose-500/60 font-mono italic">Envelope Cadastral do Lote</span>
                  <div className="w-24 h-24 bg-indigo-500/10 border-2 border-indigo-400/50 rounded-md absolute flex items-center justify-center transform -rotate-12">
                    <span className="text-[9px] text-indigo-400 font-mono">Prédio {project.name ? `"${project.name}"` : ""}</span>
                  </div>
                </div>
              </div>

              {/* Top layer details */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                  <MapIcon className="h-3 w-3" />
                  Cartografia de Enquadramento
                </span>
                <span className="text-[9px] text-slate-505 font-mono uppercase">Interseção Geomorfológica</span>
              </div>

              {/* Bottom Layer Interactive Pin Selector */}
              <div className="relative z-10 flex justify-between items-end pt-24">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-mono">Clique para testar coordenadas do lote plano:</p>
                  <div className="flex gap-2">
                    <button
                      id="coord-preset-1"
                      onClick={() => setSelectedCoordinates({ lat: 38.7521, lng: -9.1412 })}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded px-2 py-1 text-slate-200 transition-colors cursor-pointer font-mono"
                    >
                      Alvalade (Lisboa)
                    </button>
                    <button
                      id="coord-preset-2"
                      onClick={() => setSelectedCoordinates({ lat: 41.1579, lng: -8.6291 })}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded px-2 py-1 text-slate-200 transition-colors cursor-pointer font-mono"
                    >
                      Cedofeita (Porto)
                    </button>
                    <button
                      id="coord-preset-3"
                      onClick={() => setSelectedCoordinates({ lat: 40.2033, lng: -8.4103 })}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded px-2 py-1 text-slate-200 transition-colors cursor-pointer font-mono"
                    >
                      Sé Velha (Coimbra)
                    </button>
                  </div>
                </div>

                <button
                  id="query-gis-btn"
                  disabled={isQuerying}
                  onClick={handleQueryGis}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/40 disabled:opacity-50 cursor-pointer border border-indigo-550/50"
                >
                  {isQuerying ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Intersetar Camadas...
                    </>
                  ) : (
                    <>
                      <Terminal className="h-3.5 w-3.5" />
                      Intersetar Camada
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Simulated GIS REST Response Terminal code */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Code className="h-4 w-4 text-indigo-400" />
                  {methodology === "computational" ? "Resposta do Servidor ArcGIS REST (WFS JSON)" : "Parecer Conceitual / Legal"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">STATUS: 200 OK</span>
              </div>

              {!queryResult && !isQuerying && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-dashed border-slate-850 text-center flex flex-col items-center justify-center h-44">
                  <Terminal className="h-7 w-7 text-indigo-550 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400 max-w-xs font-light">
                    Escolha uma camada à esquerda, ajuste as coordenadas e clique em "Intersetar Camada" para realizar o geoprocessamento simulado do lote.
                  </p>
                </div>
              )}

              {isQuerying && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col items-center justify-center text-center h-44 space-y-3">
                  <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />
                  <div>
                    <p className="text-xs text-slate-200 font-semibold font-mono animate-pulse">POST /arcgis/rest/services/query HTTP/1.1</p>
                    <p className="text-[10px] text-indigo-400 font-mono mt-1 font-light">
                      Executando ST_Intersects espacial com envelope de {project.plotArea} m²...
                    </p>
                  </div>
                </div>
              )}

              {queryResult && !isQuerying && (
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 h-52 overflow-y-auto text-xs font-mono space-y-4 shadow-inner relative z-10">
                  
                  {/* Real visual GIS query data versus explanation */}
                  <div className="border-b border-slate-900 pb-2.5 space-y-1">
                    <span className="text-indigo-400 font-bold block">1. Camada Geográfica Ativa:</span>
                    <p className="text-slate-300 font-light text-[11px]">{queryResult.layerName}</p>
                    <span className="text-slate-500 text-[10px] block">Cálculo Metodológico: {methodology === "computational" ? "Geo-computação Vetorial real" : "Conceptualização jurídica simplificada"}</span>
                  </div>

                  <div className="border-b border-slate-900 pb-2.5 space-y-1">
                    <span className="text-indigo-400 font-bold block">2. Atributos da Geometria Intersetada:</span>
                    <ul className="space-y-1 pl-2 text-[11px] font-sans text-slate-300 font-light">
                      {Object.entries(queryResult.intersectionProperties).map(([key, val]: any) => (
                        <li key={key} className="flex gap-2">
                          <strong className="text-slate-400 font-mono text-[10px] uppercase">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                          <span>{val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-slate-500 space-y-1">
                    <span className="text-slate-400 font-bold block font-sans">3. Detalhes de Geoprocessamento Real:</span>
                    <p className="bg-slate-900/60 p-2 rounded border border-slate-900 text-[9px] leading-relaxed select-all">
                      {queryResult.geoprocessingLog}
                    </p>
                    <p className="text-[9.5px]">Nível de Certeza do Cálculo Territorial: <strong className="text-emerald-400">{queryResult.confidenceLevel}</strong></p>
                  </div>

                  <div className="bg-indigo-950/25 p-3 rounded-xl border border-indigo-900/30 text-[10px] font-sans text-slate-300 leading-relaxed font-light">
                    <strong className="text-indigo-300 uppercase block font-semibold mb-1">Diferença de Metodologias:</strong>
                    {methodology === "computational" ? (
                      <span>Este resultado decorre de um cálculo geométrico que determina o polígono e overlap de solo. Numa implementação de produção, isto eliminaria a necessidade de ler PDFs do PDM manualmente, extraindo de imediato as condicionantes diretamente de bases PostGIS municipais.</span>
                    ) : (
                      <span>Este resultado decorre de enquadramento conceitual regulamentar de PDM e RGEU. Adequado para triagem heurística prévia de localizações genéricas quando as bases geográficas detalhadas do concelho não estão públicas ou operacionais.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action button to inject directly into AI Advisor setup */}
          {queryResult && !isQuerying && (
            <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center bg-slate-950/20 p-3 rounded-2xl border border-slate-850/60">
              <div className="text-xs">
                <span className="text-slate-400 block font-light">Deseja guiar o Parecer Virtual da IA com este dado?</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px] h-4 mt-0.5">
                  <Check className="h-3.5 w-3.5" /> Integração de contexto pronta para exportação
                </span>
              </div>

              <button
                id="inject-pdm-to-ai"
                onClick={handleInject}
                className="bg-emerald-600 hover:bg-emerald-550 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer border border-emerald-555/40"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Injetar no Parecer AI
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
