import { 
  CityInfo, 
  LoadItem, 
  CalculatorSettings, 
  SizingResult, 
  CableRecommendation 
} from '../types';
import { NIGERIA_CITIES } from '../data/nigeriaCities';

// Standard Copper electrical resistivity at normal operating temp (ohm * mm2 / m)
const COPPER_RESISTIVITY = 0.0175;

// Standard wire cross sections commonly available in Nigeria (mm2)
const STANDARD_CABLE_SIZES = [4, 6, 10, 16, 25, 35, 50, 70, 95, 120];

// Safe air/enclosure continuous ampacity for flexible copper cables
const CABLE_AMPACITY: Record<number, number> = {
  4: 30,
  6: 40,
  10: 55,
  16: 80,
  25: 110,
  35: 140,
  50: 180,
  70: 230,
  95: 290,
  120: 350
};

// AWG labels for representation
const CABLE_AWG: Record<number, string> = {
  4: '12 AWG',
  6: '10 AWG',
  10: '8 AWG',
  16: '6 AWG',
  25: '4 AWG',
  35: '2 AWG',
  50: '1/0 AWG',
  70: '2/0 AWG',
  95: '3/0 AWG',
  120: '4/0 AWG'
};

/**
 * Standard DC circuit breaker sizes available in Nigeria
 */
const STANDARD_DC_BREAKERS = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 150, 200, 250, 300, 400];

/**
 * Standard AC circuit breaker sizes
 */
const STANDARD_AC_BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80];

export function findNextStandardRating(calculatedVal: number, ratingList: number[]): number {
  for (const rating of ratingList) {
    if (rating >= calculatedVal) {
      return rating;
    }
  }
  return ratingList[ratingList.length - 1];
}

export function calculateSolarSystem(
  loads: LoadItem[],
  settings: CalculatorSettings
): SizingResult {
  const city = NIGERIA_CITIES.find(c => c.name === settings.selectedCityName) || NIGERIA_CITIES[0];
  const psh = city.peakSunHours;

  // 1. Calculate Load parameters
  let totalDailyWh = 0;
  let totalContinuousWatts = 0;
  let peakSurgeWatts = 0;

  for (const load of loads) {
    const dailyWh = load.watts * load.quantity * load.hoursPerDay;
    totalDailyWh += dailyWh;

    const continuousPower = load.watts * load.quantity;
    totalContinuousWatts += continuousPower;

    const surgePower = load.watts * load.quantity * Math.max(1, load.surgeFactor);
    peakSurgeWatts += surgePower;
  }

  // Adjust peakSurgeWatts: if no loads have surge, make it at least continuous load
  if (peakSurgeWatts < totalContinuousWatts) {
    peakSurgeWatts = totalContinuousWatts;
  }

  // 2. Solar Panel Options & Array Sizing
  // Overall system charge efficiency derating (covers panel tilt, dirty panels, cable line losses, charge controller efficiency).
  // A standard 0.8 is typical.
  const lossFactor = 1.25; // Inverse of 80%
  const targetRequiredDailyWh = totalDailyWh * lossFactor;
  
  // Array Watts = Daily Watt-hours needed / Peak Sun Hours
  const requiredSolarWatts = targetRequiredDailyWh / psh;

  const minimumPanelCount = Math.max(1, Math.ceil(requiredSolarWatts / settings.panelSizeWatts));
  const actualArrayWatts = minimumPanelCount * settings.panelSizeWatts;

  // 3. Inverter Sizing
  // Standard rule: Inverter should handle continuous load comfortably, and cover peaks.
  // Standard power factor is 0.8.
  let recommendedInverterKw = totalContinuousWatts * 1.25; // 25% safety overhead
  // Inverters can handle short surges (often 2x rated capacity). So we also budget for surge / 2.
  if (peakSurgeWatts / 2 > recommendedInverterKw) {
    recommendedInverterKw = peakSurgeWatts / 2;
  }
  
  // Clamp lower limit for inverter to say 0.5kW for small installations
  if (recommendedInverterKw < 500 && totalContinuousWatts > 0) {
    recommendedInverterKw = 500;
  } else if (totalContinuousWatts === 0) {
    recommendedInverterKw = 0;
  }

  const recommendedInverterKva = recommendedInverterKw / 0.8 / 1000; // VA conversion and kVA division

  // 4. Battery Bank Sizing
  // Chemistry coefficients:
  let dod = settings.batteryDepthOfDischarge;
  let batteryEfficiency = 0.85; // Default for Gel
  if (settings.batteryChemistry === 'lithium') {
    batteryEfficiency = 0.95;
    if (dod > 0.9) dod = 0.9; // Cap at 90% for safe cycle count
  } else if (settings.batteryChemistry === 'gel') {
    batteryEfficiency = 0.85;
    if (dod > 0.5) dod = 0.5; // Gel typical 50%
  } else {
    batteryEfficiency = 0.80; // Lead-acid typical 45-50%
    if (dod > 0.5) dod = 0.45;
  }

  // Battery Ah needed at System Voltage
  // Wh_needed = (DailyWh * AutonomyDays) / (SystemVoltage * DoD * Efficiency)
  const nominalBatteryAhNeeded = totalDailyWh > 0 
    ? (totalDailyWh * settings.autonomyDays) / (settings.systemVoltage * dod * batteryEfficiency) 
    : 0;

  // Let's design battery configuration
  // Standard battery blocks in Nigeria are 12V blocks (available as 100Ah, 150Ah, 200Ah, 240Ah) or Lithium 150Ah/200Ah wall batteries.
  // Standard block rating assumption depends on battery size
  const singleBatteryVoltage = 12; // assumed typical blocks 
  const singleBatteryAh = nominalBatteryAhNeeded <= 120 ? 100 : 200; // Auto pick 100Ah for tiny or 200Ah for typical

  // Batteries in Series for system voltage:
  const seriesCount = settings.systemVoltage / singleBatteryVoltage;
  // Batteries in Parallel for capacity requirement:
  const parallelCount = nominalBatteryAhNeeded > 0
    ? Math.max(1, Math.ceil(nominalBatteryAhNeeded / singleBatteryAh))
    : 0;

  const batteryBankCount = seriesCount * parallelCount;
  const actualBatteryBankCapacityAh = parallelCount * singleBatteryAh;

  // Total daily 12V Equivalent capacity (for comparison dashboard metrics)
  const totalBatteryAh12VEquivalent = nominalBatteryAhNeeded * (settings.systemVoltage / 12);

  // Calculate gross nameplate energy storage (gross kWh capacity needed)
  const batteryTotalKwhNeeded = totalDailyWh > 0
    ? (nominalBatteryAhNeeded * settings.systemVoltage) / 1000
    : 0;

  // Calculate recommended standard unit configurations
  let recommendedBatteryUnitCount = 0;
  let recommendedBatteryUnitSizeKwh = 0;
  let recommendedBatteryUnitLabel = '';

  if (totalDailyWh > 0) {
    if (settings.batteryChemistry === 'lithium') {
      // Pick standard Lithium pack size based on gross storage needed
      if (batteryTotalKwhNeeded <= 3.5) {
        recommendedBatteryUnitSizeKwh = 2.56; // Standard 2.56 kWh
      } else if (batteryTotalKwhNeeded <= 15.0) {
        recommendedBatteryUnitSizeKwh = 5.12; // Standard 5.12 kWh LFP Wall (48V 100Ah) - extremely common
      } else if (batteryTotalKwhNeeded <= 45.0) {
        recommendedBatteryUnitSizeKwh = 10.24; // Standard 10.24 kWh LFP Pack
      } else {
        recommendedBatteryUnitSizeKwh = 25.0; // High capacity 25.0 kWh industrial unit
      }

      recommendedBatteryUnitCount = Math.max(1, Math.ceil(batteryTotalKwhNeeded / recommendedBatteryUnitSizeKwh));
      recommendedBatteryUnitLabel = `${recommendedBatteryUnitCount} unit${recommendedBatteryUnitCount > 1 ? 's' : ''} of ${recommendedBatteryUnitSizeKwh} kWh Lithium Battery`;
    } else {
      // For Gel/Lead-Acid batteries, they are rated in Ah at 12V (e.g., standard 12V 200Ah deep cycle is 2.4 kWh per battery)
      recommendedBatteryUnitSizeKwh = (singleBatteryAh * 12) / 1000; // 1.2 kWh or 2.4 kWh
      recommendedBatteryUnitCount = batteryBankCount;
      const typeLabel = settings.batteryChemistry === 'gel' ? 'Gel Deep Cycle' : 'Lead-Acid';
      recommendedBatteryUnitLabel = `${recommendedBatteryUnitCount} unit${recommendedBatteryUnitCount > 1 ? 's' : ''} of ${recommendedBatteryUnitSizeKwh.toFixed(1)} kWh (12V ${singleBatteryAh}Ah) ${typeLabel} Battery`;
    }
  } else {
    recommendedBatteryUnitLabel = 'No storage battery required';
  }

  // 5. Charge Controller (MPPT) sizing
  // Under typical MPPT sizing, Output Current = Solar Array Watts / System Battery Voltage * safety margin (1.25)
  const controllerAmps = actualArrayWatts > 0
    ? (actualArrayWatts / settings.systemVoltage) * 1.25
    : 0;

  // 6. Cable Sizing & Voltage Drop Computations

  // A. Panel to Inverter (PV DC Cable)
  // Assuming a standard MPPT controller set up:
  // String configurations are designed structurally. Standard panels (~400W) have Open Circuit Voltages (Voc) around 49V, Operating Voltage (Vmp) around 41V, short circuit current (Isc) of around 11-13A.
  // We model:
  // - 12V system: all panels in parallel (string voltage ~41V). Current = count * 11A.
  // - 24V system: 2 in series, strings in parallel. Vo = 82V. Current = (count/2) * 11A.
  // - 48V system: strings of 3 or 4 in series. Current = (count / series_limit) * 11A.
  let panelsInSeries = 1;
  if (settings.systemVoltage === 24) {
    panelsInSeries = Math.min(2, minimumPanelCount);
  } else if (settings.systemVoltage === 48) {
    panelsInSeries = Math.min(3, minimumPanelCount);
  }
  
  if (panelsInSeries < 1) panelsInSeries = 1;
  const stringsInParallel = Math.ceil(minimumPanelCount / panelsInSeries);
  
  const estimatedIsc = 11.5; // Amps for typical 400-500W Panels
  const estimatedVmp = 41.5; // Volts per panel
  
  const pvShortCircuitCurrent = stringsInParallel * estimatedIsc;
  const pvOperatingVoltage = panelsInSeries * estimatedVmp;
  
  // Design current is Isc * 1.25 (NEC safety rule)
  const pvDesignCurrent = pvShortCircuitCurrent * 1.25;

  // Loop through available standard cable sizes (>= 4mm2) to find first that satisfies:
  // 1. Safe ampacity (continuous current must be within thermal rating of Cable).
  // 2. Voltage drop limit (under 3% - ideally under 2% for DC)
  let selectedPvCableSize = 4;
  let pvVdropV = 0;
  let pvVdropPercent = 100;
  let pvStatus: 'optimal' | 'warning' | 'acceptable' = 'warning';
  let pvReason = '';

  for (const size of STANDARD_CABLE_SIZES.filter(s => s <= 25)) { // PV cables are rarely > 16-25mm2
    // R = 2 * rho * L / A (copper loop resistance for positive and negative runs)
    const resistance = (2 * COPPER_RESISTIVITY * settings.cableLengthMeters) / size;
    const vDrop = pvShortCircuitCurrent * resistance;
    const vDropPct = pvOperatingVoltage > 0 ? (vDrop / pvOperatingVoltage) * 100 : 0;
    const safeAmp = CABLE_AMPACITY[size];

    if (safeAmp >= pvDesignCurrent) {
      selectedPvCableSize = size;
      pvVdropV = vDrop;
      pvVdropPercent = vDropPct;
      
      if (vDropPct <= 2.0) {
        pvStatus = 'optimal';
        pvReason = `Good choice. Voltage drop is very low (${vDropPct.toFixed(2)}%), causing minimal power loss across ${settings.cableLengthMeters}m.`;
        break;
      } else if (vDropPct <= 3.5) {
        pvStatus = 'acceptable';
        pvReason = `Acceptable wire size. Voltage drop is ${vDropPct.toFixed(2)}% (under standard 3% threshold).`;
      } else {
        pvStatus = 'warning';
        pvReason = `Voltage drop is high (${vDropPct.toFixed(2)}%). Thickening wire index is recommended to prevent clipping.`;
      }
    }
  }

  // Handle zero state
  if (actualArrayWatts === 0) {
    selectedPvCableSize = 4;
    pvVdropV = 0;
    pvVdropPercent = 0;
    pvStatus = 'optimal';
    pvReason = 'No active loads or solar layout planned.';
  }

  const panelToInverterCable: CableRecommendation = {
    sizeMm2: selectedPvCableSize,
    currentAmps: pvShortCircuitCurrent,
    voltageDropVolts: pvVdropV,
    voltageDropPercent: pvVdropPercent,
    gaugeAWG: CABLE_AWG[selectedPvCableSize] || 'N/A',
    status: pvStatus,
    reason: pvReason
  };


  // B. Inverter to Battery (Ultra-high continuous DC line)
  // Continuous DC load at maximum inverter power outputs
  const maxInverterContinuousWatts = recommendedInverterKw * 1000;
  const maxBatteryDrawCurrentContinuous = maxInverterContinuousWatts > 0
    ? maxInverterContinuousWatts / (settings.systemVoltage * 0.85) // 85% typical inverting efficiency
    : 0;
    
  // Design current is 1.25x max continuous current
  const batteryDesignCurrent = maxBatteryDrawCurrentContinuous * 1.25;

  // Standard short run of 2 meters for battery bank to inverter
  const batteryCableDistance = 2.0; 

  let selectedBatteryCableSize = 16;
  let batVdropV = 0;
  let batVdropPercent = 100;
  let batStatus: 'optimal' | 'warning' | 'acceptable' = 'warning';
  let batReason = '';

  for (const size of STANDARD_CABLE_SIZES.filter(s => s >= 16)) {
    const resistance = (2 * COPPER_RESISTIVITY * batteryCableDistance) / size;
    const vDrop = maxBatteryDrawCurrentContinuous * resistance;
    const vDropPct = (vDrop / settings.systemVoltage) * 100;
    const safeAmp = CABLE_AMPACITY[size];

    if (safeAmp >= batteryDesignCurrent) {
      selectedBatteryCableSize = size;
      batVdropV = vDrop;
      batVdropPercent = vDropPct;

      if (vDropPct <= 1.0) {
        batStatus = 'optimal';
        batReason = `Optimal heavy gauge. Safely handles high currents (${maxBatteryDrawCurrentContinuous.toFixed(1)}A) with only ${vDropPct.toFixed(2)}% voltage drop.`;
        break;
      } else if (vDropPct <= 2.0) {
        batStatus = 'acceptable';
        batReason = `Provides solid coverage. Voltage loss is acceptable inside standard 2.0m loop limits.`;
      } else {
        batStatus = 'warning';
        batReason = `Line loss limit exceeded (${vDropPct.toFixed(2)}%). A thicker gauge cable is recommended to avoid heat.`;
      }
    }
  }

  // Fallback for huge current that exceeds 120mm2 physical standard limits
  if (batteryDesignCurrent > CABLE_AMPACITY[120]) {
    selectedBatteryCableSize = 120;
    const resistance = (2 * COPPER_RESISTIVITY * batteryCableDistance) / 120;
    batVdropV = maxBatteryDrawCurrentContinuous * resistance;
    batVdropPercent = (batVdropV / settings.systemVoltage) * 100;
    batStatus = 'warning';
    batReason = `EXTREME DC current design limits of ${maxBatteryDrawCurrentContinuous.toFixed(0)}A! Multiple twin runs of 70mm² or 95mm² flexible lines are required.`;
  }

  if (maxInverterContinuousWatts === 0) {
    selectedBatteryCableSize = 16;
    batVdropV = 0;
    batVdropPercent = 0;
    batStatus = 'optimal';
    batReason = 'No battery/inverter draw planned.';
  }

  const inverterToBatteryCable: CableRecommendation = {
    sizeMm2: selectedBatteryCableSize,
    currentAmps: maxBatteryDrawCurrentContinuous,
    voltageDropVolts: batVdropV,
    voltageDropPercent: batVdropPercent,
    gaugeAWG: CABLE_AWG[selectedBatteryCableSize] || 'N/A',
    status: batStatus,
    reason: batReason
  };

  // 7. Sizing Breakers & Safety Standard Elements
  // Battery Breaker: Must handle start surges without tripping, and protect the battery lines.
  // Generally sized around 1.25x-1.50x of continuous max inverter current.
  const calculatedBatBreaker = maxBatteryDrawCurrentContinuous * 1.25;
  const batteryBreakerAmps = calculatedBatBreaker > 0
    ? findNextStandardRating(calculatedBatBreaker, STANDARD_DC_BREAKERS)
    : 0;

  // Solar PV array breaker: protects mppt controller entry.
  // Standard sizing: PV Isc * 1.25.
  const calculatedPvBreaker = pvShortCircuitCurrent * 1.25;
  const solarBreakerAmps = calculatedPvBreaker > 0
    ? findNextStandardRating(calculatedPvBreaker, STANDARD_DC_BREAKERS)
    : 0;

  // AC Output Breaker: Sized to 230V single phase output in Nigeria.
  // Max AC Current = Inverter Power (W) / 230V
  const maxAcCurrent = (recommendedInverterKw * 1000) / 230;
  const calculatedAcBreaker = maxAcCurrent * 1.25;
  const acOutputBreakerAmps = calculatedAcBreaker > 0
    ? findNextStandardRating(calculatedAcBreaker, STANDARD_AC_BREAKERS)
    : 0;

  return {
    totalDailyWh,
    totalContinuousWatts,
    peakSurgeWatts,
    recommendedInverterKw,
    recommendedInverterKva,
    requiredSolarWatts,
    minimumPanelCount,
    actualArrayWatts,
    totalBatteryAhNeeded: nominalBatteryAhNeeded,
    totalBatteryAh12VEquivalent,
    batteryBankCount,
    singleBatteryAh,
    singleBatteryVoltage,
    seriesCount,
    parallelCount,
    batteryTotalKwhNeeded,
    recommendedBatteryUnitCount,
    recommendedBatteryUnitSizeKwh,
    recommendedBatteryUnitLabel,
    controllerAmps,
    panelToInverterCable,
    inverterToBatteryCable,
    batteryBreakerAmps,
    solarBreakerAmps,
    acOutputBreakerAmps
  };
}
