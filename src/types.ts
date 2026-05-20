export interface CityInfo {
  name: string;
  state: string;
  region: 'North West' | 'North East' | 'North Central' | 'South West' | 'South East' | 'South South';
  peakSunHours: number; // kWh/m²/day
  latitude: number;
  longitude: number;
}

export interface Appliance {
  id: string;
  name: string;
  defaultWatts: number;
  category: 'lighting' | 'cooling' | 'entertainment' | 'appliances' | 'electronics' | 'heating';
  icon: string;
}

export interface LoadItem {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  surgeFactor: number; // For starting surge loads
}

export type BatteryChemistry = 'lithium' | 'gel' | 'lead-acid';

export interface CalculatorSettings {
  selectedCityName: string;
  batteryChemistry: BatteryChemistry;
  systemVoltage: 12 | 24 | 48; // Volts
  panelSizeWatts: number; // Standard panel sizes like 350W, 400W, 450W, 550W
  autonomyDays: number; // Days the battery can run the load without sun
  batteryDepthOfDischarge: number; // e.g., 0.8 for Lithium, 0.5 for Gel
  cableLengthMeters: number; // Distance from panel to inverter / battery
}

export interface CableRecommendation {
  sizeMm2: number;
  currentAmps: number;
  voltageDropVolts: number;
  voltageDropPercent: number;
  gaugeAWG: string;
  status: 'optimal' | 'warning' | 'acceptable';
  reason: string;
}

export interface SizingResult {
  totalDailyWh: number; // Total Daily energy consumed in Wh
  totalContinuousWatts: number; // Total Watts running concurrently (sum of running watts)
  peakSurgeWatts: number; // Total surge watts for startup
  recommendedInverterKva: number; // Recommended inverter size in kVA
  recommendedInverterKw: number; // Recommended inverter size in kW
  
  // Panels
  requiredSolarWatts: number; // Calculated solar array watts needed
  minimumPanelCount: number; // Minimum standard panels needed
  actualArrayWatts: number; // MinimumPanelCount * selected panel size
  
  // Batteries
  totalBatteryAhNeeded: number; // Ah needed at system voltage
  totalBatteryAh12VEquivalent: number; // Ah equivalents for standard 12V block comparisons
  batteryBankCount: number; // Number of physical batteries needed (assuming 12V or 24/48V blocks)
  singleBatteryAh: number; // Ah capacity per battery block
  singleBatteryVoltage: number; // Voltage per battery block
  seriesCount: number;
  parallelCount: number;

  // Charge controller
  controllerAmps: number; // Recommended charge controller size (MPPT)
  
  // Cables & Safety Breakers
  panelToInverterCable: CableRecommendation;
  inverterToBatteryCable: CableRecommendation;
  batteryBreakerAmps: number; // Recommended DC fuse/breaker size
  solarBreakerAmps: number; // Recommended PV charge controller breaker size
  acOutputBreakerAmps: number; // Recommended AC output breaker size
}
