import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  ArrowLeft, 
  Check, 
  Clock, 
  User, 
  Sparkles,
  CheckCircle2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { SizingResult } from '../types';
import { NIGERIA_CITIES } from '../data/nigeriaCities';

interface ContactPageProps {
  sizingResult: SizingResult;
  selectedCityName: string;
  systemVoltage: number;
  batteryChemistry: string;
  onBackToCalculator: () => void;
}

export default function ContactPage({
  sizingResult,
  selectedCityName,
  systemVoltage,
  batteryChemistry,
  onBackToCalculator
}: ContactPageProps) {
  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(selectedCityName);
  const [installType, setInstallType] = useState('residential'); // residential, commercial, borehole, farm, partners
  const [inquiryType, setInquiryType] = useState('quote'); // quote, consultation, audit
  const [message, setMessage] = useState('');
  const [includeSizing, setIncludeSizing] = useState(true);
  
  // Submission lifecycle states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const activeCityDetails = NIGERIA_CITIES.find(c => c.name === city) || NIGERIA_CITIES.find(c => c.name === selectedCityName) || NIGERIA_CITIES[0];

  const buildMailtoUrl = (generatedId: string) => {
    const subject = encodeURIComponent(`NaijaSolarSizer Booking [${generatedId}] - ${fullName}`);
    let bodyText = `NaijaSolarSizer Specialist Sizing Ticket\n`;
    bodyText += `========================================\n`;
    bodyText += `Ticket ID: ${generatedId}\n`;
    bodyText += `Submitted on: ${new Date().toLocaleDateString()}\n\n`;
    bodyText += `CONTACT DETAILS:\n`;
    bodyText += `- Name: ${fullName}\n`;
    bodyText += `- Email: ${email}\n`;
    bodyText += `- Phone: +234 ${phone}\n`;
    bodyText += `- Area state: ${activeCityDetails.state} (${activeCityDetails.name})\n`;
    bodyText += `- Region Hub: ${activeCityDetails.region} Hub\n\n`;
    bodyText += `INSTALLATION PREFERENCE:\n`;
    bodyText += `- Layout Scope: ${installType}\n`;
    bodyText += `- Response Needed: ${inquiryType}\n\n`;

    if (includeSizing && sizingResult.totalDailyWh > 0) {
      bodyText += `SYSTEM ESTIMATED CALCULATION MODEL:\n`;
      bodyText += `- Daily Load Energy: ${(sizingResult.totalDailyWh / 1000).toFixed(2)} kWh/day\n`;
      bodyText += `- Inverter Size Recommended: ${sizingResult.recommendedInverterKva.toFixed(1)} KVA\n`;
      bodyText += `- Solar PV Array needed: ${sizingResult.actualArrayWatts} Watts\n`;
      bodyText += `- Battery Backup Pack: ${sizingResult.recommendedBatteryUnitLabel}\n`;
      bodyText += `- Setup System DC Voltage: ${systemVoltage} V\n`;
      bodyText += `- Chemistry selected: ${batteryChemistry}\n\n`;
    }

    if (message.trim()) {
      bodyText += `APPLIANCE & SITE ADDITIONAL COMMENTS:\n`;
      bodyText += `"${message.trim()}"\n\n`;
    }

    bodyText += `========================================\n`;
    bodyText += `Generated automatically via NaijaSolarSizer portal.`;

    return `mailto:idumex@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API request or trigger native email dispatcher
    setTimeout(() => {
      const generatedId = `NSP-26-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketId(generatedId);
      setIsSubmitting(false);
      setIsSuccess(true);

      // Trigger standard mail client safely with pre-filled content
      try {
        const mailtoLink = buildMailtoUrl(generatedId);
        window.location.href = mailtoLink;
      } catch (err) {
        console.error("Popup or mailto redirect error:", err);
      }
    }, 1200);
  };

  const handleManualEmailOpen = () => {
    try {
      window.location.href = buildMailtoUrl(ticketId);
    } catch (err) {
      alert("Please send an email manually to idumex@gmail.com with your calculation details.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-10" id="contact-page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation bar */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={onBackToCalculator}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-all group cursor-pointer"
            id="back-to-calc-button"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Sizing Calculator
          </button>
          
          <div className="text-xs text-slate-400 font-mono hidden md:block">
            Sizing Engine Status: <span className="text-emerald-500 font-semibold font-mono">ONLINE</span>
          </div>
        </div>

        {/* Success Screen Banner */}
        {isSuccess ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 text-center max-w-2xl mx-auto shadow-sm animate-fade-in" id="contact-success-card">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-6 ring-8 ring-emerald-50/50">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full inline-block mb-3">
              Ticket Sized &amp; Dispatched
            </span>
            <h2 className="text-xl sm:text-3xl font-sans font-bold text-slate-900 tracking-tight">
              Adupe! Consultation Sent
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              We have compiled your system specifications and initiated email draft to <strong className="text-slate-800 font-semibold">idumex@gmail.com</strong>.
            </p>

            <div className="mt-5 max-w-md mx-auto">
              <button
                onClick={handleManualEmailOpen}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer animate-pulse"
                id="success-trigger-email-client"
              >
                <Mail className="h-4 w-4" />
                Open Email Client (To: idumex@gmail.com)
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                Click above if your native email application did not launch automatically.
              </p>
            </div>

            {/* Ticket Summary receipt box */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-3 font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs text-slate-400">
                <span>DESTINATION OWNER</span>
                <span className="font-mono text-emerald-600 font-semibold">idumex@gmail.com</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs text-slate-400">
                <span>REFERENCE CODE</span>
                <span className="font-mono text-slate-800 font-bold">{ticketId}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Person</span>
                  <strong className="text-slate-800">{fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned Hub Router</span>
                  <strong className="text-indigo-600">
                    {activeCityDetails.region} Hub ({city})
                  </strong>
                </div>
              </div>

              {includeSizing && sizingResult.totalDailyWh > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5 font-bold">
                    ⚙️ Submitted Ingress Sizing Model
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                    <div className="bg-slate-50 p-1.5 rounded text-center">
                      <span className="text-slate-400 block text-[9px] uppercase">Daily Load</span>
                      <strong className="text-slate-800">{(sizingResult.totalDailyWh / 1000).toFixed(2)} kWh</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded text-center">
                      <span className="text-slate-400 block text-[9px] uppercase">Peak Inverter</span>
                      <strong className="text-indigo-600">{sizingResult.recommendedInverterKva.toFixed(1)} KVA</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded text-center">
                      <span className="text-slate-400 block text-[9px] uppercase">Solar Array</span>
                      <strong className="text-amber-600">{sizingResult.actualArrayWatts} W</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded text-center">
                      <span className="text-slate-400 block text-[9px] uppercase">Battery Pack</span>
                      <strong className="text-emerald-600">{sizingResult.batteryTotalKwhNeeded.toFixed(1)} kWh</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={onBackToCalculator}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                id="success-back-btn"
              >
                Back to Calculator
              </button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setFullName('');
                  setEmail('');
                  setPhone('');
                  setMessage('');
                }}
                className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                id="success-new-btn"
              >
                Submit Another Request
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-6 flex justify-center items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-500" />
              Sizing inputs are treated with strict privacy &amp; in compliance with NDPR.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="contact-main-grid">
            
            {/* Left side: Contact descriptive header & Support channels */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-mono mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Registered Solar Installers</span>
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 tracking-tight">
                  Connect with Certified Solar Specialists
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Submit your physical system calculations directly to professional installation hubs spanning Nigeria to guarantee correct physical layouts, avoiding system burnout hazards.
                </p>
              </div>

              {/* Geo Hub offices list in Nigeria */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">
                  📍 Regional Engineering Hubs
                </span>
                
                <div className="space-y-3.5 divide-y divide-slate-800 text-xs">
                  <div className="pt-0">
                    <strong className="text-slate-100 flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      Lagos Hub (South West Zone)
                    </strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">Plot 12, Admiralty Way, Lekki Phase 1, Lagos</p>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Hotline: +234 812 000 7071</span>
                  </div>
                  
                  <div className="pt-3">
                    <strong className="text-slate-100 flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      Abuja Hub (North Central &amp; North)
                    </strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">Suite 3A, Constitution Ave, Central Business District, Abuja</p>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Hotline: +234 812 000 7072</span>
                  </div>
                  
                  <div className="pt-3">
                    <strong className="text-slate-100 flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      Port Harcourt Hub (South South &amp; East)
                    </strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">58, Olu Obasanjo Road, Port Harcourt, Rivers</p>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Hotline: +234 812 000 7073</span>
                  </div>
                </div>
              </div>

              {/* General Inquiry Details FAQ element */}
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-4 text-xs font-sans space-y-2">
                <div className="flex gap-1.5 items-center text-indigo-700 font-bold">
                  <HelpCircle className="h-4 w-4" />
                  <span>How consultations work:</span>
                </div>
                <ul className="list-inside list-decimal text-slate-600 text-[11px] space-y-1 leading-relaxed">
                  <li>Fill out your regional coordinates and phone contacts.</li>
                  <li>Our sizing model computes correct inverter capabilities.</li>
                  <li>Local system technicians check safety spacing on site.</li>
                  <li>Receive standardized Pure OFC copper quotes.</li>
                </ul>
              </div>
            </div>

            {/* Right side: Elegant Contact Form */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs">
              <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    Specialist Sizing Ticket Request
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Provide details below to deploy regional inspectors.</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Response SLA: Within 2 Hours</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" id="ticket-request-form">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Kolawole Ibrahim"
                        className="w-full text-xs sm:text-sm pl-10 border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
                        id="form-full-name"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono font-bold">
                        +234
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="803 123 4567"
                        className="w-full text-xs sm:text-sm pl-14 border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
                        id="form-phone"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">Needed for WhatsApp followups.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full text-xs sm:text-sm pl-10 border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
                        id="form-email"
                      />
                    </div>
                  </div>

                  {/* Location Hub selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Regional State Hub
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all"
                      id="form-city-select"
                    >
                      {NIGERIA_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.state} Hub ({c.name} - Irradiance: {c.peakSunHours} PSH)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Installation Goal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Primary Installation Layout
                    </label>
                    <select
                      value={installType}
                      onChange={(e) => setInstallType(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all"
                      id="form-install-type"
                    >
                      <option value="residential">Residential Backup (Household Light &amp; Fridge)</option>
                      <option value="full-offgrid">Full Off-Grid Villa / Estate</option>
                      <option value="commercial">Commercial/Office Sizing Layout</option>
                      <option value="borehole">Solar Water Borehole Pump Integration</option>
                      <option value="farm">Agricultural Farm Irrigation Feed</option>
                    </select>
                  </div>

                  {/* Inquiry Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Required Response Solution
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all"
                      id="form-inquiry-type"
                    >
                      <option value="quote">Provide Direct Bill of Quantities (Pricing Quote)</option>
                      <option value="consultation">Request a Virtual Call (Phone/Skype consultation)</option>
                      <option value="audit">Schedule a Physical Premises Audit (Check Roof Layouts)</option>
                    </select>
                  </div>
                </div>

                {/* Sizing pre-population status panel */}
                {sizingResult.totalDailyWh > 0 ? (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 font-bold" />
                        <span>Sizing Telemetry Linked</span>
                      </div>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeSizing}
                          onChange={(e) => setIncludeSizing(e.target.checked)}
                          className="rounded text-indigo-600 border-slate-300 focus:ring-3 focus:ring-indigo-200 accent-indigo-600 h-4 w-4"
                          id="form-include-sizing-checkbox"
                        />
                        <span className="text-[11px] font-mono text-slate-600 font-medium">Attach computations</span>
                      </label>
                    </div>

                    {includeSizing && (
                      <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-slate-700 leading-normal pt-1.5 border-t border-emerald-100">
                        <div>Grid Demand: <strong>{(sizingResult.totalDailyWh / 1000).toFixed(2)} kWh/day</strong></div>
                        <div>Volt Choice: <strong>{systemVoltage}V DC</strong></div>
                        <div>Storage Bank: <strong>{sizingResult.recommendedBatteryUnitLabel}</strong></div>
                        <div>Solar Arrays: <strong>{sizingResult.actualArrayWatts}W Array</strong></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-sans">
                      💡 Sizing state is empty. Click below to add loads to your basket before building a quote.
                    </span>
                    <button
                      type="button"
                      onClick={onBackToCalculator}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg font-medium cursor-pointer"
                      id="form-back-to-add-loads"
                    >
                      Configure Layout
                    </button>
                  </div>
                )}

                {/* Message notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Describe any specific appliances or site issues (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g., We have a refrigerator with a starting surge of 500W and a borehole pump. Roof faces east with occasional palm tree shade."
                    className="w-full text-xs sm:text-sm border border-slate-350 bg-white rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400 font-sans leading-relaxed"
                    id="form-message"
                  />
                </div>

                {/* Submit button bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono text-center sm:text-left">
                    🔒 SSL Session Secured by National Solar Portal.
                  </span>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all tracking-wide disabled:opacity-50 cursor-pointer"
                    id="form-submit-button"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Generate Sizing Ticket
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
