/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Helper function to lazy-initialize GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Configure it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 2. API: Feasibility Report Generation using Gemini AI
app.post("/api/gemini/feasibility-report", async (req: express.Request, res: express.Response) => {
  try {
    const { project, results, uploadedPdmText, uploadedPdmPdfBase64 } = req.body;

    if (!project || !results) {
      res.status(400).json({ error: "Parâmetros do projeto ou resultados em falta." });
      return;
    }

    const ai = getGenAI();

    const promptMessage = `
Faça uma análise de viabilidade urbanística preliminar em Portugal com base nos seguintes dados técnicos do projeto:

CONTEÚDO DO PROJETO:
- Nome do Projeto: ${project.name}
- Tipo de Projeto: ${project.projectType || "residential"} (Nota: se for 'agricultural', trata-se de um Apoio Agrícola / armazém rústico sob regras de exploração agrícola de solo rústico em Portugal)
- Localização/Município: ${project.municipalityId}
- Área do Terreno: ${project.plotArea} m²
- Custo de Aquisição do Terreno: ${project.landCost} €
- Índice de Ocupação do Solo (COS / Plot Ratio): ${project.customCOS} (utilizado pelo PDM)
- Índice de Implantação (CES / Coverage Ratio): ${project.customCES}
- Coeficiente de Permeabilidade Mínima: ${project.customPermeability} (exemplo: 0.3 = 30% do solo deve ser permeável)
- Número Máximo de Pisos Permitido: ${project.customMaxFloors}
- Custo de Construção Unitário: ${project.customBuildCost} €/m²
- Preço de Venda Médio Estimado: ${project.customSalesPrice} €/m²
- Área Média das Frações (Apartamentos): ${project.avgUnitSize} m² privativos
- Eficiência de Área Bruta/Venda: ${project.efficiencyRatio * 100}%

RESULTADOS DE EDIFICABILIDADE E ECONÓMICOS CALCULADOS:
- Área de Implantação Máxima: ${results.maxFootprint} m²
- Área Bruta de Construção Máxima (ABC): ${results.maxGrossArea} m²
- Espaço Natural/Permeável Obrigatório: ${results.requiredNaturalArea} m²
- Número Estimado de Frações (Fogos): ${results.estimatedFractions} unidades
- Lugares de Estacionamento Estimados: ${results.requiredParkingPlaces} lugares
- Área Útil/Privativa de Venda Total: ${results.sellingArea} m²
- Investimento Total (incluindo terreno, obras, projetos, taxas e custos financeiros): ${results.totalInvestment} €
- Receita Bruta Estimada (VGV / Gross Development Value): ${results.estimatedVGV} €
- Margem Líquida do Promotor: ${results.netDeveloperMargin} €
- Rentabilidade Estimada (ROI): ${results.roiPct.toFixed(2)} %
- Preço de Equilíbrio (Break-Even): ${results.breakEvenPrice.toFixed(2)} €/m²

Por favor, assuma o papel de um Arquiteto e Perito em Direito Urbanístico Português (experiente com o PDM, RGEU, RJUE e o 'Simplex Urbanístico' - Decreto-Lei n.º 10/2024). Analise estes números de modo crítico e profissional, fornecendo as conclusões num formato estruturado JSON.
`;

    let finalPrompt = promptMessage;
    if (uploadedPdmText) {
      finalPrompt += `

EXCERTO DE REGULAMENTO / PDM CARREGADO PELO UTILIZADOR COMO BASE NORMATIVA ADICIONAL:
---
${uploadedPdmText}
---
Por favor, considere as exigências, índices ou exceções descritas neste documento/excerto regulatório de forma prioritária sobre os parâmetros típicos, e valide minuciosamente se o estudo está conforme o mesmo.
`;
    }

    const contents: any[] = [];
    if (uploadedPdmPdfBase64) {
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: uploadedPdmPdfBase64
        }
      });
      contents.push({
        text: `${finalPrompt}

Por favor, consulte o documento PDF do PDM / regulamento anexo e use as suas regras (coeficientes, afastamentos, cérceas, etc.) para esta análise preliminar de viabilidade de forma rigorosa. Avalie compatibilidade com o Simplex DL 10/2024.`
      });
    } else {
      contents.push({
        text: finalPrompt
      });
    }

    const systemInstruction = `
Você é um perito sénior em consultoria de viabilidade e licenciamento urbanístico em Portugal.
Analise os parâmetros fornecidos e retorne obrigatoriamente um objeto JSON com o seguinte formato exato:
{
  "summary": "Resumo geral descritivo e direto do potencial e desafios do projeto em português comercial sofisticado.",
  "strengths": ["Lista de 3-4 pontos fortes específicos do projeto (ex: alta eficiência, preço de aquisição atrativo, excelente margem, etc.)"],
  "risks": ["Lista de 3-4 riscos de relevo (ex: risco de infiltrações/permeabilidade crítica, excesso de pisos para a zona, break-even elevado, etc.)"],
  "regulatoryWarnings": ["Lista de avisos regulamentares considerando em particular o RGEU, as regras de estacionamento, acessibilidades Decreto-Lei 163/2006, as normas do PDM/ficheiro regulador anexo se disponível, e o Simplex Urbanístico Decreto-Lei 10/2024 em Portugal."],
  "designRecommendations": ["Dicas de arquitetura para otimizar a implantação, fachadas, ventilação natural, ou aproveitamento de áreas coletivas."],
  "feasibilityRating": "Excelente" | "Viável com Condições" | "Risco Elevado" | "Inviável",
  "suggestedOptimizations": "Texto corrido propondo alterações nos parâmetros (como reduzir a área média para T1/T2 ou renegociar o valor do terreno) para melhorar a rentabilidade ou o sucesso do licenciamento com base nos regulamentos."
}

Certifique-se de que a resposta seja exclusivamente em JSON estruturado de acordo com essa especificação, sem envolver o JSON em blocos markdown de código adicionais (retorne no formato aplicação/json limpo). Usar o idioma Português de Portugal.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "strengths", "risks", "regulatoryWarnings", "designRecommendations", "feasibilityRating", "suggestedOptimizations"],
          properties: {
            summary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            regulatoryWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            designRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            feasibilityRating: {
              type: Type.STRING,
              description: "Valor entre: Excelente, Viável com Condições, Risco Elevado, Inviável"
            },
            suggestedOptimizations: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    const reportData = JSON.parse(jsonText.trim());
    res.json(reportData);

  } catch (error: any) {
    console.error("Gemini Feasibility Report Generator Error:", error);
    res.status(500).json({
      error: error.message || "Erro interno ao processar a análise com Inteligência Artificial."
    });
  }
});

// 3. API: GeoAnalystBench Spatial Reasoning Benchmark Solver
app.post("/api/gemini/geo-analyst-bench", async (req: express.Request, res: express.Response) => {
  try {
    const { taskId, question, expectedAnswer, extraContext } = req.body;

    if (!taskId || !question) {
      res.status(400).json({ error: "Parâmetros do benchmark insuficientes." });
      return;
    }

    const ai = getGenAI();

    const systemInstruction = `
Você é um motor de Inteligência Artificial de elite testado no referencial GeoAnalystBench para validação de capacidades SIG (Sistemas de Informação Geográfica), cálculos espaciais e competência eclesiástica/jurídica de solos em Portugal.
Analise a questão SIG indicada de forma extremamente matemática e precisa. Responda num objeto JSON estrito com o formato abaixo:
{
  "modelAnswer": "Sua resposta final curta e incisiva à questão.",
  "reasoningSteps": "Explicação detalhada passo a passo e lógica dedutiva matemática/geofencing.",
  "spatialFormulas": "Principais funções espaciais PostGIS ou fórmulas geométricas de referência mundial aplicáveis (ex: ST_Contains, ST_Distance, ST_Transform, etc.)",
  "portugueseStandard": "Referúncia legal portuguesa ou convenção de Engenharia Geográfica correspondente."
}

Seja extremamente objetivo. Retorne apenas o JSON. Idioma: Português de Portugal.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
QUESTÃO SIG DA BATERIA GEOANALYSTBENCH:
---
${question}
---
${extraContext ? `CONTEXTO ADICIONAL DO PROJETO:\n${extraContext}\n` : ""}
Responda de forma rigorosa, analisando a precisão geográfica e resolvendo matematicamente.
`,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["modelAnswer", "reasoningSteps", "spatialFormulas", "portugueseStandard"],
          properties: {
            modelAnswer: { type: Type.STRING },
            reasoningSteps: { type: Type.STRING },
            spatialFormulas: { type: Type.STRING },
            portugueseStandard: { type: Type.STRING }
          }
        }
      }
    });

    const bodyText = response.text || "{}";
    res.json(JSON.parse(bodyText.trim()));

  } catch (error: any) {
    console.error("GeoAnalystBench Solver Error:", error);
    res.status(500).json({
      error: error.message || "Erro no processamento do GeoAnalystBench solver."
    });
  }
});

// 4. API: GeoBenchX Earth Observation and Remote Sensing VQA Solver
app.post("/api/gemini/geo-bench-x", async (req: express.Request, res: express.Response) => {
  try {
    const { taskId, category, question, satelliteMetadata } = req.body;

    if (!taskId || !question) {
      res.status(400).json({ error: "Parâmetros do benchmark GeoBenchX insuficientes." });
      return;
    }

    const ai = getGenAI();

    const systemInstruction = `
Você é um motor especialista em Sensoriamento Remoto, Processamento Digital de Imagem (PDI) e Observação da Terra (Earth Observation), testado no referencial GeoBenchX do repositório de IA espacial solirinai/geobenchx.
Analise a questão e os metadados do canal de satélite (como bandas multiespectrais Sentinel-2 ou Landsat, índices NDVI/NDWI, cobertura de nuvens, DEM/declives) e forneça uma resposta extremamente qualificada técnica e cientificamente.

Retorne obrigatoriamente um objeto JSON estrito com a seguinte estrutura:
{
  "analyzedClass": "Classificação final proposta, ex: Água, Solo Exposto, Floresta Densa, Área Urbana Consolidada, etc.",
  "confidencePct": 92.5,
  "spectralReview": "Explicação física fundamentada com base nos comprimentos de onda das bandas descritas (Red, NIR, SWIR, etc.) ou na morfologia da imagem.",
  "justification": "Argumentação científica rigorosa para a resposta final à pergunta.",
  "suggestedWorkflow": "Melhor pipeline do QGIS/SAGA ou script Python/GEE (Google Earth Engine) para mapear esta feição na prática."
}

Mantenha a resposta concisa, científica, exata e estritamente no formato json. Idioma: Português de Portugal.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
TAREFA GEOBENCHX - SENSORIAMENTO REMOTO & CLASSIFICAÇÃO:
---
Categoria: ${category}
Questão: ${question}
Metadados de Satélite Fornecidos: ${JSON.stringify(satelliteMetadata || {})}
---
Resolva e classifique com base na teoria de transferência radiativa de alvos e assinaturas espectrais de solo/vegetação/relevo.
`,
      config: {
        systemInstruction,
        temperature: 0.15,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["analyzedClass", "confidencePct", "spectralReview", "justification", "suggestedWorkflow"],
          properties: {
            analyzedClass: { type: Type.STRING },
            confidencePct: { type: Type.NUMBER },
            spectralReview: { type: Type.STRING },
            justification: { type: Type.STRING },
            suggestedWorkflow: { type: Type.STRING }
          }
        }
      }
    });

    const bodyText = response.text || "{}";
    res.json(JSON.parse(bodyText.trim()));

  } catch (error: any) {
    console.error("GeoBenchX Solver Error:", error);
    res.status(500).json({
      error: error.message || "Erro no processamento do GeoBenchX solver."
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Urban Data Lab] Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
