/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MunicipalityPreset {
  id: string;
  name: string;
  district: string;
  typicalCOS: number; // Coeficiente de Ocupação do Solo (Plot Ratio)
  typicalCES: number; // Coeficiente de Implantação do Solo (Ground Coverage)
  typicalPermeability: number; // % Mínima de permeabilidade (0.2 - 0.5)
  avgBuildCost: number; // €/m2 construction cost
  avgSalesPrice: number; // €/m2 sales price (residential)
  parkingRequirement: string; // Typical rule (e.g., "1.5 places per residential fraction" or "1 place per 100m2")
  typicalMaxFloors: number;
}

export interface ProjectParams {
  id: string;
  name: string;
  municipalityId: string;
  customCOS: number;
  customCES: number;
  customPermeability: number;
  customMaxFloors: number;
  plotArea: number; // m2
  landCost: number; // €
  customBuildCost: number; // €/m2
  customSalesPrice: number; // €/m2
  avgUnitSize: number; // average m2 per apartment
  efficiencyRatio: number; // m2 selling space / m2 global gross space (typically 0.8 - 0.85 due to corridors)
  additionalCostsPct: number; // Fees, design, licensing % (typically 12%)
  parkingCostPerUnit: number; // construction of basement parkings € / place (typically 15000)
  financialRatePct: number; // financing / capital cost % (typically 8%)
  dateCreated: string;
  projectType?: "residential" | "agricultural";
}

export interface FeasibilityResult {
  maxFootprint: number; // m2 (Plot * CES)
  maxGrossArea: number; // m2 (Plot * COS)
  requiredNaturalArea: number; // m2 (Plot * Permeability)
  maxFloorsByHeight: number; // floors
  calculatedFloors: number; // actual suggested
  buildingVolume: number; // m3 estimation
  estimatedFractions: number; // total apartments (maxGrossArea * efficiencyRatio / avgUnitSize)
  requiredParkingPlaces: number; // estimated
  
  // Financial metrics
  sellingArea: number; // maxGrossArea * efficiencyRatio
  buildCostGlobal: number; // maxGrossArea * customBuildCost
  basementParkingCost: number; // requiredParkingPlaces * parkingCostPerUnit
  projectFeesCost: number; // buildCostGlobal * additionalCostsPct
  totalConstructionCost: number; // buildGlobal + parking + fees
  financingCost: number; // (landCost + totalConstructionCost) * financialRatePct
  totalInvestment: number; // landCost + totalConstructionCost + financingCost
  estimatedVGV: number; // sellingArea * customSalesPrice
  netDeveloperMargin: number; // estimatedVGV - totalInvestment
  roiPct: number; // (netDeveloperMargin / totalInvestment) * 100
  breakEvenPrice: number; // totalInvestment / sellingArea (€/m2 sellable)
}

export interface AiReportResponse {
  summary: string;
  strengths: string[];
  risks: string[];
  regulatoryWarnings: string[];
  designRecommendations: string[];
  feasibilityRating: "Excelente" | "Viável com Condições" | "Risco Elevado" | "Inviável";
  suggestedOptimizations: string;
}
