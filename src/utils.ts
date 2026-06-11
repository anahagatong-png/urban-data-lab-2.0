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
    projectType,
  } = params;

  const isAgricultural = projectType === "agricultural";

  // 1. Edificabilidade (Urban metrics)
  // Max footprint based on CES (Coeficiente de Implantação). 
  // Note: For agricultural support buildings, municipalities typically cap the maximum footprint 
  // (e.g. usually capped at 200-300 m² for typical farms, or 1% of the plot area, unless it's a major agro-industrial exploration).
  // Let's implement a realistic Portuguese PDM index rule which caps it.
  const rawFootprint = plotArea * customCES;
  const maxFootprint = isAgricultural 
    ? Math.min(rawFootprint, Math.max(50, plotArea * 0.02, 300)) // Cap based on land scale
    : rawFootprint;
  
  // Max gross construction area (ABC) based on COS (Coeficiente de Ocupação)
  const maxGrossArea = isAgricultural 
    ? maxFootprint // Support buildings are 1 single floor, so gross construction area equals footprint
    : plotArea * customCOS;
  
  // Required Minimum Permeable Area (Espaço natural imaculado)
  const requiredNaturalArea = plotArea * customPermeability;

  // Real world ceiling check: 
  // Footprint * Max Floors cannot exceed max gross area, and vice-versa.
  // We calculate a realistic balance.
  const maxFloorsByHeight = isAgricultural ? 1 : customMaxFloors;
  const calculatedFloors = isAgricultural ? 1 : Math.min(
    maxFloorsByHeight,
    maxFootprint > 0 ? Math.ceil(maxGrossArea / maxFootprint) : 1
  );

  // Simple volume estimation in m3 (assuming 4.2 meters for agricultural barns, 3.1 for structural floor)
  const bldgHeight = isAgricultural ? 4.2 : 3.1;
  const buildingVolume = maxFootprint * calculatedFloors * bldgHeight;

  // Estimates of Fractions (Fogos / Apartamentos or Support spaces)
  const sellingArea = isAgricultural ? maxGrossArea : maxGrossArea * efficiencyRatio; // Private sellable or usable area
  const estimatedFractions = isAgricultural ? 1 : Math.max(
    1,
    Math.floor(sellingArea / avgUnitSize)
  );

  // Parking requirement calculation in Portugal:
  // Agricultural buildings are usually exempt from structural basement parking. 
  // Only 1 machinery/tractor loading bay/space is required on average.
  const requiredParkingPlaces = isAgricultural ? 1 : Math.max(
    1,
    Math.round(estimatedFractions * 1.2)
  );

  // 2. Financial Calculations
  // Global building construction cost
  const buildCostGlobal = maxGrossArea * customBuildCost;
  
  // Cost to construct basement / structure parking places (internal/underground)
  const basementParkingCost = isAgricultural ? 0 : requiredParkingPlaces * parkingCostPerUnit;
  
  // Design, technical fees, environmental studies, and municipal licensing charges
  const projectFeesCost = buildCostGlobal * additionalCostsPct;

  // Total absolute construction cost
  const totalConstructionCost = buildCostGlobal + basementParkingCost + projectFeesCost;

  // Financial costs (interest of bank credit, developer risk fee)
  // Land cost + Construction cost factored by interest rate
  const financingCost = (landCost + totalConstructionCost) * (financialRatePct / 100);

  // Total required capital outlay / investment
  const totalInvestment = landCost + totalConstructionCost + financingCost;

  // Total Gross revenue or Estimated VGV / Valuation.
  // For agricultural support, customSalesPrice acts as the estimated land valuation multiplier per constructed m2.
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
