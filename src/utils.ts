/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectParams, FeasibilityResult } from "./types";

export function calculateFeasibility(params: ProjectParams): FeasibilityResult {
  const {
    plotArea,
    customCOS,
    customCES,
    customPermeability,
    customMaxFloors,
    landCost,
    customBuildCost,
    customSalesPrice,
    avgUnitSize,
    efficiencyRatio,
    additionalCostsPct,
    parkingCostPerUnit,
    financialRatePct,
  } = params;

  // 1. Edificabilidade (Urban metrics)
  // Max footprint based on CES (Coeficiente de Implantação)
  const maxFootprint = plotArea * customCES;
  
  // Max gross construction area (ABC) based on COS (Coeficiente de Ocupação)
  const maxGrossArea = plotArea * customCOS;
  
  // Required Minimum Permeable Area (Espaço natural imaculado)
  const requiredNaturalArea = plotArea * customPermeability;

  // Real world ceiling check: 
  // Footprint * Max Floors cannot exceed max gross area, and vice-versa.
  // We calculate a realistic balance.
  const maxFloorsByHeight = customMaxFloors;
  const calculatedFloors = Math.min(
    maxFloorsByHeight,
    maxFootprint > 0 ? Math.ceil(maxGrossArea / maxFootprint) : 1
  );

  // Simple volume estimation in m3 (assuming 3.1 meters per structural floor)
  const buildingVolume = maxFootprint * calculatedFloors * 3.1;

  // Estimates of Fractions (Fogos / Apartamentos)
  const sellingArea = maxGrossArea * efficiencyRatio; // Private sellable area
  const estimatedFractions = Math.max(
    1,
    Math.floor(sellingArea / avgUnitSize)
  );

  // Parking requirement calculation in Portugal (RGEU & average municipal PDMs):
  // Typically: 1 place for sizes < 100m2, 1.5-2 for larger sizes, or on average
  // let's say 1 place per unit, plus some percentage of guest parking spaces
  const requiredParkingPlaces = Math.max(
    1,
    Math.round(estimatedFractions * 1.2)
  );

  // 2. Financial Calculations
  // Global building construction cost
  const buildCostGlobal = maxGrossArea * customBuildCost;
  
  // Cost to construct basement / structure parking places (internal/underground)
  const basementParkingCost = requiredParkingPlaces * parkingCostPerUnit;
  
  // Design, technical fees, environmental studies, and municipal licensing charges (taxas de urbanização TRIU, etc.)
  const projectFeesCost = buildCostGlobal * additionalCostsPct;

  // Total absolute construction cost
  const totalConstructionCost = buildCostGlobal + basementParkingCost + projectFeesCost;

  // Financial costs (interest of bank credit, developer risk fee)
  // Land cost + Construction cost factored by interest rate
  const financingCost = (landCost + totalConstructionCost) * (financialRatePct / 100);

  // Total required capital outlay / investment
  const totalInvestment = landCost + totalConstructionCost + financingCost;

  // Total Gross revenue or Estmated VGV (Valor Geral de Venda)
  const estimatedVGV = sellingArea * customSalesPrice;

  // Net promoter margin before income tax (Margem líquida antes de IRC)
  const netDeveloperMargin = estimatedVGV - totalInvestment;

  // Return on investment (ROI) or Margin ratio
  const roiPct = totalInvestment > 0 ? (netDeveloperMargin / totalInvestment) * 100 : 0;

  // Break-even price per private sellable m2
  const breakEvenPrice = sellingArea > 0 ? totalInvestment / sellingArea : 0;

  return {
    maxFootprint,
    maxGrossArea,
    requiredNaturalArea,
    maxFloorsByHeight,
    calculatedFloors,
    buildingVolume,
    estimatedFractions,
    requiredParkingPlaces,
    sellingArea,
    buildCostGlobal,
    basementParkingCost,
    projectFeesCost,
    totalConstructionCost,
    financingCost,
    totalInvestment,
    estimatedVGV,
    netDeveloperMargin,
    roiPct,
    breakEvenPrice,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: 1,
  }).format(value) + " m²";
}
