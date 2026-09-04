import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  IconPalette, 
  IconTypography, 
  IconComponents, 
  IconBook, 
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconMapPin,
  IconShieldCheck
} from '@tabler/icons-react';

export const DesignSystemScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const CHENNAI_SWATCHES = [
    { name: 'Marina Rust', hex: '#7B2D00', role: 'Primary dark background, headers, critical actions', text: 'text-white' },
    { name: 'Kolam Orange', hex: '#C8541A', role: 'Primary accent, active states, main CTAs', text: 'text-white' },
    { name: 'Bay of Bengal', hex: '#1A3A5C', role: 'Deep blue surfaces, verification cards, trusted borders', text: 'text-white' },
    { name: 'Neem Green', hex: '#2E7D6B', role: 'Success states, verified badges, reward earned', text: 'text-white' },
    { name: 'Jasmine Yellow', hex: '#F5C842', role: 'Reward highlights, ready chips, pending notices', text: 'text-[#2B1810]' },
    { name: 'Vepery Cream', hex: '#F7F0E6', role: 'Canvas background, warm surface base', text: 'text-[#2B1810]' },
    { name: 'Kapali Sand', hex: '#E8D5B7', role: 'Borders, dividers, secondary surfaces', text: 'text-[#2B1810]' },
    { name: 'Night Marina', hex: '#2B1810', role: 'Primary typography, deep contrast text', text: 'text-white' },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col pb-20">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} title="சென்னை Design System" />

      <main className="w-full max-w-4xl mx-auto px-4 pt-20 flex flex-col gap-10">

        {/* SECTION 1 — BRAND STORY */}
        <section className="bg-white rounded-3xl border border-[#E8D5B7] overflow-hidden ambient-shadow-modal flex flex-col">
          <div className="bg-[#7B2D00] text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
              <span className="font-tiro text-9xl">க</span>
            </div>
            
            <div className="relative z-10 max-w-xl flex flex-col gap-2">
              <span className="px-3 py-1 bg-white/20 text-[#F5C842] rounded-full text-xs font-jakarta font-bold w-fit">
                CULTURAL IDENTITY & DESIGN LANGUAGE
              </span>
              <h1 className="font-tiro text-2xl sm:text-3xl font-bold leading-tight mt-1">
                FindBack — Chennai's Lost & Found Network
              </h1>
              <p className="font-inter text-xs sm:text-sm text-[#E8D5B7] leading-relaxed mt-2">
                A design system rooted in the living heritage of Chennai. Inspired by the architectural ochres of the Marina Lighthouse, sacred terracotta and rust tones of the Kapaleeshwarar Temple, morning rice-flour Kolam patterns, and the deep, trustworthy expanse of the Bay of Bengal.
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-[#F7F0E6]/50">
            <div>
              <span className="font-tiro text-lg font-bold text-[#7B2D00] block">மெரினா</span>
              <span className="text-[11px] font-inter text-[#614436]">Marina Rust #7B2D00</span>
            </div>
            <div>
              <span className="font-tiro text-lg font-bold text-[#C8541A] block">கோலம்</span>
              <span className="text-[11px] font-inter text-[#614436]">Kolam Orange #C8541A</span>
            </div>
            <div>
              <span className="font-tiro text-lg font-bold text-[#1A3A5C] block">வங்கக்கடல்</span>
              <span className="text-[11px] font-inter text-[#614436]">Bay of Bengal #1A3A5C</span>
            </div>
            <div>
              <span className="font-tiro text-lg font-bold text-[#2E7D6B] block">வேம்பு</span>
              <span className="text-[11px] font-inter text-[#614436]">Neem Green #2E7D6B</span>
            </div>
          </div>
        </section>

        {/* SECTION 2 — COLOUR PALETTE */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#E8D5B7] pb-2">
            <IconPalette size={22} className="text-[#7B2D00]" />
            <h2 className="font-tiro text-xl font-bold text-[#2B1810]">
              வண்ணத் தட்டு (Colour Palette — 8 Named Tokens)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {CHENNAI_SWATCHES.map((swatch) => (
              <div
                key={swatch.hex}
                onClick={() => handleCopy(swatch.hex)}
                className="rounded-2xl border border-[#E8D5B7] overflow-hidden bg-white ambient-shadow-card flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
                title="Click to copy HEX"
              >
                <div
                  style={{ backgroundColor: swatch.hex }}
                  className={`h-24 p-3 flex flex-col justify-between ${swatch.text}`}
                >
                  <span className="font-mono text-xs font-bold">{swatch.hex}</span>
                  {copiedColor === swatch.hex && (
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-bold self-end">
                      COPIED ✓
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <span className="font-jakarta font-bold text-xs text-[#2B1810]">
                    {swatch.name}
                  </span>
                  <span className="font-inter text-[11px] text-[#614436] leading-snug">
                    {swatch.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — TYPOGRAPHY SCALE */}
        <section className="bg-white rounded-2xl border border-[#E8D5B7] p-6 ambient-shadow-card flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#E8D5B7] pb-2">
            <IconTypography size={22} className="text-[#7B2D00]" />
            <h2 className="font-tiro text-xl font-bold text-[#2B1810]">
              எழுத்துரு அளவுகோல் (Typography Hierarchy)
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            {/* Display: Tiro Tamil */}
            <div className="p-4 bg-[#F7F0E6] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-inter font-bold text-[#7B2D00]">
                DISPLAY — TIRO TAMIL (தமிழ் தலைப்பு)
              </span>
              <span className="font-tiro text-3xl font-bold text-[#2B1810]">
                தொலைந்த பொருள் மீட்பு வலைப்பின்னல் (32px)
              </span>
              <span className="font-tiro text-2xl font-semibold text-[#7B2D00]">
                சென்னை சமூக மீட்பு மையம் (24px)
              </span>
            </div>

            {/* Headings: Plus Jakarta Sans */}
            <div className="p-4 bg-[#F7F0E6] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-inter font-bold text-[#1A3A5C]">
                UI HEADINGS — PLUS JAKARTA SANS
              </span>
              <span className="font-jakarta text-xl font-bold text-[#2B1810]">
                Verified Community Partner Hubs (20px Bold)
              </span>
              <span className="font-jakarta text-base font-semibold text-[#1A3A5C]">
                Intake & Drop-off Intake Slip Generator (16px SemiBold)
              </span>
            </div>

            {/* Body: Inter */}
            <div className="p-4 bg-[#F7F0E6] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-inter font-bold text-[#2E7D6B]">
                BODY & DESCRIPTIONS — INTER
              </span>
              <p className="font-inter text-sm text-[#2B1810] leading-relaxed">
                Finders drop lost items at community hubs across Chennai. Owners claim them through verified proof of ownership, pay a minimal handling fee, and finders receive an instant ₹60 integrity reward. (14px Regular)
              </p>
            </div>

            {/* Reference: JetBrains Mono */}
            <div className="p-4 bg-[#F7F0E6] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-inter font-bold text-[#7B2D00]">
                IDENTIFIERS & CODES — JETBRAINS MONO
              </span>
              <span className="font-mono text-lg font-bold text-[#7B2D00] tracking-wider">
                #FB-2024-0041 • IME: 8642-9901-2384-510 (18px Mono)
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 4 — COMPONENT LIBRARY */}
        <section className="bg-white rounded-2xl border border-[#E8D5B7] p-6 ambient-shadow-card flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#E8D5B7] pb-2">
            <IconComponents size={22} className="text-[#7B2D00]" />
            <h2 className="font-tiro text-xl font-bold text-[#2B1810]">
              கூறுகள் நூலகம் (Component Library Samples)
            </h2>
          </div>

          {/* Button states */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-jakarta font-bold text-[#614436]">
              Buttons (Kolam Orange, Marina Rust Outline, Ghost):
            </span>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="md">
                <span>உறுதிப்படுத்து (Primary)</span>
              </Button>
              <Button variant="secondary" size="md">
                <span>QR Save பண்ணு (Secondary)</span>
              </Button>
              <Button variant="ghost" size="md">
                <span>பின்செல்ல (Ghost)</span>
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-jakarta font-bold text-[#614436]">
              Status Badges (Reported, In Custody, Listed, Claimed, Returned):
            </span>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="reported" />
              <StatusBadge status="dropped_at_hub" />
              <StatusBadge status="listed" />
              <StatusBadge status="claimed" />
              <StatusBadge status="returned" />
            </div>
          </div>

          {/* Hub Card Preview */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-jakarta font-bold text-[#614436]">
              Interactive Hub Card (Split Bay of Bengal / Cream):
            </span>
            <div className="max-w-md rounded-2xl border border-[#E8D5B7] overflow-hidden">
              <div className="bg-[#1A3A5C] text-white p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-tiro text-sm font-bold">தியாகராய நகர் Hub (T.Nagar)</h4>
                  <span className="text-[11px] text-[#E8D5B7]">74 Usman Road, Chennai</span>
                </div>
                <span className="px-2.5 py-0.5 bg-[#7B2D00] text-white text-xs font-bold rounded-full">
                  1.2 km
                </span>
              </div>
              <div className="bg-[#F7F0E6] p-3 flex items-center justify-between text-xs">
                <span className="text-[#2E7D6B] font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D6B]" /> 8AM - 10PM வரை திறந்திருக்கும்
                </span>
                <span className="text-[#7B2D00] font-bold">Verified Operator ✓</span>
              </div>
            </div>
          </div>

        </section>

        {/* Back to App CTA */}
        <div className="flex justify-center pb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('role-selection')}
            className="rounded-2xl px-8"
          >
            <span>பயன்பாட்டிற்கு திரும்பு (Return to FindBack App)</span>
          </Button>
        </div>

      </main>
    </div>
  );
};
