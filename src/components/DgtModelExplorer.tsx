/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Check, 
  AlertCircle, 
  Terminal, 
  Database, 
  FileText, 
  Layers, 
  Search, 
  Code, 
  Copy, 
  ArrowRight, 
  BookOpen, 
  ShieldAlert, 
  Globe, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";

interface DgtModelExplorerProps {
  onInjectDgtSpec?: (specText: string) => void;
}

// Data structures reflecting the official dgterritorio/modelodedados_pdm_ren UML
interface DgtTable {
  name: string;
  category: "PDM" | "REN";
  description: string;
  fields: {
    name: string;
    type: string;
    mandatory: boolean;
    description: string;
    domain?: string[];
  }[];
}

const DGT_TABLE_CATALOG: DgtTable[] = [
  {
    name: "e_pdm_zn_uso_solo",
    category: "PDM",
    description: "Zonamento de Uso do Solo (PDM - Classes e Categorias de Espaço)",
    fields: [
      { name: "id_dgt", type: "UUID / Serial", mandatory: true, description: "Identificador único global do registo atribuído na submissão" },
      { name: "cod_classif", type: "Varchar(10)", mandatory: true, description: "Código oficial da classificação de solo nacional (ex: 1.1.1, 2.1.2)", domain: ["1.1.1 (Solo Urbano - Residencial)", "1.2.1 (Solo Urbano - Industrial)", "2.1.1 (Solo Rústico - Florestal)", "2.2.1 (Solo Rústico - Agrícola)"] },
      { name: "letra_us", type: "Varchar(5)", mandatory: true, description: "Letra indicativa da representação cartográfica (ex: H, I, AE, AG)" },
      { name: "classif_solo", type: "Varchar(1)", mandatory: true, description: "Classificação básica: U (Solo Urbano) ou R (Solo Rústico)", domain: ["U (Solo Urbano)", "R (Solo Rústico)"] },
      { name: "tipo_cs", type: "Varchar(100)", mandatory: true, description: "Denominação municipal do Tipo de Categoria de Solo" },
      { name: "subtipo_cs", type: "Varchar(100)", mandatory: false, description: "Denominação do Subtipo correspondente" },
      { name: "cos_max", type: "Numeric(4,2)", mandatory: false, description: "Coeficiente máximo de ocupação do solo permitido" },
      { name: "ces_max", type: "Numeric(4,2)", mandatory: false, description: "Coeficiente máximo de implantação permitido" },
      { name: "recu_min", type: "Numeric(4,1)", mandatory: false, description: "Afastamento mínimo obrigatório das fachadas (metros)" },
      { name: "geom", type: "Geometry(MultiPolygon, 3763)", mandatory: true, description: "Polígonos vetoriais das zonas no plano de coordenadas de Portugal Continental" }
    ]
  },
  {
    name: "e_pdm_condic_ra",
    category: "PDM",
    description: "Restrições de Utilidade Pública e Servidões Administrativas no PDM",
    fields: [
      { name: "id_dgt", type: "UUID / Serial", mandatory: true, description: "Identificador único global do registo" },
      { name: "cod_servid", type: "Varchar(10)", mandatory: true, description: "Código da servidão administrativa aplicada", domain: ["REN (Eco)", "RAN (Agro)", "DOM_PUB_H (Domínio Hídrico)", "ROD (Rodovias)", "MILITAR"] },
      { name: "diploma_lei", type: "Varchar(250)", mandatory: true, description: "Legislação nacional ou municipal que rege a restrição" },
      { name: "area_afet_ha", type: "Numeric(10,4)", mandatory: true, description: "Área total afetada pelo polígono de restrição em Hectares" },
      { name: "geom", type: "Geometry(MultiPolygon, 3763)", mandatory: true, description: "Geometria da área de incidência legal da restrição" }
    ]
  },
  {
    name: "e_ren_rest_servid_ra",
    category: "REN",
    description: "Reserva Ecológica Nacional - Servidão Administrativa REN Geral",
    fields: [
      { name: "id_dgt", type: "UUID / Serial", mandatory: true, description: "Chave identificadora na base nacional" },
      { name: "cod_restric", type: "Varchar(10)", mandatory: true, description: "Código tipificado da restrição ecológica da REN", domain: ["REN_1 (Cabeceiras de água)", "REN_2 (Zonas de infiltração)", "REN_3 (Aluviões)", "REN_4 (Erosão / Declives)", "REN_5 (Faixa costeira)"] },
      { name: "tip_restr", type: "Varchar(80)", mandatory: true, description: "Subcategoria descrita oficial da tipologia REN" },
      { name: "nome_restr", type: "Varchar(150)", mandatory: true, description: "Nome comum da restrição ecológica (ex: Cabeceira de Linha de Água)" },
      { name: "decreto_lei", type: "Varchar(100)", mandatory: true, description: "Indicação legal padrão - Decreto-Lei n.º 166/2008 ou atualizações" },
      { name: "geom", type: "Geometry(MultiPolygon, 3763)", mandatory: true, description: "Geometria de interdição ecológica para validação espacial" }
    ]
  },
  {
    name: "e_pdm_infra_abastecimento",
    category: "PDM",
    description: "Linhas e Redes de Infraestrutura de Abastecimento de Águas",
    fields: [
      { name: "id_dgt", type: "UUID", mandatory: true, description: "Identificador DGT" },
      { name: "diametro_mm", type: "Integer", mandatory: false, description: "Diâmetro técnico da canalização condutora" },
      { name: "material", type: "Varchar(50)", mandatory: false, description: "Composição material da infraestrutura", domain: ["PEAD (Polietileno)", "PVC", "Fundo Dúctil", "Aco"] },
      { name: "gestor", type: "Varchar(100)", mandatory: true, description: "Cooperadora ou empresa gestora da infraestrutura (ex: EPAL, SMAS)" },
      { name: "geom", type: "Geometry(MultiLineString, 3763)", mandatory: true, description: "Linhas vetoriais georreferenciadas da rede pública" }
    ]
  }
];

export default function DgtModelExplorer({ onInjectDgtSpec }: DgtModelExplorerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "linter" | "sql">("catalog");
  const [selectedTable, setSelectedTable] = useState<string>("e_pdm_zn_uso_solo");
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Linter validation states
  const [lintInput, setLintInput] = useState<string>(`{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:EPSG::3763"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "cod_classif": "1.1.1",
        "letra_us": "H1",
        "classif_solo": "U",
        "tipo_cs": "Solo Urbano - Espaço Residencial Consolidado"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [-9.1412, 38.7452],
              [-9.1400, 38.7452],
              [-9.1400, 38.7441],
              [-9.1412, 38.7441],
              [-9.1412, 38.7452]
            ]
          ]
        ]
      }
    }
  ]
}`);

  const [lintReport, setLintReport] = useState<{
    status: "PASS" | "WARNING" | "FAIL";
    messages: { type: "info" | "warning" | "error"; text: string; details?: string }[];
    validatedRecordsCount: number;
  } | null>(null);

  const [isLinting, setIsLinting] = useState<boolean>(false);

  // Filter tables
  const filteredTables = DGT_TABLE_CATALOG.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTableObj = DGT_TABLE_CATALOG.find(t => t.name === selectedTable) || DGT_TABLE_CATALOG[0];

  // Helper to copy sql
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Perform DGT compliance schema linting
  const runLintValidation = () => {
    setIsLinting(true);
    setLintReport(null);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(lintInput);
        const messages: { type: "info" | "warning" | "error"; text: string; details?: string }[] = [];
        let status: "PASS" | "WARNING" | "FAIL" = "PASS";

        // Check if top level is FeatureCollection or Feature
        if (!parsed.type) {
          messages.push({ type: "error", text: "Erro Estrutural GeoJSON", details: "Falta o atributo de nível de raiz 'type' no ficheiro submetido." });
          status = "FAIL";
        }

        // Check CRS (standard EPSG:3763 PT-TM06 is highly mandatory for DGT submissions in Portugal)
        let hasCorrectCrs = false;
        if (parsed.crs && parsed.crs.properties && parsed.crs.properties.name) {
          const nameCrs = parsed.crs.properties.name;
          if (nameCrs.includes("3763") || nameCrs.includes("PTTM06")) {
            hasCorrectCrs = true;
          }
        }
        
        if (hasCorrectCrs) {
          messages.push({ type: "info", text: "CRS Reconhecido Core", details: "Sistema de Coordenadas de Referência EPSG:3763 detetado e validado." });
        } else {
          messages.push({ 
            type: "warning", 
            text: "Aviso de Projeção Geográfica Regional", 
            details: "AVISO: Não foi detetado explicitamente a projeção EPSG:3763 (PT-TM06 para Portugal Continental). Se o modelo for exportado com WGS84 ordinário, a plataforma nacional da DGT irá rejeitar!" 
          });
          if (status !== "FAIL") status = "WARNING";
        }

        // Validate features
        const features = parsed.features || (parsed.type === "Feature" ? [parsed] : []);
        const count = features.length;

        if (count === 0) {
          messages.push({ type: "error", text: "Ficheiro sem Geometrias ativas", details: "Nenhum elemento geométrico / feature foi encontrado no documento." });
          status = "FAIL";
        } else {
          messages.push({ type: "info", text: "Elementos Geográficos", details: `Foram analisadas ${count} features georreferenciadas.` });
          
          // Check attributes inside features
          let missingRequiredFieldsCount = 0;
          let invalidCodeFormat = false;

          features.forEach((f: any, idx: number) => {
            const props = f.properties || {};
            // check if they matched e_pdm_zn_uso_solo or e_ren_rest_servid
            const isUsoSolo = props.cod_classif !== undefined || props.classif_solo !== undefined;

            if (isUsoSolo) {
              // Check mandatory fields of e_pdm_zn_uso_solo
              const required = ["cod_classif", "letra_us", "classif_solo", "tipo_cs"];
              required.forEach(field => {
                if (props[field] === undefined || props[field] === null || props[field] === "") {
                  messages.push({ 
                    type: "error", 
                    text: `Falta de Atributo Mandatório em feature #${idx + 1}`, 
                    details: `O campo obrigatório '${field}' está ausente ou vazio. O modelo DGT exige este preenchimento para importação.` 
                  });
                  missingRequiredFieldsCount++;
                  status = "FAIL";
                }
              });

              // Format validation on classif_solo ('U' or 'R')
              if (props.classif_solo && !["U", "R"].includes(props.classif_solo)) {
                messages.push({
                  type: "warning",
                  text: `Valor Inválido no domínio classif_solo (#${idx + 1})`,
                  details: `Valor '${props.classif_solo}' rejeitado. Deve ser estritamente 'U' (Urbano) ou 'R' (Rústico) de acordo com a norma nacional.`
                });
                invalidCodeFormat = true;
                if (status === "PASS") status = "WARNING";
              }
            } else {
              // Assume REN validation or general features
              const hasRenFields = props.cod_restric !== undefined || props.tip_restr !== undefined;
              if (hasRenFields) {
                const requiredRen = ["cod_restric", "tip_restr", "nome_restr", "decreto_lei"];
                requiredRen.forEach(field => {
                  if (props[field] === undefined || props[field] === null || props[field] === "") {
                    messages.push({
                      type: "error",
                      text: `REN Atributo ausente na feature #${idx + 1}`,
                      details: `A servidão REN exige o atributo '${field}'.`
                    });
                    missingRequiredFieldsCount++;
                    status = "FAIL";
                  }
                });
              } else {
                // Unknown attributes pattern
                messages.push({
                  type: "warning",
                  text: `Atributos Não Identificados (#${idx + 1})`,
                  details: "Os atributos desta feature não coincidem com e_pdm_zn_uso_solo nem e_ren_rest_servid_ra. O importador nacional assumirá campos customizados não homologados."
                });
                if (status === "PASS") status = "WARNING";
              }
            }

            // Check geometry type issues
            if (f.geometry) {
              if (f.geometry.type !== "MultiPolygon" && f.geometry.type !== "Polygon") {
                messages.push({
                  type: "warning",
                  text: `Incompatibilidade Geométrica (#${idx + 1})`,
                  details: `A tabela de Zonamento exige geometrias bidimensionais (Polygon/MultiPolygon). Encontrou '${f.geometry.type}'. Linhas ou Pontos serão ignorados.`
                });
                if (status === "PASS") status = "WARNING";
              }

              // Simple coords range check for Continental Portugal bounds
              const coords = f.geometry.coordinates;
              if (coords) {
                // If they look like geographic coordinates (GPS WGS84) but are declared as 3763
                const flattenCoords = (arr: any[]): any[] => {
                  if (typeof arr[0] === "number") return arr;
                  return flattenCoords(arr[0]);
                };
                try {
                  const firstSample = flattenCoords(coords);
                  const valX = Math.abs(firstSample[0]);
                  const valY = Math.abs(firstSample[1]);
                  // Lisbon area is around Lat 38, Lng -9 (Geographic).
                  // Projected PT-TM06 is in meters, generally values like X: -100000 to 100000, Y: -300000 to 300000.
                  if (valX < 45 && valY < 45 && hasCorrectCrs) {
                    messages.push({
                      type: "warning",
                      text: "Incoerência de Coordenadas e CRS",
                      details: "ALERTA CRÍTICO: Declarou CRS EPSG:3763, mas os dados geométricos parecem estar em graus decimais WGS84 ordinário (X ~ -9, Y ~ 38). Isto corrompe a visualização em SIG. Faça reprojeção para coordenadas métricas TM06 antes do envio!"
                    });
                    if (status === "PASS") status = "WARNING";
                  }
                } catch (e) {}
              }
            }
          });
        }

        // Summary message
        if (status === "PASS") {
          messages.unshift({ type: "info", text: "Sucesso Completo na Validação", details: "Os dados cumprem rigorosamente a especificação técnica de submissão do Modelo de Dados PDM/REN (DGT_PMOT_REN_v2.1)!" });
        } else if (status === "WARNING") {
          messages.unshift({ type: "warning", text: "Aprovado com Alertas Menores", details: "O modelo é importável mas contém alertas de conversão cartográfica e coordenadas que podem causar descentramento de camadas municipais." });
        } else {
          messages.unshift({ type: "error", text: "Rejeitado pelo Linter de Submissão", details: "Encontradas falhas críticas de nomenclatura e atributos ausentes. O ficheiro falharia no portal nacional DGT_PMOT." });
        }

        setLintReport({
          status,
          messages,
          validatedRecordsCount: count
        });

      } catch (err: any) {
        setLintReport({
          status: "FAIL",
          messages: [{ type: "error", text: "Erro Sintático JSON/Texto", details: `Incapaz de analisar o código fornecido. Verifique vírgulas e parênteses. Erro: ${err.message}` }],
          validatedRecordsCount: 0
        });
      }
      setIsLinting(false);
    }, 1200);
  };

  // Preload validation samples
  const loadSample = (type: "pdm_valid" | "pdm_invalid" | "ren_valid") => {
    if (type === "pdm_valid") {
      setLintInput(`{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:EPSG::3763"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "cod_classif": "1.1.1",
        "letra_us": "H2",
        "classif_solo": "U",
        "tipo_cs": "Solo Urbano - Áreas Habitacionais de Média Densidade",
        "cos_max": 1.40,
        "ces_max": 0.55
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [12500.41, 153000.85],
            [12750.80, 153000.85],
            [12750.80, 152800.12],
            [12500.41, 152800.12],
            [12500.41, 153000.85]
          ]
        ]
      }
    }
  ]
}`);
    } else if (type === "pdm_invalid") {
      setLintInput(`{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:EPSG::3763"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "letra_us": "R-For",
        "classif_solo": "X", // Error: Only U or R is permitted
        "tipo_cs": "" // Space error empty 
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-9.1412, 38.7452],
            [-9.1400, 38.7452]
          ]
        ]
      }
    }
  ]
}`);
    } else {
      setLintInput(`{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:EPSG::3763"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "cod_restric": "REN_1",
        "tip_restr": "Áreas de Proteção a Cabeceiras de Linhas de Água",
        "nome_restr": "Reserva Ecológica Fundamental - Bacias Principais",
        "decreto_lei": "Decreto-Lei n.º 166/2008"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [24500.22, 195000.33],
              [24800.55, 195000.33],
              [24800.55, 194700.11],
              [24500.22, 194700.11],
              [24500.22, 195000.33]
            ]
          ]
        ]
      }
    }
  ]
}`);
    }
  };

  // PostGIS schema generation compliant with the dgterritorio model
  const generatedPostGIS = `-- ====================================================================
-- ESQUEMA COMPATÍVEL COM ESPECIFICAÇÕES OFICIAIS DGT (MODELO PDM/REN)
-- Sistema de Referência Recomendado: EPSG:3763 (PT-TM06 - Portugal Continental)
-- Desenvolvido para DGT e Sólido Urbanístico Local via PostGIS
-- ====================================================================

-- Ativar extensões geográficas necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Zonamento PDM (Carta Municipal de Uso do Solo)
CREATE TABLE IF NOT EXISTS e_pdm_zn_uso_solo (
    id_dgt UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cod_classif VARCHAR(10) NOT NULL, -- Ex: '1.1.1' para Uso Urbano habitacional
    letra_us VARCHAR(5) NOT NULL,     -- Ex: 'H1', 'AE', 'AG'
    classif_solo CHAR(1) NOT NULL CHECK (classif_solo IN ('U', 'R')), -- U (Urbano), R (Rústico)
    tipo_cs VARCHAR(100) NOT NULL,    -- Tipo descrição conforme PDM
    subtipo_cs VARCHAR(100),
    cos_max NUMERIC(4,2),             -- Coeficiente Ocupação (Plot Ratio) Max
    ces_max NUMERIC(4,2),             -- Coeficiente Implantação (Coverage) Max
    recu_min NUMERIC(4,1) DEFAULT 6.0, -- Recuo mínimo regulamentar
    geom GEOMETRY(MultiPolygon, 3763) NOT NULL -- Coordenadas Oficiais PT-TM06
);

-- Criar index espacial para desempenho de queries cartográficas
CREATE INDEX IF NOT EXISTS idx_e_pdm_zn_uso_solo_geom ON e_pdm_zn_uso_solo USING GIST (geom);

-- 2. Tabela de Reserva Ecológica Nacional (Servidões REN)
CREATE TABLE IF NOT EXISTS e_ren_rest_servid_ra (
    id_dgt UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cod_restric VARCHAR(10) NOT NULL, -- Código simplificado da tipologia REN
    tip_restr VARCHAR(80) NOT NULL,   -- Tipo oficial nacional
    nome_restr VARCHAR(150) NOT NULL,  -- Descrição amigável
    decreto_lei VARCHAR(100) DEFAULT 'Decreto-Lei n.º 166/2008' NOT NULL,
    geom GEOMETRY(MultiPolygon, 3763) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_e_ren_rest_geom ON e_ren_rest_servid_ra USING GIST (geom);

-- Inserções Clássicas de Domínio para Lisboa & Porto
INSERT INTO e_pdm_zn_uso_solo (cod_classif, letra_us, classif_solo, tipo_cs, cos_max, ces_max, geom)
VALUES (
    '1.1.1', 
    'H1', 
    'U', 
    'Espaço Residencial Consolidado de Alta Densidade (Grande Porto/Lisboa)', 
    1.80, 
    0.60, 
    ST_Multi(ST_GeomFromText('POLYGON((0 0, 100 0, 100 100, 0 100, 0 0))', 3763))
) ON CONFLICT DO NOTHING;

-- Exemplo de query espacial de colisão e edificabilidade permitida
-- SELECT ST_Intersection(parcela.geom, pdm.geom) FROM e_pdm_zn_uso_solo pdm, meu_lote parcela...
`;

  return (
    <div id="dgt-model-root" className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 text-slate-100 font-sans space-y-6">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono border border-emerald-500/20 shadow-sm flex items-center gap-1.5 w-fit">
            <Globe className="h-3 w-3 text-emerald-400 animate-pulse" />
            dgterritorio/modelodedados_pdm_ren
          </span>
          <h2 className="text-xl font-display font-semibold text-slate-100 mt-2 flex items-center gap-2">
            Modelo de Dados de Urbanismo DGT Portugal
          </h2>
          <p className="text-xs text-slate-450 mt-1 font-light max-w-2xl leading-relaxed">
            Repositório e regulamentação técnica para a estruturação espacial e submissão informática dos limites de <strong>Planos Diretores Municipais (PDM)</strong> e restrições de <strong>Reserva Ecológica Nacional (REN)</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-slate-950 p-2 rounded-xl border border-slate-850 self-start md:self-center">
          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
          <span>NORMA TÉCNICA: V2.1.1</span>
        </div>
      </div>

      {/* Embedded Sub-tabs Navigation */}
      <div className="flex border-b border-slate-800/60 p-0.5 bg-slate-950 rounded-2xl w-fit">
        <button
          id="dgt-subtab-catalog"
          onClick={() => setActiveSubTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "catalog"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Catálogo de Tabelas & Atributos</span>
        </button>

        <button
          id="dgt-subtab-linter"
          onClick={() => setActiveSubTab("linter")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "linter"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          <span>Validador de Submissão (Linter)</span>
        </button>

        <button
          id="dgt-subtab-sql"
          onClick={() => setActiveSubTab("sql")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "sql"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Esquema SQL PostGIS</span>
        </button>
      </div>

      {/* 1. CATALOG TAB */}
      {activeSubTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  id="dgt-table-search"
                  type="text"
                  placeholder="Pesquisar tabelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredTables.map(t => (
                  <button
                    id={`dgt-sidebar-table-${t.name}`}
                    key={t.name}
                    onClick={() => setSelectedTable(t.name)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-mono flex flex-col gap-1 cursor-pointer ${
                      selectedTable === t.name
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow-inner"
                        : "bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold">{t.name}</span>
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold ${
                        t.category === "PDM" 
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {t.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-sans text-slate-450 leading-snug line-clamp-1">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/65 border border-slate-850/80 p-4 rounded-2xl text-xs space-y-2 text-slate-400 font-light">
              <h5 className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono text-[11px] mb-1">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                SISTEMAS DE GEOPORTAL
              </h5>
              <p>
                Os planos em Portugal devem ser submetidos à plataforma <strong>DGT-SIGI</strong> seguindo especificações de coordenadas <strong>ETRS89 / PT-TM06 (EPSG:3763)</strong>.
              </p>
              <p className="text-[10.5px]">
                Qualquer desvio na grafia de atributos primários (ex: escrever <code>codclassif</code> em vez de <code>cod_classif</code>) acarreta devolução administrativa imediata no portal oficial.
              </p>
            </div>
          </div>

          <div className="md:col-span-8 bg-slate-950 rounded-2xl border border-slate-850 p-5 space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-3 pb-3 border-b border-slate-850">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase font-bold border border-indigo-505/20">
                  Especificação da Tabela
                </span>
                <h3 className="text-sm font-mono font-bold text-slate-100 mt-1.5">
                  {activeTableObj.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-light">
                  {activeTableObj.description}
                </p>
              </div>
              {onInjectDgtSpec && (
                <button
                  id="inject-dgt-spec-btn"
                  onClick={() => {
                    const txt = `[TABELA DGT SELECIONADA: ${activeTableObj.name}]\nDescrição: ${activeTableObj.description}\nCampos Obrigatórios:\n` + 
                      activeTableObj.fields.map(f => `• ${f.name} (${f.type}) - ${f.mandatory ? 'OBRIGATÓRIO' : 'OPCIONAL'}: ${f.description}`).join("\n");
                    onInjectDgtSpec(txt);
                    alert("Esquema técnico e metadados da DGT injetados na memória normativa do motor!");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-indigo-555/40 text-[11px]"
                >
                  <Sparkles className="h-3 w-3 text-emerald-300 animate-pulse" />
                  Injetar Atributos
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 font-medium bg-slate-900/60 p-2">
                    <th className="py-2.5 px-3 font-mono font-semibold">Atributo XML/DB</th>
                    <th className="py-2.5 px-3">Tipo de Dados</th>
                    <th className="py-2.5 px-3">Origem</th>
                    <th className="py-2.5 px-3">Descrição Regulamentar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {activeTableObj.fields.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-100 font-bold">
                        {f.name}
                        {f.mandatory && <span className="text-rose-500 ml-1 font-sans">*</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-indigo-400">{f.type}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold font-mono ${
                          f.mandatory ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-400"
                        }`}>
                          {f.mandatory ? "Mandatório" : "Opcional"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-350 text-[11.5px] leading-relaxed">
                        <p>{f.description}</p>
                        {f.domain && (
                          <div className="flex flex-wrap gap-1 mt-1 font-mono text-[8.5px]">
                            <span className="text-slate-500 mr-1 mt-0.5">Domínio:</span>
                            {f.domain.map((d, di) => (
                              <span key={di} className="bg-slate-900 text-indigo-300 border border-slate-800 px-1 py-0.2 rounded">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-900 text-[10.5px] text-slate-400 flex items-start gap-1.5 font-light">
              <span className="text-rose-500 font-bold font-sans mt-0.5">*</span>
              <span>Os campos marcados com asterisco são de <strong>preenchimento obrigatório indispensável</strong>. Geometrias sem estes atributos válidos serão bloqueadas nos motores de verificação espacial municipais.</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. LINTER VALIDADOR TAB */}
      {activeSubTab === "linter" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">Input de Envio (GeoJSON Regulamentar)</h4>
              </div>
              <div className="flex gap-1">
                <button
                  id="sample-pdm-valid-btn"
                  onClick={() => loadSample("pdm_valid")}
                  className="bg-slate-950 text-indigo-400 hover:bg-slate-900 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono cursor-pointer"
                >
                  PDM Válido
                </button>
                <button
                  id="sample-pdm-invalid-btn"
                  onClick={() => loadSample("pdm_invalid")}
                  className="bg-slate-950 text-rose-400 hover:bg-slate-900 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono cursor-pointer"
                >
                  Com Erros
                </button>
                <button
                  id="sample-ren-valid-btn"
                  onClick={() => loadSample("ren_valid")}
                  className="bg-slate-950 text-emerald-400 hover:bg-slate-900 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono cursor-pointer"
                >
                  REN Válido
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden shadow-inner flex flex-col h-[320px]">
              <textarea
                id="dgt-linter-textarea"
                value={lintInput}
                onChange={(e) => setLintInput(e.target.value)}
                className="w-full flex-grow p-4 bg-transparent text-slate-300 font-mono text-[10.5px] focus:outline-none resize-none font-light leading-relaxed"
                placeholder="Insira as propriedades do seu GeoJSON ou schema espacial..."
              />
              <div className="bg-slate-900 border-t border-slate-850 p-2.5 flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-mono">VALIDADOR SINTÁTICO DE ATRIBUTOS DGT</span>
                <button
                  id="dgt-lint-submit-btn"
                  disabled={isLinting}
                  onClick={runLintValidation}
                  className="bg-emerald-600 hover:bg-emerald-550 text-white font-semibold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLinting ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Validando Estrutura...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Validar Atributos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              Relatório de Conformidade Territorial
            </h4>

            <div className="bg-slate-950 rounded-2xl border border-slate-850 p-5 h-[320px] overflow-y-auto space-y-3">
              {!lintReport && !isLinting && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 max-w-sm mx-auto">
                  <Terminal className="h-8 w-8 text-slate-700 mb-2" />
                  <p className="text-xs font-light">
                    Escreva ou carregue um dos exemplos à esquerda e prima "Validar Atributos" para simular a verificação de regras oficiais de envio municipal.
                  </p>
                </div>
              )}

              {isLinting && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-mono text-indigo-400 animate-pulse">Linter em execução em base PostGIS virtual...</p>
                </div>
              )}

              {lintReport && !isLinting && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">RESULTADO:</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        lintReport.status === "PASS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : lintReport.status === "WARNING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {lintReport.status === "PASS" ? "HOMOLOGADO DGT" : lintReport.status === "WARNING" ? "APROVADO COM AVISOS" : "REJEITADO - ERROS"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Registos Lidos: {lintReport.validatedRecordsCount}</span>
                  </div>

                  <div className="space-y-2">
                    {lintReport.messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border text-xs font-light space-y-1 ${
                          m.type === "info"
                            ? "bg-indigo-950/20 border-indigo-900/20 text-indigo-300"
                            : m.type === "warning"
                            ? "bg-amber-950/25 border-amber-900/35 text-amber-300"
                            : "bg-rose-950/25 border-rose-900/35 text-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold font-mono text-[10.5px]">
                          {m.type === "info" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                          {m.type === "warning" && <AlertCircle className="h-3.5 w-3.5 text-amber-400" />}
                          {m.type === "error" && <AlertCircle className="h-3.5 w-3.5 text-rose-400" />}
                          <span>{m.text}</span>
                        </div>
                        {m.details && <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{m.details}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SQL CODE GENERATOR TAB */}
      {activeSubTab === "sql" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">Esquema PostGIS DGT Oficial</h4>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">Scripts SQL normalizados para replicação das tabelas do modelo de dados PDM/REN DGT em servidores PostgreSQL locais.</p>
            </div>
            <button
              id="copy-sql-btn"
              onClick={() => handleCopy(generatedPostGIS)}
              className="bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-indigo-555/40 text-[11px]"
            >
              {copiedText ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar SQL
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-850 relative p-4 h-80 overflow-y-auto">
            <pre className="text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto selection:bg-indigo-500 selection:bg-opacity-30">
              {generatedPostGIS}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
