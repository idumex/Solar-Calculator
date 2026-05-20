import React from 'react';
import { 
  Sun, 
  Cpu, 
  Battery, 
  Home, 
  ArrowRight, 
  Activity, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';
import { SizingResult } from '../types';

interface InteractiveDiagramProps {
  result: SizingResult;
  selectedCity: string;
  systemVoltage: number;
}

export default function InteractiveDiagram({ result, selectedCity, systemVoltage }: InteractiveDiagramProps) {
  const {
    panelToInverterCable,
    inverterToBatteryCable,
    batteryBreakerAmps,
    solarBreakerAmps,
    acOutputBreakerAmps,
    minimumPanelCount,
    actualArrayWatts,
    batteryBankCount,
    seriesCount,
    parallelCount,
    singleBatteryAh,
    recommendedInverterKva,
    totalDailyWh,
    totalContinuousWatts,
    batteryTotalKwhNeeded,
    recommendedBatteryUnitLabel
  } = result;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden" id="diagram-section">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>

      {/* Decorative pulse line for energy */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-semibold">Single-Line Interactive Schematic</span>
            <h3 className="text-lg font-sans font-bold text-slate-100">Wiring, Cables &amp; Safety Breakers Layout</h3>
          </div>
          <div className="mt-2 sm:mt-0 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-amber-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-550"></span>
            </span>
            <span>{selectedCity} Solar Config</span>
          </div>
        </div>

        {/* Outer Flex System Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Node 1: Solar Panels Array */}
          <div className="md:col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center shadow-inner">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 mb-2 ring-1 ring-amber-500/20">
              <Sun className="h-6 w-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Solar PV Array</h4>
            <p className="text-xs text-slate-500 mt-0.5">{minimumPanelCount}x panels structure</p>
            <div className="mt-3 py-1 px-2.5 bg-slate-900 border border-slate-850 rounded text-amber-400 text-xs font-mono">
              {actualArrayWatts}W Array
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1">
              Voc: {(minimumPanelCount > 1 ? 41.5 * Math.min(3, minimumPanelCount) : 41.5).toFixed(0)}V DC
            </span>
          </div>

          {/* Connection Vector 1: Solar Cable + Solar Breaker */}
          <div className="md:col-span-3 flex flex-col items-center justify-center relative min-h-[140px]">
            {/* The Horizontal Line */}
            <div className="hidden md:block absolute left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 opacity-50"></div>
            
            {/* Cable Sizing Card */}
            <div className="relative z-10 w-full max-w-[200px] bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-center shadow-md">
              <span className="text-[9px] font-mono text-amber-500 uppercase tracking-wide font-semibold">PV TO INVERTER DC</span>
              <p className="text-xs font-mono font-bold text-slate-100 mt-1">
                {panelToInverterCable.sizeMm2}mm² Cable
              </p>
              <p className="text-[10px] text-slate-400 font-mono">({panelToInverterCable.gaugeAWG})</p>
              <div className="mt-2 py-0.5 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
                Loss: {panelToInverterCable.voltageDropPercent.toFixed(1)}% ({panelToInverterCable.voltageDropVolts.toFixed(2)}V)
              </div>
            </div>

            {/* Breaker Card in current line */}
            <div className="relative z-10 mt-3 bg-red-950/30 border border-red-500/30 rounded px-2 py-0.5 text-center flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping animate-pulse"></span>
              <span className="text-[10px] font-mono text-red-400 font-bold">PV Breaker: {solarBreakerAmps}A DC</span>
            </div>
          </div>

          {/* Node 2: The Core Power Inverter & MPPT Controller */}
          <div className="md:col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center shadow-inner relative">
            <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 mb-2 ring-1 ring-indigo-500/20 animate-pulse">
              <Cpu className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Hybrid Inverter</h4>
            <p className="text-xs text-slate-500 mt-0.5">MPPT Controller Built-in</p>
            <div className="mt-3 py-1 px-2.5 bg-slate-900 border border-slate-850 rounded text-indigo-400 text-xs font-mono font-bold">
              {recommendedInverterKva.toFixed(1)} kVA / {result.recommendedInverterKw.toFixed(1)} kW
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1">System DC: {systemVoltage}V</span>
          </div>

          {/* Connection Vector 2: Inverter to loads & Battery connection */}
          <div className="md:col-span-3 flex flex-col gap-6">
                        {/* Inverter-to-Battery Loop */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-md border-l-4 border-l-emerald-500 relative">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Battery Connection DC</span>
                <span className="bg-red-950/50 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono text-red-400 font-bold">
                  Fuse: {batteryBreakerAmps}A DC
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-100">
                Cable Size: {inverterToBatteryCable.sizeMm2}mm² 
                <span className="text-slate-500 ml-1 text-[10px]">({inverterToBatteryCable.gaugeAWG})</span>
              </p>
              <div className="mt-1 text-[10px] text-slate-500 font-mono leading-tight">
                Recommended heavy copper welding wire. Max Draw current: <span className="text-emerald-400 font-semibold">{inverterToBatteryCable.currentAmps.toFixed(0)}A</span>.
              </div>
            </div>

            {/* Inverter-to-AC loads breaker */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-md border-l-4 border-l-indigo-500">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">AC Output Load Loop</span>
                <span className="bg-indigo-950/50 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono text-indigo-400 font-bold">
                  Breaker: {acOutputBreakerAmps}A AC
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Single Phase 230V MCB</p>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">
                Protects distribution DB box. Limit: {(result.recommendedInverterKw * 1000 / 230).toFixed(1)}A max.
              </div>
            </div>

          </div>

        </div>

        {/* Sub bottom panel for Battery & Loads layout */}
        <div className="mt-6 border-t border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Node 3: Battery Bank Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 flex-shrink-0">
              <Battery className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Battery Storage Banks ({batteryTotalKwhNeeded.toFixed(1)} kWh)</h4>
              <p className="text-xs text-slate-400 mt-1">
                {batteryTotalKwhNeeded > 0 ? (
                  <>
                    <strong className="text-emerald-400 font-semibold block mb-0.5">{recommendedBatteryUnitLabel}</strong>
                    <span className="block text-[11px] text-slate-500 font-mono leading-normal">
                      Sized for selected environment profile. 
                      {batteryBankCount > 0 && ` Direct current equivalent: ${seriesCount} series × ${parallelCount} parallel (${batteryBankCount}x ${singleBatteryAh}Ah blocks).`}
                    </span>
                  </>
                ) : (
                  'No storage batteries recommended.'
                )}
              </p>
            </div>
          </div>

          {/* Node 4: AC Distribution Board */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 flex-shrink-0 animate-pulse">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">AC Household Distribution</h4>
              <p className="text-xs text-slate-400 mt-1">
                Distributes stabilized grid power to home loads.
                <span className="block text-[11px] text-slate-500 font-mono mt-0.5">
                  Daily Demand: <strong className="text-indigo-400 font-semibold">{(totalDailyWh / 1000).toFixed(2)} kWh</strong> / Continuous Load max: <strong className="text-amber-400 font-semibold">{totalContinuousWatts} Watts</strong>.
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Cable Alert Tip */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start shadow-sm">
          <ShieldAlert className="h-5 w-5 text-amber-550 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed font-sans">
            <strong className="text-white block font-semibold text-sm mb-1">Nigerian Copper Standards Warning:</strong>
            Use only <strong className="font-semibold text-amber-200">Pure Oxygen-Free Copper (OFC) Cables</strong> for battery and solar lines. Avoid low-quality Aluminum hybrid cables (CCA) which have much higher resistance, heat up rapidly, and double voltage drops, creating severe fire hazards in Nigerian tropical climates!
          </div>
        </div>

      </div>
    </div>
  );
}
