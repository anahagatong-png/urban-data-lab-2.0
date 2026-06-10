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

export const PORTUGAL_MUNICIPALITIES: MunicipalityPreset[] = [
  {
    id: "lisboa",
    name: "Lisboa (Parque das Nações / Alvalade)",
    district: "Lisboa",
    typicalCOS: 1.8,
    typicalCES: 0.6,
    typicalPermeability: 0.3,
    avgBuildCost: 1950,
    avgSalesPrice: 5500,
    parkingRequirement: "1.5 lugares por fogo > T1, 1 lugar por fogo T0/T1",
    typicalMaxFloors: 6,
  },
  {
    id: "lisboa_historico",
    name: "Lisboa (Centro Histórico / Alfama)",
    district: "Lisboa",
    typicalCOS: 2.2,
    typicalCES: 0.85,
    typicalPermeability: 0.15,
    avgBuildCost: 2200,
    avgSalesPrice: 6500,
    parkingRequirement: "Isento ou pago em taxa de compensação municipal",
    typicalMaxFloors: 4,
  },
  {
    id: "porto",
    name: "Porto (Foz do Douro / Boavista)",
    district: "Porto",
    typicalCOS: 1.4,
    typicalCES: 0.5,
    typicalPermeability: 0.35,
    avgBuildCost: 1850,
    avgSalesPrice: 4800,
    parkingRequirement: "1 a 2 lugares por fogo dependendo da tipologia",
    typicalMaxFloors: 5,
  },
  {
    id: "porto_cedofeita",
    name: "Porto (Centro / Cedofeita)",
    district: "Porto",
    typicalCOS: 1.8,
    typicalCES: 0.7,
    typicalPermeability: 0.2,
    avgBuildCost: 1750,
    avgSalesPrice: 3900,
    parkingRequirement: "1 lugar por cada 120m2 de área bruta privada",
    typicalMaxFloors: 4,
  },
  {
    id: "braga",
    name: "Braga (S. Víctor / Centro)",
    district: "Braga",
    typicalCOS: 1.2,
    typicalCES: 0.45,
    typicalPermeability: 0.4,
    avgBuildCost: 1300,
    avgSalesPrice: 2400,
    parkingRequirement: "1 lugar por fogo (mínimo)",
    typicalMaxFloors: 6,
  },
  {
    id: "faro",
    name: "Faro (Montenegro / Gambelas)",
    district: "Faro",
    typicalCOS: 0.9,
    typicalCES: 0.4,
    typicalPermeability: 0.45,
    avgBuildCost: 1550,
    avgSalesPrice: 3200,
    parkingRequirement: "1 lugar por fogo + estacionamento público adicional",
    typicalMaxFloors: 3,
  },
  {
    id: "aveiro",
    name: "Aveiro (Glória e Vera Cruz)",
    district: "Aveiro",
    typicalCOS: 1.3,
    typicalCES: 0.5,
    typicalPermeability: 0.35,
    avgBuildCost: 1400,
    avgSalesPrice: 2800,
    parkingRequirement: "1.2 lugares de estacionamento privado por fogo",
    typicalMaxFloors: 5,
  },
  {
    id: "coimbra",
    name: "Coimbra (Sé Nova / Celas)",
    district: "Coimbra",
    typicalCOS: 1.1,
    typicalCES: 0.4,
    typicalPermeability: 0.45,
    avgBuildCost: 1350,
    avgSalesPrice: 2300,
    parkingRequirement: "1 lugar por fogo ou 1 por 150m2 de construção",
    typicalMaxFloors: 4,
  },
];

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
