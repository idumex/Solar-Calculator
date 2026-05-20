import React, { useState, useMemo } from 'react';
import { NIGERIA_CITIES } from '../data/nigeriaCities';
import { CityInfo } from '../types';
import { Search, MapPin, Info, Compass, SunDim } from 'lucide-react';

interface NigeriaMapWidgetProps {
  selectedCityName: string;
  onSelectCity: (city: CityInfo) => void;
}

// Coordinate limits for bounding box around Nigeria
const MIN_LNG = 2.5;
const MAX_LNG = 14.8;
const MIN_LAT = 4.0;
const MAX_LAT = 14.2;

// Map lat/lng to SVG box coordinates (500x380)
function getSvgCoords(lat: number, lng: number) {
  const width = 500;
  const height = 360;
  
  // Padding around margins
  const padX = 25;
  const padY = 25;
  
  const x = padX + ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (width - 2 * padX);
  // Invert Y as SVG starts from top left
  const y = (height - padY) - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * (height - 2 * padY);
  
  return { x, y };
}

export default function NigeriaMapWidget({ selectedCityName, onSelectCity }: NigeriaMapWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Filter list
  const filteredCities = useMemo(() => {
    return NIGERIA_CITIES.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            city.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  const activeCity = useMemo(() => {
    return NIGERIA_CITIES.find(c => c.name === selectedCityName) || NIGERIA_CITIES[0];
  }, [selectedCityName]);

  // Regions for classification
  const regions = ['All', 'North West', 'North East', 'North Central', 'South West', 'South East', 'South South'];

  // Geographic center guides for Niger & Benue rivers
  // Northwest Branch (Niger) starts around (3.5, 12), paths to Lokoja (6.7, 7.8)
  // Northeast Branch (Benue) starts around (12.5, 9.2), paths to Lokoja (6.7, 7.8)
  // Southern Branch (Niger Delta) starts at Lokoja (6.7, 7.8) and flows down to Delta (6.2, 5.0)
  const riversPath = useMemo(() => {
    const ptNW = getSvgCoords(12.0, 3.5);
    const ptLokoja = getSvgCoords(7.7969, 6.7405);
    const ptNE = getSvgCoords(9.3, 12.4);
    const ptS = getSvgCoords(4.5, 6.3);

    return {
      nwToLokoja: `M ${ptNW.x} ${ptNW.y} Q ${(ptNW.x + ptLokoja.x)/2} ${(ptNW.y + ptLokoja.y)/2 + 20} ${ptLokoja.x} ${ptLokoja.y}`,
      neToLokoja: `M ${ptNE.x} ${ptNE.y} Q ${(ptNE.x + ptLokoja.x)/2 + 10} ${(ptNE.y + ptLokoja.y)/2 - 10} ${ptLokoja.x} ${ptLokoja.y}`,
      lokojaToDelta: `M ${ptLokoja.x} ${ptLokoja.y} C ${ptLokoja.x - 10} ${ptLokoja.y + 40}, ${ptS.x + 15} ${ptS.y - 40}, ${ptS.x} ${ptS.y}`
    };
  }, []);

  // Compute color based on insolations: High Northern vs Cloudy Southern
  const getSunHourColor = (hours: number) => {
    if (hours >= 6.0) return 'text-orange-700 bg-orange-50/50 border-orange-200/60';
    if (hours >= 5.0) return 'text-amber-700 bg-amber-50/50 border-amber-200/60';
    return 'text-sky-700 bg-sky-50/50 border-sky-200/60';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 md:p-6" id="location-picker">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-4 mb-5">
        <div>
          <h3 className="text-lg font-sans font-bold text-slate-900 flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-600" />
            1. Solar Location &amp; Irradiation Deck
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Filter by geopolitical zone or city to load peak sun coordinates</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100/80 rounded-full text-xs text-amber-700 font-medium">
          <SunDim className="h-4 w-4 animate-spin-slow text-amber-550" />
          <span>Active City PSH: <strong className="font-semibold text-slate-800">{activeCity.peakSunHours.toFixed(1)} hrs/day</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* State/Zone selector sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search major city or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 bg-white rounded-xl focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-sans"
              id="city-search"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/40">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                  selectedRegion === region 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id={`zone-tab-${region.toLowerCase().replace(' ', '-')}`}
              >
                {region === 'All' ? 'All Zone' : region.replace('North ', 'N.').replace('South ', 'S.')}
              </button>
            ))}
          </div>

          {/* List section with scroll */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/20">
            <div className="max-h-[200px] lg:max-h-[250px] overflow-y-auto divide-y divide-slate-100/60">
              {filteredCities.length > 0 ? (
                filteredCities.map(city => {
                  const isSelected = city.name === selectedCityName;
                  return (
                    <button
                      key={city.name}
                      onClick={() => onSelectCity(city)}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50/55 border-l-4 border-l-indigo-600 text-indigo-950 font-medium' 
                          : 'hover:bg-white text-slate-700'
                      }`}
                      id={`city-btn-${city.name.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-semibold text-slate-800">{city.name}</div>
                          <div className="text-[10px] text-slate-500">{city.state} State ({city.region})</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isSelected 
                          ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}>
                        {city.peakSunHours.toFixed(1)} PSH
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No cities match filters. Try adjusting search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Solar irradiation comment drawer */}
          <div className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed ${getSunHourColor(activeCity.peakSunHours)}`}>
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-600" />
            <div>
              <strong className="font-semibold">{activeCity.name} Profile:</strong>{' '}
              {activeCity.peakSunHours >= 6.0 ? (
                <span>Northern belt. Exceptional daily solar yield ({activeCity.peakSunHours} hrs average Sun). Recommended series sizing requires smaller array wattage. Excellent quick charge characteristics.</span>
              ) : activeCity.peakSunHours >= 5.0 ? (
                <span>Middle belt. Robust solar insulation ({activeCity.peakSunHours} hrs average Sun). Supports steady daily battery charging. Solid baseline for home-office systems.</span>
              ) : (
                <span>Southern coastal belt. Moderate solar insulation ({activeCity.peakSunHours} hrs average Sun) due to rain/cloud density. Sizing engine auto-scales panel count larger to cover autonomy requirements.</span>
              )}
            </div>
          </div>

        </div>

        {/* Map SVG scatter-canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 shadow-inner relative min-h-[300px] border border-slate-800">
          <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-500">
            NIGERIA GEO-PROJECTION CHART (CONFLUENCE FORK)
          </div>

          {/* Scatter Plot SVG */}
          <svg viewBox="0 0 500 360" className="w-full h-full max-h-[350px] relative z-10 transition-transform">
            
            {/* Ambient Confluence Rivers Grid (Niger - Benue confluence) */}
            <path 
              d={riversPath.nwToLokoja} 
              fill="none" 
              stroke="#1d4ed8" 
              strokeWidth="2" 
              strokeDasharray="4 2" 
              className="opacity-40"
            />
            <path 
              d={riversPath.neToLokoja} 
              fill="none" 
              stroke="#1d4ed8" 
              strokeWidth="2" 
              strokeDasharray="4 2" 
              className="opacity-40"
            />
            <path 
              d={riversPath.lokojaToDelta} 
              fill="none" 
              stroke="#1d4ed8" 
              strokeWidth="2.5" 
              className="opacity-60"
            />

            {/* Glowing Confluence confluence point */}
            {(() => {
              const ptLokoja = getSvgCoords(7.7969, 6.7405);
              return (
                <g>
                  <circle cx={ptLokoja.x} cy={ptLokoja.y} r="5" fill="#1d4ed8" opacity="0.3" className="animate-ping" />
                  <circle cx={ptLokoja.x} cy={ptLokoja.y} r="2" fill="#3b82f6" />
                </g>
              );
            })()}

            {/* Render Region Highlight labels */}
            {(() => {
              // Approximate positions for regional texts
              const northWestPos = getSvgCoords(12.0, 6.0);
              const northEastPos = getSvgCoords(11.5, 11.5);
              const northCentralPos = getSvgCoords(9.2, 7.5);
              const southWestPos = getSvgCoords(7.2, 4.0);
              const southEastPos = getSvgCoords(6.0, 7.6);
              const southSouthPos = getSvgCoords(5.1, 5.8);

              return (
                <g className="pointer-events-none select-none font-sans">
                  <text x={northWestPos.x} y={northWestPos.y} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.4">NORTH WEST</text>
                  <text x={northEastPos.x} y={northEastPos.y} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.4">NORTH EAST</text>
                  <text x={northCentralPos.x} y={northCentralPos.y} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.4">NORTH CENTRAL</text>
                  <text x={southWestPos.x} y={southWestPos.y} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.4">SOUTH WEST</text>
                  <text x={southEastPos.x} y={southEastPos.y} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.4">SOUTH EAST</text>
                  <text x={southSouthPos.x} y={southSouthPos.y} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.4">SOUTH SOUTH</text>
                </g>
              );
            })()}

            {/* Render Nodes for All Cities */}
            {NIGERIA_CITIES.map(city => {
              const { x, y } = getSvgCoords(city.latitude, city.longitude);
              const isActive = city.name === selectedCityName;
              const matchesZone = selectedRegion === 'All' || city.region === selectedRegion;

              // Color coordinate based on zone or search status
              let nodeColor = isActive ? '#f43f5e' : matchesZone ? '#eedd88' : '#334155';
              if (searchTerm && city.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                nodeColor = '#3b82f6';
              }

              return (
                <g 
                  key={city.name}
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => onSelectCity(city)}
                >
                  <title>{city.name} ({city.state} State) - {city.peakSunHours} PSH</title>
                  {isActive ? (
                    <>
                      <circle cx={x} cy={y} r="8" fill="#f43f5e" opacity="0.3" className="animate-ping" />
                      <circle cx={x} cy={y} r="4" fill="#fb7185" stroke="#ffffff" strokeWidth="1" />
                    </>
                  ) : (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={matchesZone ? 3 : 1.5} 
                      fill={nodeColor} 
                      opacity={matchesZone ? 0.8 : 0.25} 
                      className="transition-all hover:fill-indigo-400"
                    />
                  )}
                </g>
              );
            })}

            {/* Custom overlay selected HUD anchor card inside Map area */}
            {activeCity && (() => {
              const activePos = getSvgCoords(activeCity.latitude, activeCity.longitude);
              return (
                <g className="pointer-events-none">
                  {/* Pull callout line */}
                  <line 
                    x1={activePos.x} 
                    y1={activePos.y} 
                    x2={activePos.x > 250 ? activePos.x - 30 : activePos.x + 30} 
                    y2={activePos.y > 200 ? activePos.y - 30 : activePos.y + 30} 
                    stroke="#f43f5e" 
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                </g>
              );
            })()}

          </svg>

          {/* Map info status line */}
          <div className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs flex justify-between items-center text-slate-300 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 relative flex leading-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 font-sans"></span>
              </span>
              <span>Selected capital: <strong className="font-semibold text-white">{activeCity.name}</strong></span>
            </div>
            <div className="text-slate-500 font-mono text-[10px]">
              {activeCity.latitude.toFixed(4)}°N, {activeCity.longitude.toFixed(4)}°E
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
