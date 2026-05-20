/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  Wind, 
  Tv, 
  Radio, 
  Music, 
  Laptop, 
  Smartphone, 
  Monitor, 
  Snowflake, 
  Cpu, 
  Droplets, 
  Flame, 
  Coffee, 
  Layers, 
  RefreshCw, 
  Shuffle, 
  Trash2, 
  Plus, 
  Info, 
  ShieldAlert, 
  Wrench, 
  CheckCircle2, 
  HelpCircle, 
  Settings,
  Scale,
  Zap,
  Gauge,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

import { CityInfo, LoadItem, CalculatorSettings, BatteryChemistry } from './types';
import { NIGERIA_CITIES } from './data/nigeriaCities';
import { STANDARD_APPLIANCES } from './data/appliances';
import { calculateSolarSystem } from './utils/solarCalculator';
import NigeriaMapWidget from './components/NigeriaMapWidget';
import InteractiveDiagram from './components/InteractiveDiagram';
import ContactPage from './components/ContactPage';

// Dynamic helper to map standard preset icons safely to JSX elements
function renderApplianceIcon(iconName: string, className = "h-4 w-4") {
  switch (iconName) {
    case 'Lightbulb': return <Lightbulb className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Radio': return <Radio className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    case 'Snowflake': return <Snowflake className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Droplets': return <Droplets className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'Shuffle': return <Shuffle className={className} />;
    default: return <Wrench className={className} />;
  }
}

export default function App() {
  // Navigation tab routing state
  const [activeTab, setActiveTab] = useState<'calculator' | 'contact'>('calculator');

  // 1. Hardcoded initial interactive load estimates for an out-of-the-box working state
  const [loads, setLoads] = useState<LoadItem[]>([
    { id: '1', name: 'LED Light Bulbs (Living/Exterior)', watts: 12, quantity: 6, hoursPerDay: 8, surgeFactor: 1.0 },
    { id: '2', name: 'Ceiling/Standing Fans', watts: 75, quantity: 3, hoursPerDay: 10, surgeFactor: 1.2 },
    { id: '3', name: 'LED TV & Decoder Setup', watts: 130, quantity: 1, hoursPerDay: 6, surgeFactor: 1.1 },
    { id: '4', name: 'Single-door Refrigerator', watts: 150, quantity: 1, hoursPerDay: 18, surgeFactor: 3.0 },
  ]);

  // 2. Solar Calculator settings state
  const [settings, setSettings] = useState<CalculatorSettings>({
    selectedCityName: 'Abuja',
    batteryChemistry: 'gel',
    systemVoltage: 24,
    panelSizeWatts: 450,
    autonomyDays: 1,
    batteryDepthOfDischarge: 0.5,
    cableLengthMeters: 15,
  });

  // Custom load creation states
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState<number>(100);
  const [customQty, setCustomQty] = useState<number>(1);
  const [customHours, setCustomHours] = useState<number>(6);
  const [customSurge, setCustomSurge] = useState<number>(1.0);
  const [customCategory, setCustomCategory] = useState<string>('appliances');

  // FAQ section toggle state
  const [openedFaq, setOpenedFaq] = useState<number | null>(null);

  // Derive city object based on name selection
  const activeCity = useMemo(() => {
    return NIGERIA_CITIES.find(c => c.name === settings.selectedCityName) || NIGERIA_CITIES[0];
  }, [settings.selectedCityName]);

  // Calculate system sizing output metrics based on current loads and configurations!
  const sizingResult = useMemo(() => {
    return calculateSolarSystem(loads, settings);
  }, [loads, settings]);

  // Handle adding load item from the presets button deck
  const handleAddPreset = (appliance: typeof STANDARD_APPLIANCES[0]) => {
    const isInductive = ['small_fridge', 'large_fridge', 'deep_freezer', 'ac_1hp', 'ac_1_5hp', 'water_pump_0_5hp', 'water_pump_1hp', 'washing_machine', 'blender'].includes(appliance.id);
    const surge = isInductive ? (appliance.id.startsWith('ac') || appliance.id.startsWith('water_pump') ? 3.5 : 3.0) : 1.1;
    
    // Add check to see if item is already in list; if so, bump quantity
    const existing = loads.find(item => item.name === appliance.name);
    if (existing) {
      setLoads(loads.map(item => item.name === appliance.name ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      const newItem: LoadItem = {
        id: Date.now().toString(),
        name: appliance.name,
        watts: appliance.defaultWatts,
        quantity: 1,
        hoursPerDay: appliance.category === 'lighting' ? 8 : (appliance.category === 'appliances' && appliance.id.includes('fridge') ? 24 : 6),
        surgeFactor: surge
      };
      setLoads([...loads, newItem]);
    }
  };

  // Handle adding custom load
  const handleAddCustomLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: LoadItem = {
      id: Date.now().toString(),
      name: customName,
      watts: customWatts,
      quantity: customQty,
      hoursPerDay: customHours,
      surgeFactor: customSurge
    };

    setLoads([...loads, newItem]);
    setCustomName('');
    setCustomWatts(100);
    setCustomQty(1);
    setCustomHours(6);
    setCustomSurge(1.0);
  };

  // Update specific load item fields
  const handleUpdateLoad = (id: string, field: keyof LoadItem, value: any) => {
    setLoads(loads.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Delete load item
  const handleDeleteLoad = (id: string) => {
    setLoads(loads.filter(item => item.id !== id));
  };

  // System voltage rating advisory comments
  const systemVoltageRecommendation = useMemo(() => {
    const watts = sizingResult.totalContinuousWatts;
    if (watts === 0) return 'Add appliances below to get voltage advisory.';
    if (watts <= 1000) {
      return '12V DC baseline is acceptable, but 24V offers much higher cable safety overhead for expansions.';
    } else if (watts <= 3000) {
      return '24V DC is highly recommended. It reduces battery line currents to moderate levels, preventing high heat and cutting copper cost.';
    } else {
      return '48V DC is CRITICAL. Drawing over 3,000 Watts on a 12V or 24V loop requires massive, dangerous cable gauges (>95mm²) liable to heat.';
    }
  }, [sizingResult.totalContinuousWatts]);

  const handleCitySelect = (city: CityInfo) => {
    setSettings(prev => ({
      ...prev,
      selectedCityName: city.name
    }));
  };

  // Quick preset handlers for battery options
  const handleBatteryChemistryChange = (chem: BatteryChemistry) => {
    let defaultDoD = 0.5;
    if (chem === 'lithium') defaultDoD = 0.8;
    else if (chem === 'gel') defaultDoD = 0.5;
    else defaultDoD = 0.45;

    setSettings(prev => ({
      ...prev,
      batteryChemistry: chem,
      batteryDepthOfDischarge: defaultDoD
    }));
  };

  const getFaqList = () => [
    {
      q: "What is copper cable resistance, and why are sizing standards critical in Nigeria?",
      a: "Electric currents generate thermal power relative to electrical cable resistance. Pure Copper has extremely low resistance (0.0175 ohm·mm²/m). Cables with insufficient thickness (such as using standard 1.5mm² wire for heavy loads) or cheap Copper-Clad Aluminum (CCA) hybrids have very high resistance, causing massive electrical line losses, drop in active terminal voltage, and high thermal heat leading to melting insulation, short-circuits, and home fire hazards. Using standard pure copper sizes (like 4mm²/6mm² for solar feeds and 35mm²/50mm² for heavy battery networks) keeps your environment safe."
    },
    {
      q: "Why is an active DC Circuit Breaker needed on the Solar PV and Battery loops?",
      a: "Unlike AC utility grids which alternate and cross zero-volt intervals (allowing standard contacts to extinguish sparks), direct currents (DC) flow continuously. In a fault state, a DC arc can stretch several centimeters without breaking, melting equipment and setting plastic on fire. Heavy-duty magnetic DC breakers or solar fuses (63A-250A) are required on the battery feed, and 16A-40A DC breakers on panel array strings, to break these extreme continuous currents in cases of short-circuits or hardware failures."
    },
    {
      q: "What is the difference between peak sun hours (PSH) and daylight hours?",
      a: "Daylight hours is the length of time the sun remains above the horizon (often 11 to 12 hours in Nigeria). However, solar panels require high irradiance limits (~1,000 W/m²) to output rated capacities. Peak Sun Hours (PSH) represents the equivalent number of hours the sun provides maximum 1,000 W/m² irradiance. In Nigeria, this spans from 3.5 hours on cloudy rainy seasons in southern coastal cities (Lagos, Port Harcourt, Calabar) to 6.4 hours in high-radiation northern areas (Sokoto, Maiduguri, Kano, Katsina). Sizing must account for your specific regional PSH to design adequate charging structures."
    },
    {
      q: "How does Inverter system voltage (12V, 24V, 48V) affect system efficiency?",
      a: "Power is current multiplied by voltage (P = I × V). If you pull 3,000W of power on a 12V battery array, the wire must carry an extreme current of 250A (3000 / 12), requiring a cable as thick as an arm (120mm²). If you use a 48V system instead, the wire current drops 4x to only 62.5A (3000 / 48), allowing a cheap, cool-operating 16mm² copper cable. Keeping currents low is the standard approach to build cool, highly-efficient, long-lasting solar infrastructure."
    },
    {
      q: "What is Battery Depth of Discharge (DoD) and autonomy days?",
      a: "Sizing considers how deep you empty your batteries daily. Lithium batteries (LiFePO4) can easily discharge up to 80-90% of their total capacity daily without degrading, lasting over 10 years. Lead-Acid or Gel batteries are damaged if discharged below 50% continuously, shortening their lifespan to under 2 years. Autonomy Days states how many days the system can sustain your loads during completely rainy or overcast days. A standard 1-day backup is typical in Nigeria, with occasional grid/generator charging options."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased" id="main-scaffold">
      
      {/* 1. Header Hero Panel */}
      <header className="bg-gradient-to-br from-slate-900 via-[#0e1726] to-[#040810] text-white border-b border-slate-805 shadow-md relative overflow-hidden" id="dashboard-header">
        <div className="absolute inset-0 bg-radial-gradient(ellipse_at_top,rgba(30,41,59,0.5),rgba(3,7,18,0.9))"></div>
        
        {/* Decorative Green-White-Green Stripe top edge (Nigerian identity) */}
        <div className="h-1.5 w-full flex relative z-20">
          <div className="bg-emerald-600 h-full flex-grow"></div>
          <div className="bg-white h-full w-[15%] max-w-[100px]"></div>
          <div className="bg-emerald-600 h-full flex-grow"></div>
        </div>

        {/* Global Navigation Header & Logo */}
        <div className="border-b border-slate-800/60 relative z-20 bg-slate-950/50 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Elegant Brand Logo */}
            <button 
              onClick={() => setActiveTab('calculator')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden text-left"
              id="global-brand-logo"
            >
              <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg text-slate-950 font-bold ring-2 ring-amber-500/20 shadow-xs transition-transform group-hover:scale-105 duration-200">
                <Zap className="h-4 w-4 fill-amber-200 text-slate-950" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-sans font-extrabold tracking-tight text-white text-sm sm:text-base leading-none">
                  Naija<span className="text-amber-400">Solar</span>Sizer
                </span>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-semibold block sm:inline-block border sm:border-emerald-500/20 sm:px-1.5 sm:py-0.5 rounded-sm sm:bg-emerald-500/5 mt-0.5 sm:mt-0 leading-none">
                  Specialist
                </span>
              </div>
            </button>

            {/* Navigation Menu */}
            <nav className="flex items-center gap-1.5 sm:gap-3 font-sans text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
                id="tab-sizer-toggle"
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'contact'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
                id="tab-contact-toggle"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Contact Specialists</span>
                <span className="xs:hidden">Contact</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Nigerian Electrical Standards &amp; Solar Sizing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
              Nigeria Solar Sizing &amp; Safety Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              Accurately size household inverters, solar PV arrays, battery storage banks, and safe interconnecting copper cables based on geographic irradiances across any Nigerian city.
            </p>
          </div>

          {/* Quick HUD overall stats */}
          <div className="flex flex-wrap gap-3 sm:gap-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl max-w-md shadow-inner backdrop-blur-xs">
            <div className="pr-4 border-r border-slate-800">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Daily Demand</span>
              <strong className="text-lg font-bold text-indigo-400">
                {(sizingResult.totalDailyWh / 1000).toFixed(2)} kWh
              </strong>
            </div>
            <div className="pr-4 border-r border-slate-800">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Surge Start Limit</span>
              <strong className="text-lg font-bold text-amber-500">
                {sizingResult.peakSurgeWatts}W
              </strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Wiring Scheme</span>
              <strong className="text-lg font-bold text-emerald-400">
                {settings.systemVoltage}V DC
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area Toggle */}
      {activeTab === 'contact' ? (
        <ContactPage 
          sizingResult={sizingResult}
          selectedCityName={settings.selectedCityName}
          systemVoltage={settings.systemVoltage}
          batteryChemistry={settings.batteryChemistry}
          onBackToCalculator={() => setActiveTab('calculator')}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="calculator-workspace">
        
        {/* Section A: Location select & Custom Settings Deck */}
        <section className="mb-8" id="location-and-parameters-section">
          <NigeriaMapWidget 
            selectedCityName={settings.selectedCityName}
            onSelectCity={handleCitySelect}
          />
        </section>

        {/* Section B: Load Estimator Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8" id="load-aggregation-section">
          
          {/* Sizing configuration inputs */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-sm transition-all duration-200 p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-md font-sans font-bold text-slate-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-600 animate-spin-slow" />
                2. Sizing Config parameters
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize physical component limits &amp; distances</p>
            </div>

            {/* Battery Chemistry selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Battery Chemistry</label>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
                {(['lithium', 'gel', 'lead-acid'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => handleBatteryChemistryChange(style)}
                    className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                      settings.batteryChemistry === style
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    id={`bat-style-${style}`}
                  >
                    {style.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500 font-mono leading-normal">
                {settings.batteryChemistry === 'lithium' && 'Recommended. 0.8 DoD (80% discharged depth), high cycles, low loop degradation.'}
                {settings.batteryChemistry === 'gel' && 'Common Gel Block. 0.5 DoD (50% max discharge to avoid terminal block damage).'}
                {settings.batteryChemistry === 'lead-acid' && 'Standard Acid Cell. 0.45 DoD budget option. Rapid aging on deep cycle runs.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* System Voltage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">System Voltage</label>
                <select
                  value={settings.systemVoltage}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemVoltage: Number(e.target.value) as 12|24|48 }))}
                  className="w-full text-xs font-mono font-bold border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all"
                  id="system-voltage-select"
                >
                  <option value={12}>12V DC System</option>
                  <option value={24}>24V DC System</option>
                  <option value={48}>48V DC System</option>
                </select>
              </div>

              {/* Standard Panel Watts */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Panel Watts (Physical)</label>
                <select
                  value={settings.panelSizeWatts}
                  onChange={(e) => setSettings(prev => ({ ...prev, panelSizeWatts: Number(e.target.value) }))}
                  className="w-full text-xs font-mono border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all"
                  id="panel-watts-select"
                >
                  <option value={350}>350 Watts</option>
                  <option value={400}>400 Watts</option>
                  <option value={450}>450 Watts</option>
                  <option value={550}>550 Watts</option>
                  <option value={600}>600 Watts</option>
                  <option value={625}>625 Watts</option>
                  <option value={650}>650 Watts</option>
                  <option value={700}>700 Watts</option>
                  <option value={750}>750 Watts</option>
                </select>
              </div>
            </div>

            {/* Loop Safety & Distance Panel info */}
            <div className="border border-indigo-100/60 bg-indigo-50/40 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-indigo-600" />
                  Wire Distance to Roof
                </span>
                <span className="font-mono text-xs text-indigo-700 font-bold">{settings.cableLengthMeters} meters</span>
              </div>
              <input
                type="range"
                min={5}
                max={45}
                step={5}
                value={settings.cableLengthMeters}
                onChange={(e) => setSettings(prev => ({ ...prev, cableLengthMeters: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
                id="distance-slider"
              />
              <span className="text-[10px] text-slate-500 font-mono block mt-1 leading-normal">
                Roof panels to inverter. Dynamic calculator adjusts copper section to maintain &lt;2.0% voltage drop.
              </span>
            </div>

            {/* Autonomy Days picker */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">DoD Threshold</label>
                <input
                  type="number"
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  value={settings.batteryDepthOfDischarge}
                  onChange={(e) => setSettings(prev => ({ ...prev, batteryDepthOfDischarge: Number(e.target.value) }))}
                  className="w-full text-xs border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all font-mono"
                  id="dod-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Autonomy Days</label>
                <select
                  value={settings.autonomyDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, autonomyDays: Number(e.target.value) }))}
                  className="w-full text-xs border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all font-mono"
                  id="autonomy-select"
                >
                  <option value={1}>1 Day (Standard)</option>
                  <option value={2}>2 Days (Heavy Cloud)</option>
                  <option value={3}>3 Days (High Autonomy)</option>
                </select>
              </div>
            </div>

            {/* Voltage Sizing Advisor */}
            <div className="p-3 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs space-y-1 shadow-inner">
              <strong className="text-white flex items-center gap-1 font-semibold">
                <Scale className="h-3.5 w-3.5 text-amber-500" />
                V-Sizing Security Advisor:
              </strong>
              <p className="leading-relaxed font-sans text-slate-400">{systemVoltageRecommendation}</p>
            </div>

          </div>

          {/* Actual items load block table */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-sm transition-all duration-200 p-5 md:p-6 flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-md font-sans font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
                  3. Continuous &amp; Inductive Loads Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Input household appliances to build continuous continuous demand and start surges</p>
              </div>
              <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-2.5 py-1 rounded-full font-mono font-semibold">
                {loads.length} Loads Tracked
              </span>
            </div>

            {/* Preset shortcuts selector */}
            <div>
              <span className="block text-xs text-slate-500 font-medium mb-2.5">Quick-Add Standard Nigerian Appliances:</span>
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1.5 border border-slate-200/60 rounded-xl bg-slate-50/75">
                {STANDARD_APPLIANCES.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAddPreset(app)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 text-[11px] font-medium transition-all text-slate-700 shadow-xs cursor-pointer"
                    id={`preset-add-${app.id}`}
                  >
                    {renderApplianceIcon(app.icon, "h-3.5 w-3.5 text-slate-500")}
                    <span>{app.name} ({app.defaultWatts}W)</span>
                    <Plus className="h-3 w-3 text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Loads table list */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 uppercase font-mono tracking-wider border-b border-slate-200/60 text-[10px]">
                      <th className="py-3 px-4">Appliance Name</th>
                      <th className="py-3 px-3 text-center">Watts (W)</th>
                      <th className="py-3 px-3 text-center">Qty</th>
                      <th className="py-3 px-3 text-center">Run Hrs/Day</th>
                      <th className="py-3 px-3 text-center">Inductive Surge</th>
                      <th className="py-3 px-3 text-right">Wh/Day</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100" id="loads-table-body">
                    {loads.length > 0 ? (
                      loads.map(load => (
                        <tr key={load.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-900">{load.name}</td>
                          <td className="py-3.5 px-3">
                            <input
                              type="number"
                              value={load.watts}
                              min={1}
                              max={9500}
                              onChange={(e) => handleUpdateLoad(load.id, 'watts', Number(e.target.value))}
                              className="w-16 border border-slate-300 rounded bg-white p-1 text-center font-mono focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                              id={`load-watts-${load.id}`}
                            />
                          </td>
                          <td className="py-3.5 px-3">
                            <input
                              type="number"
                              value={load.quantity}
                              min={1}
                              max={100}
                              onChange={(e) => handleUpdateLoad(load.id, 'quantity', Number(e.target.value))}
                              className="w-12 border border-slate-300 rounded bg-white p-1 text-center font-mono focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                              id={`load-qty-${load.id}`}
                            />
                          </td>
                          <td className="py-3.5 px-3">
                            <input
                              type="number"
                              value={load.hoursPerDay}
                              min={0.1}
                              max={24}
                              step={0.5}
                              onChange={(e) => handleUpdateLoad(load.id, 'hoursPerDay', Number(e.target.value))}
                              className="w-12 border border-slate-300 rounded bg-white p-1 text-center font-mono focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                              id={`load-hours-${load.id}`}
                            />
                          </td>
                          <td className="py-3.5 px-3">
                            <select
                              value={load.surgeFactor}
                              onChange={(e) => handleUpdateLoad(load.id, 'surgeFactor', Number(e.target.value))}
                              className="w-16 border border-slate-300 rounded bg-white p-1 text-center font-mono focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                              id={`load-surge-${load.id}`}
                            >
                              <option value={1.0}>1.0x (Resistive)</option>
                              <option value={1.2}>1.2x (LED/TV)</option>
                              <option value={2.0}>2.0x (Blenders)</option>
                              <option value={3.0}>3.0x (Fridge/AC)</option>
                              <option value={3.5}>3.5x (Hard Pump)</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-semibold text-indigo-700">
                            {(load.watts * load.quantity * load.hoursPerDay).toFixed(0)} Wh
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteLoad(load.id)}
                              className="p-1 px-2.5 rounded hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                              title="Delete row"
                              id={`load-delete-${load.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Empty ledger list. Click presets above or add a custom item below to initialize load calculations!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Load Add Area form */}
            <form onSubmit={handleAddCustomLoad} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Custom Load Name</label>
                <input
                  type="text"
                  placeholder="e.g. Server Room AC"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:outline-hidden focus:border-indigo-600 transition-all"
                  id="custom-load-name"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Watts (W)</label>
                <input
                  type="number"
                  min={1}
                  value={customWatts}
                  onChange={(e) => setCustomWatts(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:outline-hidden focus:border-indigo-600 transition-all"
                  id="custom-load-watts"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={customQty}
                  onChange={(e) => setCustomQty(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:outline-hidden focus:border-indigo-600 transition-all"
                  id="custom-load-qty"
                />
              </div>

              <div className="col-span-2 sm:col-span-1.5">
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Run Hrs</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  id="custom-load-hours"
                />
              </div>

              <div className="col-span-2 sm:col-span-1.5">
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Surge</label>
                <select
                  value={customSurge}
                  onChange={(e) => setCustomSurge(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 bg-white rounded-lg p-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  id="custom-load-surge"
                >
                  <option value={1.0}>1.0x</option>
                  <option value={1.2}>1.2x</option>
                  <option value={2.0}>2.0x</option>
                  <option value={3.0}>3.0x</option>
                  <option value={3.5}>3.5x</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer animate-none"
                  id="add-custom-btn"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </form>

          </div>

        </section>

        {/* Section C: Sizing Component Outputs (Bento-Grid layout) */}
        <section className="mb-8" id="sizing-bento-grid">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h3 className="text-md font-sans font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              4. Complete Sized Solar Components Recommendations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Engine-calculated layout specifications derived from {activeCity.name} PSH of {activeCity.peakSunHours} hrs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: Solar Panel Array */}
            <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">PV Array Size</span>
                <span className="p-2 bg-amber-50 rounded-lg text-amber-500">
                  <Lightbulb className="h-5 w-5" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Recommended minimum</span>
                <strong className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
                  {sizingResult.actualArrayWatts} Watts
                </strong>
                <span className="block text-xs font-semibold text-emerald-600 mt-1">
                  💡 {sizingResult.minimumPanelCount}x panels of {settings.panelSizeWatts}W
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-sans space-y-1">
                <p>Loads energy: <strong>{(sizingResult.totalDailyWh / 1000).toFixed(2)} kWh/day</strong></p>
                <p>Target array includes +25% structural compensation for line loss.</p>
              </div>
            </div>

            {/* CARD 2: Battery Storage Sizing */}
            <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Storage Sizing</span>
                <span className="p-2 bg-emerald-50 rounded-lg text-emerald-500 animate-pulse">
                  <Zap className="h-5 w-5" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">RECOMMENDED TOTAL BACKUP</span>
                <strong className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
                  {sizingResult.batteryTotalKwhNeeded.toFixed(2)} kWh
                </strong>
                <span className="block text-xs text-emerald-600 font-semibold mt-1">
                  🔋 {sizingResult.recommendedBatteryUnitLabel}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-sans space-y-1">
                <p>Minimal capacity: <strong>{sizingResult.totalBatteryAhNeeded.toFixed(0)} Ah</strong> at {settings.systemVoltage}V DC.</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Equivalent to {sizingResult.seriesCount} series × {sizingResult.parallelCount} parallel blocks of standard {sizingResult.singleBatteryAh}Ah deep-cycle module.
                </p>
              </div>
            </div>

            {/* CARD 3: Inverter Sizing */}
            <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Inverter size</span>
                <span className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                  <Cpu className="h-5 w-5" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Physical Rating</span>
                <strong className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
                  {sizingResult.recommendedInverterKva.toFixed(1)} kVA
                </strong>
                <span className="block text-xs text-indigo-600 font-bold mt-1">
                  ⚡ {sizingResult.recommendedInverterKw.toFixed(1)} kW AC continuous
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-sans leading-relaxed">
                Continuous active load: <strong>{sizingResult.totalContinuousWatts}W</strong>. Has a +25% margin to cushion start-spikes easily.
              </div>
            </div>

            {/* CARD 4: Charge Controller MPPT */}
            <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">MPPT controller</span>
                <span className="p-2 bg-amber-50 rounded-lg text-amber-500">
                  <Scale className="h-5 w-5" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Minimum Rating</span>
                <strong className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
                  {sizingResult.controllerAmps.toFixed(0)} Amps
                </strong>
                <span className="block text-xs text-amber-700 mt-1">
                  MPPT Current Output rating
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-sans leading-relaxed">
                Required to throttle high-voltage solar current down to safe <strong>{settings.systemVoltage}V</strong> battery terminal pressure.
              </div>
            </div>

          </div>
        </section>

        {/* Section D: Single-Line diagram (Dark thematic layout) */}
        <section className="mb-8" id="schematics-diagram-section">
          <InteractiveDiagram 
            result={sizingResult} 
            selectedCity={activeCity.name} 
            systemVoltage={settings.systemVoltage} 
          />
        </section>


        {/* Section E: Cable Sizing details & physics metrics table */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 md:p-6 mb-8" id="cable-sizing-details-deck">
          <div className="flex items-start gap-3 border-b border-slate-150 pb-4 mb-5">
            <span className="p-2 bg-slate-50 rounded-lg text-slate-700">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-md font-sans font-bold text-slate-900">
                Interconnecting Cable Sizing Physics &amp; Sizing Specs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated loop resistance, voltage drops, and AWG gauges under standard pure copper resistivity standards (0.0175 Ω·mm²/m)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            
            {/* Solar Panel To Inverter Cable Specs Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-755 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  PV Array String to Inverter Line
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${
                  sizingResult.panelToInverterCable.status === 'optimal' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : sizingResult.panelToInverterCable.status === 'acceptable'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {sizingResult.panelToInverterCable.status} Size
                </span>
              </div>
              
              <div className="divide-y divide-slate-100 text-xs font-sans space-y-2 pt-1">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Recommended Gauge (Cross Section)</span>
                  <strong className="text-slate-950 font-mono text-sm">{sizingResult.panelToInverterCable.sizeMm2} mm² ({sizingResult.panelToInverterCable.gaugeAWG})</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Operating System Loop Current</span>
                  <strong className="text-slate-950 font-mono">{sizingResult.panelToInverterCable.currentAmps.toFixed(1)} Amps</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Line Loop Distance (Roof to Bank)</span>
                  <strong className="text-slate-950 font-mono">{settings.cableLengthMeters} meters</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Calculated Voltage Drop (V-Loss)</span>
                  <strong className="text-red-600 font-mono">
                    {sizingResult.panelToInverterCable.voltageDropVolts.toFixed(2)} Volts ({sizingResult.panelToInverterCable.voltageDropPercent.toFixed(2)}%)
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
                <strong>Installer Note:</strong> {sizingResult.panelToInverterCable.reason}
              </p>
            </div>


            {/* Inverter To Battery Bank Sizing Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-755 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Inverter to Storage Battery Bank Line
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${
                  sizingResult.inverterToBatteryCable.status === 'optimal' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : sizingResult.inverterToBatteryCable.status === 'acceptable'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {sizingResult.inverterToBatteryCable.status} Size
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs font-sans space-y-2 pt-1">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Recommended Gauge (Cross Section)</span>
                  <strong className="text-slate-950 font-mono text-sm">{sizingResult.inverterToBatteryCable.sizeMm2} mm² ({sizingResult.inverterToBatteryCable.gaugeAWG})</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Peak Continuous Battery Current</span>
                  <strong className="text-slate-950 font-mono">{sizingResult.inverterToBatteryCable.currentAmps.toFixed(1)} Amps</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Standard Run Loop Distance</span>
                  <strong className="text-slate-950 font-mono">2.0 meters</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Calculated Voltage Drop (V-Loss)</span>
                  <strong className="text-red-600 font-mono">
                    {sizingResult.inverterToBatteryCable.voltageDropVolts.toFixed(2)} Volts ({sizingResult.inverterToBatteryCable.voltageDropPercent.toFixed(2)}%)
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
                <strong>Installer Note:</strong> {sizingResult.inverterToBatteryCable.reason}
              </p>
            </div>

          </div>

        </section>


        {/* Section F: Frequently Asked Questions Detail Drawer */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs" id="knowledge-faq">
          <div className="flex items-start gap-3 border-b border-slate-150 pb-4 mb-5">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-500">
              <HelpCircle className="h-5 w-5 animate-bounce-slow" />
            </span>
            <div>
              <h3 className="text-md font-sans font-bold text-slate-900">
                Engineering Knowledge Base: Cables, Fuses &amp; Physics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Understand electrical safety, cable line resistance, and why these limits are essential for Nigerian households</p>
            </div>
          </div>

          <div className="space-y-3" id="faq-accordions">
            {getFaqList().map((faq, index) => {
              const isOpen = openedFaq === index;
              return (
                <div 
                  key={index} 
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/40 hover:bg-slate-50/75"
                >
                  <button
                    onClick={() => setOpenedFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 flex justify-between items-center font-medium text-xs sm:text-sm text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                    id={`faq-trigger-${index}`}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-100 leading-relaxed font-sans bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </section>

      </main>
      )}

      {/* Footer system footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-slate-500 font-sans space-y-1">
          <p>© 2026 Solar Sizing Engine for Nigeria. Engineered in accordance with standard National Electrical Code (NEC) sizing thresholds.</p>
          <p className="text-[10px]">Verify details with a certified Solar Installer in Nigeria before implementing custom physical installations.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Contact Sticker */}
      <a 
        href="https://wa.me/2349071467060"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white hover:bg-[#20ba5a] p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2.5 group border border-emerald-400/20"
        id="whatsapp-floating-sticker"
        title="Chat on WhatsApp"
        aria-label="Chat with us on WhatsApp"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <MessageSquare className="h-5 w-5 fill-white text-[#25D366]" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-sans font-extrabold text-xs sm:text-sm whitespace-nowrap">
          Chat with Specialist
        </span>
      </a>

    </div>
  );
}
