/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Maximize2, Move, Sun, Layers, HelpCircle, Compass } from "lucide-react";

interface CadSandboxProps {
  plotArea: number; // m2
  ces: number; // ground coverage ratio
  maxFloors: number;
  calculatedFloors: number;
  permeability: number;
}

export default function CadSandbox({
  plotArea,
  ces,
  maxFloors,
  calculatedFloors,
  permeability,
}: CadSandboxProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(1.2); // width / depth
  const [frontOffset, setFrontOffset] = useState<number>(6); // meters
  const [sideOffset, setSideOffset] = useState<number>(3); // meters
  const [rearOffset, setRearOffset] = useState<number>(5); // meters
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [sunAngle, setSunAngle] = useState<number>(135); // Sun azimuth for shadow projection
  const [sunElevation, setSunElevation] = useState<number>(35); // Sun elevation 0-90 degrees

  // Calculate the lot dimensions based on area and aspect ratio
  // Area = Width * Depth => Aspect = Width / Depth => Width = Aspect * Depth
  // Area = Aspect * Depth^2 => Depth = sqrt(Area / Aspect)
  const depth = Math.sqrt(plotArea / aspectRatio);
  const width = aspectRatio * depth;

  // Scale factor to map meters to SVG pixels (max bounding box 320x240)
  const pad = 25;
  const canvasWidth = 360;
  const canvasHeight = 280;
  
  const scaleX = (canvasWidth - pad * 2) / width;
  const scaleY = (canvasHeight - pad * 2) / depth;
  const scale = Math.min(scaleX, scaleY);

  // Scaled dimensions of the outer boundaries
  const svgLotWidth = width * scale;
  const svgLotHeight = depth * scale;
  const originX = (canvasWidth - svgLotWidth) / 2;
  const originY = (canvasHeight - svgLotHeight) / 2;

  // Maximum physical footprint permitted by CES: FootprintArea = plotArea * ces
  const maxFootprintArea = plotArea * ces;

  // Actual buildable box after custom offsets constraint
  // Effective building width = LotWidth - 2 * sideOffset
  // Effective building depth = LotHeight - frontOffset - rearOffset
  const effBuildWidth = Math.max(0, width - sideOffset * 2);
  const effBuildDepth = Math.max(0, depth - frontOffset - rearOffset);
  const effArea = effBuildWidth * effBuildDepth;

  // Standard footprint size is the minimum of (maxFootprintArea, effective buildable area after setbacks)
  const activeFootprintArea = Math.min(maxFootprintArea, effArea);
  
  // Calculate a proportional rectangle inside the buildable envelope that matches activeFootprintArea
  let finalBuildWidth = effBuildWidth;
  let finalBuildDepth = effBuildDepth;

  if (effArea > 0 && activeFootprintArea < effArea) {
    const scaleFactor = Math.sqrt(activeFootprintArea / effArea);
    finalBuildWidth = effBuildWidth * scaleFactor;
    finalBuildDepth = effBuildDepth * scaleFactor;
  }

  // Position of building footprint (center it horizontally in buildable zone, adjust with offsets)
  const buildOffsetX = sideOffset + (effBuildWidth - finalBuildWidth) / 2;
  const buildOffsetY = frontOffset + (effBuildDepth - finalBuildDepth) / 2;

  // Calculate shadow vector based on sun position and height
  const bldgHeightMeters = calculatedFloors * 3.1;
  const shadowLength = sunElevation > 0 ? bldgHeightMeters / Math.tan((sunElevation * Math.PI) / 180) : 0;
  // Map Shadow angle (azimuth)
  const radAngle = (sunAngle * Math.PI) / 180;
  const shadowDX = Math.sin(radAngle) * shadowLength * scale;
  const shadowDY = Math.cos(radAngle) * shadowLength * scale;

  // Percentage of lot filled with actual building footprint
  const actualCesPct = (activeFootprintArea / plotArea) * 100;
  // Natural permeable area (usually plotArea - actualFootprint, minimum required is plotArea * permeability)
  const actualPermeabilityArea = Math.max(0, plotArea - activeFootprintArea);
  const actualPermeabilityPct = (actualPermeabilityArea / plotArea) * 100;
  const isPermeabilityViolated = actualPermeabilityPct < (permeability * 100);

  return (
    <div id="cad-sandbox-container" className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800/80 flex flex-col h-full font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Maximize2 className="h-5 w-5 font-bold" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wider">Simulador Volumétrico CAD</h3>
            <p className="text-xs text-slate-400 font-light">Afastamentos, Implantação e Sombras projetadas</p>
          </div>
        </div>

        {/* View mode buttons */}
        <div className="flex gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            id="view-2d-btn"
            onClick={() => setViewMode("2d")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "2d" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Planta 2D
          </button>
          <button
            id="view-3d-btn"
            onClick={() => setViewMode("3d")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "3d" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Volumetria 3D
          </button>
        </div>
      </div>

      {/* Main CAD Viewer Panel */}
      <div className="flex-1 min-h-[280px] bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center cad-grid-dark border border-slate-850/60">
        
        {/* Cardinal orientation marker */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800 text-[10px] text-slate-400 font-mono">
          <Compass className="h-3 w-3 text-indigo-400 animate-pulse" />
          <span>NORTE 🡡</span>
        </div>

        {viewMode === "2d" ? (
          /* SVG LOT PLAN RENDERER */
          <svg className="w-full max-w-[360px] h-[280px]" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
            {/* Legend grids */}
            <defs>
              <pattern id="perm-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
                <line x1="0" y1="6" x2="6" y2="0" stroke="#10b981" strokeWidth="0.8" opacity="0.4" />
              </pattern>
              <pattern id="bldg-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
                <line x1="0" y1="0" x2="8" y2="0" stroke="#6366f1" strokeWidth="1" opacity="0.2" />
              </pattern>
            </defs>

            {/* Render the surrounding natural layout box */}
            <rect
              x={originX}
              y={originY}
              width={svgLotWidth}
              height={svgLotHeight}
              fill="url(#perm-pattern)"
              stroke="#e11d48"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />

            {/* Highlight outer limits label */}
            <text
              x={originX + 5}
              y={originY + 14}
              fontSize="9"
              className="fill-rose-400 font-mono tracking-tight"
            >
              Estrema do Lote ({width.toFixed(1)}m x {depth.toFixed(1)}m)
            </text>

            {/* Setbacks Visual Guides (Inner envelope boundaries) */}
            {effBuildWidth > 0 && effBuildDepth > 0 && (
              <rect
                x={originX + sideOffset * scale}
                y={originY + frontOffset * scale}
                width={effBuildWidth * scale}
                height={effBuildDepth * scale}
                fill="none"
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            )}

            {/* Offset dimension labels inside the lot */}
            {/* Frontal (Afastamento Frontal) */}
            <line
              x1={originX + svgLotWidth / 2}
              y1={originY}
              x2={originX + svgLotWidth / 2}
              y2={originY + frontOffset * scale}
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
            <text
              x={originX + svgLotWidth / 2 + 4}
              y={originY + (frontOffset * scale) / 2 + 3}
              fontSize="8"
              className="fill-rose-450 font-mono"
            >
              Frente: {frontOffset}m
            </text>

            {/* Lateral offset */}
            <line
              x1={originX}
              y1={originY + svgLotHeight / 2}
              x2={originX + sideOffset * scale}
              y2={originY + svgLotHeight / 2}
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
            <text
              x={originX + 3}
              y={originY + svgLotHeight / 2 - 4}
              fontSize="8"
              className="fill-rose-450 font-mono"
            >
              Lat: {sideOffset}m
            </text>

            {/* Rear offset */}
            <line
              x1={originX + svgLotWidth / 2}
              y1={originY + svgLotHeight}
              x2={originX + svgLotWidth / 2}
              y2={originY + svgLotHeight - rearOffset * scale}
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
            <text
              x={originX + svgLotWidth / 2 + 4}
              y={originY + svgLotHeight - (rearOffset * scale) / 2 + 3}
              fontSize="8"
              className="fill-rose-450 font-mono"
            >
              Post: {rearOffset}m
            </text>

            {/* Actual Building Footprint Block */}
            {finalBuildWidth > 0 && finalBuildDepth > 0 ? (
              <g className="transition-all duration-300">
                {/* Visual shadow under footprint */}
                <rect
                  x={originX + (buildOffsetX + 1.5) * scale}
                  y={originY + (buildOffsetY + 1.5) * scale}
                  width={finalBuildWidth * scale}
                  height={finalBuildDepth * scale}
                  fill="#000000"
                  opacity="0.4"
                  rx="2"
                />
                
                {/* Active construction footprint */}
                <rect
                  x={originX + buildOffsetX * scale}
                  y={originY + buildOffsetY * scale}
                  width={finalBuildWidth * scale}
                  height={finalBuildDepth * scale}
                  fill="url(#bldg-pattern)"
                  stroke="#818cf8"
                  strokeWidth="2"
                  rx="2"
                />

                {/* Footprint center text summary */}
                <text
                  x={originX + (buildOffsetX + finalBuildWidth / 2) * scale}
                  y={originY + (buildOffsetY + finalBuildDepth / 2) * scale}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  className="fill-indigo-300 font-mono"
                >
                  ABC Impl.
                </text>
                <text
                  x={originX + (buildOffsetX + finalBuildWidth / 2) * scale}
                  y={originY + (buildOffsetY + finalBuildDepth / 2) * scale + 11}
                  textAnchor="middle"
                  fontSize="9"
                  className="fill-indigo-400 font-mono"
                >
                  {activeFootprintArea.toFixed(0)}m²
                </text>
              </g>
            ) : (
              <text
                x={canvasWidth / 2}
                y={canvasHeight / 2}
                textAnchor="middle"
                fontSize="11"
                className="fill-rose-400 font-medium"
              >
                Setbacks excedem a área do lote!
              </text>
            )}
          </svg>
        ) : (
          /* AXONOMETRIC 3D DIGITAL VOLUMETRIC CONTAINER */
          <div className="w-full h-full flex flex-col justify-between p-4 relative">
            <div className="flex-1 flex items-center justify-center">
              <svg className="w-full max-w-[340px] h-[200px]" viewBox="0 0 340 200">
                {/* Isometric coordinate helper block */}
                <g transform="translate(170, 160)">
                  {/* Grid base representing lot ground plane */}
                  <polygon
                    points="-110,0 0,-55 110,0 0,55"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="1"
                    opacity="0.7"
                  />

                  {/* Lot Golden Outline in Angle */}
                  <polygon
                    points="-105,0 0,-52.5 105,0 0,52.5"
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                  />

                  {/* Natural ground green grass shade */}
                  <polygon
                    points="-105,0 0,-52.5 105,0 0,52.5"
                    fill="#10b981"
                    opacity="0.1"
                  />

                  {/* Shadow Cast Simulation Layer */}
                  {finalBuildWidth > 0 && finalBuildDepth > 0 && sunElevation > 0 && (
                    <polygon
                      points={`
                        ${-45 + shadowDX},${-15 - shadowDY} 
                        ${45 + shadowDX},${-15 - shadowDY} 
                        ${0 + shadowDX},${25 - shadowDY} 
                        ${-90 + shadowDX},${25 - shadowDY}
                      `}
                      fill="#000000"
                      opacity="0.55"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* 3D Volumetric Extruded Floor Levels Stack */}
                  {finalBuildWidth > 0 && finalBuildDepth > 0 && (
                    <g className="transition-all duration-300">
                      {Array.from({ length: Math.max(1, calculatedFloors) }).map((_, i) => {
                        const floorHeight = 16; // Visual pixels per floor
                        const currentY = -i * floorHeight;

                        return (
                          <g key={i} className="transition-all duration-300">
                            {/* FLOOR VOLUME BLOCK */}
                            {/* Front Left Wall */}
                            <polygon
                              points={`-60,${currentY} 0,${currentY + 30} 0,${currentY + 30 - floorHeight} -60,${currentY - floorHeight}`}
                              fill={i % 2 === 0 ? "#312e81" : "#1e1b4b"}
                              stroke="#4f46e5"
                              strokeWidth="0.8"
                            />
                            {/* Front Right Wall */}
                            <polygon
                              points={`0,${currentY + 30} 60,${currentY} 60,${currentY - floorHeight} 0,${currentY + 30 - floorHeight}`}
                              fill={i % 2 === 0 ? "#4338ca" : "#3730a3"}
                              stroke="#4f46e5"
                              strokeWidth="0.8"
                            />
                            {/* Roof/Slab Plane */}
                            <polygon
                              points={`-60,${currentY - floorHeight} 0,${currentY + 30 - floorHeight} 60,${currentY - floorHeight} 0,${currentY - 30 - floorHeight}`}
                              fill="#6366f1"
                              stroke="#818cf8"
                              strokeWidth="1"
                              opacity="0.9"
                            />

                            {/* Windows Mockup Lines */}
                            <line x1="-40" y1={currentY + 12 - floorHeight} x2="-40" y2={currentY + 18 - floorHeight} stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />
                            <line x1="-20" y1={currentY + 18 - floorHeight} x2="-20" y2={currentY + 24 - floorHeight} stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />
                            <line x1="20" y1={currentY + 18 - floorHeight} x2="20" y2={currentY + 24 - floorHeight} stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />
                            <line x1="40" y1={currentY + 12 - floorHeight} x2="40" y2={currentY + 18 - floorHeight} stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />

                            {/* Floor Tag text on the top floor only */}
                            {i === calculatedFloors - 1 && (
                              <g transform={`translate(0, ${currentY - floorHeight - 12})`}>
                                <rect x="-24" y="-8" width="48" height="13" fill="#0f172a" rx="3" stroke="#818cf8" strokeWidth="0.8" />
                                <text x="0" y="2" textAnchor="middle" fontSize="7" fontWeight="bold" className="fill-indigo-300 font-mono">
                                  {calculatedFloors} PISOS
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  )}
                </g>
              </svg>
            </div>

            {/* Sun Shadow Projection Controls Panel */}
            <div className="bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold font-display text-xs text-slate-100">
                  <Sun className="h-3.5 w-3.5 text-amber-400 rotate-12" />
                  Estudo de Heliofania
                </span>
                <span className="text-[9px] text-slate-500 font-mono">SOMBRA RGEU</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Azimute:</span>
                    <span className="text-indigo-400 font-bold">{sunAngle}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={sunAngle}
                    onChange={(e) => setSunAngle(Number(e.target.value))}
                    className="h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Elevação:</span>
                    <span className="text-indigo-400 font-bold">{sunElevation}°</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={sunElevation}
                    onChange={(e) => setSunElevation(Number(e.target.value))}
                    className="h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER PARAMETER CONTROLS FOR BLUEPRINT */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3">
        <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
          Ajustes de Planta & Afastamentos
        </span>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <label className="text-[10px] text-slate-550 font-bold uppercase tracking-wider text-center">Frente (m)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={frontOffset}
              onChange={(e) => setFrontOffset(Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-indigo-500 mt-1"
            />
          </div>
          <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <label className="text-[10px] text-slate-550 font-bold uppercase tracking-wider text-center">Lateral (m)</label>
            <input
              type="number"
              min="0"
              max="15"
              value={sideOffset}
              onChange={(e) => setSideOffset(Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-indigo-500 mt-1"
            />
          </div>
          <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <label className="text-[10px] text-slate-550 font-bold uppercase tracking-wider text-center">Tardoz (m)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={rearOffset}
              onChange={(e) => setRearOffset(Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-indigo-500 mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-slate-950/30 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">Relação de Forma do Terreno:</span>
            <span className="font-mono text-indigo-400 font-bold">{aspectRatio.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
            <span>Estreito / Profundo</span>
            <span>Regular</span>
            <span>Largo</span>
          </div>
        </div>

        {/* Real-time regulatory compliance indicators for active lot layout */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Implantação Eficaz</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-display font-medium text-indigo-300">
                {actualCesPct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                limite {(ces * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className={`p-3 rounded-2xl border flex flex-col ${
            isPermeabilityViolated 
              ? "bg-rose-950/20 border-rose-900/40" 
              : "bg-emerald-950/20 border-emerald-900/40"
          }`}>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Permeabilidade</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-sm font-display font-medium ${
                isPermeabilityViolated ? "text-rose-400" : "text-emerald-400"
              }`}>
                {actualPermeabilityPct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                mín. {(permeability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
