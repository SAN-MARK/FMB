import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoundItem, ItemStatus } from '../types';
import { INITIAL_HUBS, ChennaiHub } from '../data/mockData';
import { FindBackLogo } from '../components/common/FindBackLogo';
import { 
  IconLayoutDashboard, 
  IconPackage, 
  IconShieldCheck, 
  IconCash, 
  IconSettings, 
  IconSearch, 
  IconQrcode, 
  IconCheck, 
  IconX, 
  IconAlertCircle, 
  IconClock, 
  IconChevronRight, 
  IconArrowLeft,
  IconEye
} from '@tabler/icons-react';

export const HubOperatorScreen: React.FC = () => {
  const { items, hubs, updateItemStatus, navigateTo, user } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'custody' | 'claims' | 'payouts' | 'settings'>('dashboard');
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-chennai-tnagar-02');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingItem, setVerifyingItem] = useState<FoundItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const chennaiHubs = INITIAL_HUBS as ChennaiHub[];
  const currentHub = chennaiHubs.find(h => h.id === selectedHubId) || chennaiHubs[0];

  // Filter items for this hub
  const hubItems = items.filter(item => {
    const matchesHub = selectedHubId === 'all' || item.hub_id === selectedHubId;
    const matchesSearch =
      searchQuery === '' ||
      item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesHub && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    await updateItemStatus(itemId, newStatus);
    showToast(`Status updated to ${newStatus}`);
  };

  const handleApproveClaim = async (item: FoundItem) => {
    await updateItemStatus(item.id, 'claimed');
    setVerifyingItem(null);
    showToast(`Claim for #${item.item_code} APPROVED. Release slip generated.`);
  };

  const handleRejectClaim = (item: FoundItem) => {
    setVerifyingItem(null);
    showToast(`Claim for #${item.item_code} rejected.`);
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] flex flex-col md:flex-row text-[#2B1810]">
      
      {/* SIDEBAR: Marina Rust (#7B2D00), 240px wide */}
      <aside className="w-full md:w-60 bg-[#7B2D00] text-white flex flex-col shrink-0 md:min-h-screen">
        
        {/* Top Header with FindBack White Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7B2D00] font-bold text-xs">
              FB
            </div>
            <div>
              <span className="font-jakarta font-bold text-base tracking-wide block leading-none text-white">
                FindBack
              </span>
              <span className="font-tiro text-[11px] text-[#F5C842]">
                Hub Operator Console
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('role-selection')}
            className="md:hidden text-white/80 hover:text-white"
          >
            <IconArrowLeft size={20} />
          </button>
        </div>

        {/* Menu Items: Dashboard | Items In Custody | Verify Claims | Payouts | Settings */}
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', tamil: 'முகப்பு', icon: IconLayoutDashboard },
            { id: 'custody', label: 'Items In Custody', tamil: 'பாதுகாப்பில் உள்ளவை', icon: IconPackage },
            { id: 'claims', label: 'Verify Claims', tamil: 'சரிபார்ப்புகள்', icon: IconShieldCheck },
            { id: 'payouts', label: 'Payouts', tamil: 'பரிசுத் தொகைகள்', icon: IconCash },
            { id: 'settings', label: 'Settings', tamil: 'அமைப்புகள்', icon: IconSettings },
          ].map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`relative px-5 py-3 text-left flex items-center gap-3 text-xs font-jakarta transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black/20 text-white font-bold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Active item: Jasmine Yellow icon + left accent bar (3px) */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F5C842]" />
                )}
                <Icon size={18} className={isActive ? 'text-[#F5C842]' : 'text-white/60'} />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-[10px] font-tiro opacity-75">{item.tamil}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Operator Profile Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-[#F5C842] text-[#2B1810] font-bold text-xs flex items-center justify-center shrink-0">
              M
            </div>
            <div className="truncate">
              <span className="block text-xs font-bold text-white truncate">Murugan S.</span>
              <span className="block text-[10px] text-white/70 truncate">{currentHub.name}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('role-selection')}
            className="text-white/70 hover:text-white text-xs underline cursor-pointer"
            title="Switch View"
          >
            Exit
          </button>
        </div>
      </aside>

      {/* MAIN AREA: Vepery Cream (#F7F0E6) background */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-6xl">
        
        {/* Top Hub Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-tiro text-2xl md:text-3xl font-bold text-[#7B2D00]">
              {currentHub.tamil_name} — நிர்வாக மையம்
            </h1>
            <p className="font-inter text-xs text-[#614436]">
              Verified intake & claim custody station · {currentHub.address}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-jakarta text-[#614436]">Select Hub:</span>
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E8D5B7] rounded-xl text-xs font-jakarta font-semibold text-[#2B1810] focus:outline-none focus:border-[#7B2D00]"
            >
              <option value="all">All Chennai Hubs</option>
              {chennaiHubs.map(h => (
                <option key={h.id} value={h.id}>
                  {h.tamil_name || h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATS ROW (4 CARDS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Items (Marina Rust) */}
          <div className="bg-[#7B2D00] text-white rounded-2xl p-4 ambient-shadow-card flex flex-col justify-between">
            <span className="text-xs font-jakarta text-white/80">Total Items in Custody</span>
            <div className="mt-2">
              <span className="font-jakarta text-3xl font-bold">{hubItems.length}</span>
              <span className="text-[11px] font-tiro block text-[#E8D5B7]">பொருட்கள் இருப்பு</span>
            </div>
          </div>

          {/* Card 2: Active Claims (Bay of Bengal) */}
          <div className="bg-[#1A3A5C] text-white rounded-2xl p-4 ambient-shadow-card flex flex-col justify-between">
            <span className="text-xs font-jakarta text-white/80">Active Claims</span>
            <div className="mt-2">
              <span className="font-jakarta text-3xl font-bold">
                {hubItems.filter(i => i.status === 'reported' || i.status === 'listed').length}
              </span>
              <span className="text-[11px] font-tiro block text-[#E8D5B7]">சரிபார்ப்பு நிலுவையில்</span>
            </div>
          </div>

          {/* Card 3: Returned This Month (Neem Green) */}
          <div className="bg-[#2E7D6B] text-white rounded-2xl p-4 ambient-shadow-card flex flex-col justify-between">
            <span className="text-xs font-jakarta text-white/80">Returned This Month</span>
            <div className="mt-2">
              <span className="font-jakarta text-3xl font-bold">14</span>
              <span className="text-[11px] font-tiro block text-[#F0FDF4]">உரிமையாளரிடம் ஒப்படைப்பு</span>
            </div>
          </div>

          {/* Card 4: Pending Payouts (Jasmine Yellow) */}
          <div className="bg-[#F5C842] text-[#2B1810] rounded-2xl p-4 ambient-shadow-card flex flex-col justify-between">
            <span className="text-xs font-jakarta font-semibold text-[#2B1810]/80">Pending Payouts</span>
            <div className="mt-2">
              <span className="font-jakarta text-3xl font-bold">₹840</span>
              <span className="text-[11px] font-tiro block text-[#614436]">Finder பரிசுகள்</span>
            </div>
          </div>
        </div>

        {/* INVENTORY TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-[#E8D5B7] overflow-hidden ambient-shadow-card flex flex-col">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-[#E8D5B7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C765C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tag ID, Category, Location..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-xs text-[#2B1810]"
              />
            </div>

            <span className="text-xs font-jakarta text-[#614436]">
              Showing {hubItems.length} items
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Header row: Kapali Sand (#E8D5B7) background, Night Marina text */}
              <thead>
                <tr className="bg-[#E8D5B7] text-[#2B1810] text-xs font-jakarta font-bold">
                  <th className="py-3 px-4">Tag ID</th>
                  <th className="py-3 px-4">Category & Photo</th>
                  <th className="py-3 px-4">Intake Location</th>
                  <th className="py-3 px-4">Days Held</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              {/* Rows: alternating white / cream, 48px height */}
              <tbody className="text-xs">
                {hubItems.map((item, index) => {
                  // Days held calculation simulation
                  const daysHeld = index === 0 ? 1 : index === 1 ? 7 : index === 2 ? 12 : 3;

                  // Days held color coding: > 5 turns Kolam Orange, > 10 turns Marina Rust
                  const daysColorClass =
                    daysHeld > 10
                      ? 'text-[#7B2D00] font-bold bg-[#7B2D00]/10 px-2 py-0.5 rounded-full'
                      : daysHeld > 5
                      ? 'text-[#C8541A] font-bold bg-[#C8541A]/10 px-2 py-0.5 rounded-full'
                      : 'text-[#614436]';

                  return (
                    <tr
                      key={item.id}
                      className={`h-12 border-b border-[#E8D5B7]/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F7F0E6]/50'
                      } hover:bg-[#E8D5B7]/30`}
                    >
                      {/* Tag ID */}
                      <td className="py-2.5 px-4 font-mono font-bold text-[#7B2D00]">
                        #{item.item_code}
                      </td>

                      {/* Category & Photo */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.photo_url}
                            alt={item.category}
                            className="w-8 h-8 rounded-lg object-cover border border-[#E8D5B7]"
                          />
                          <span className="font-jakarta font-semibold text-[#2B1810]">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Intake Location */}
                      <td className="py-2.5 px-4 text-[#614436] truncate max-w-[140px]">
                        {item.location_name}
                      </td>

                      {/* Days Held */}
                      <td className="py-2.5 px-4">
                        <span className={daysColorClass}>
                          {daysHeld} {daysHeld === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      {/* Current Status Dropdown */}
                      <td className="py-2.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as ItemStatus)}
                          className={`px-2 py-1 rounded-lg text-xs font-jakarta font-semibold border cursor-pointer ${
                            item.status === 'claimed' || item.status === 'returned'
                              ? 'bg-[#2E7D6B]/15 text-[#14532D] border-[#2E7D6B]'
                              : item.status === 'dropped_at_hub'
                              ? 'bg-[#1A3A5C]/15 text-[#1A3A5C] border-[#1A3A5C]'
                              : 'bg-[#C8541A]/15 text-[#C8541A] border-[#C8541A]'
                          }`}
                        >
                          <option value="reported">Reported</option>
                          <option value="dropped_at_hub">In Custody</option>
                          <option value="listed">Listed Online</option>
                          <option value="claimed">Claim Approved</option>
                          <option value="returned">Returned to Owner</option>
                        </select>
                      </td>

                      {/* Actions: Verify Claim */}
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setVerifyingItem(item)}
                          className="px-3 py-1 bg-[#1A3A5C] text-white rounded-lg text-xs font-jakarta font-semibold hover:bg-[#152e49] transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          <IconEye size={14} />
                          <span>Verify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* VERIFY CLAIM SPLIT VIEW (MODAL / SLIDE-OVER) */}
      {verifyingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1810]/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-[#E8D5B7] overflow-hidden ambient-shadow-modal flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#7B2D00] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-tiro text-lg font-bold">
                  உரிமைச் சான்று ஒப்பீடு (Claim Verification Split-View)
                </h3>
                <span className="font-mono text-xs text-[#F5C842]">
                  Tag: #{verifyingItem.item_code} • {verifyingItem.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingItem(null)}
                className="text-white/80 hover:text-white"
              >
                <IconX size={22} />
              </button>
            </div>

            {/* Split Content */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F7F0E6]/30">
              
              {/* LEFT: Photo from finder + details (Bay of Bengal card) */}
              <div className="bg-[#1A3A5C] text-white rounded-xl p-4 flex flex-col gap-3">
                <span className="px-2 py-0.5 bg-white/20 text-[#F5C842] rounded-md text-[10px] font-bold w-fit">
                  FINDER RECORD (கண்டவர் பதிவு)
                </span>

                <div className="h-44 w-full rounded-lg overflow-hidden bg-black/20 border border-white/20">
                  <img
                    src={verifyingItem.photo_url}
                    alt="Finder record"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-xs flex flex-col gap-1">
                  <div>
                    <span className="text-white/70 block">Location Found:</span>
                    <span className="font-semibold">{verifyingItem.location_name}</span>
                  </div>
                  <div>
                    <span className="text-white/70 block">Finder Notes:</span>
                    <span className="font-inter text-white/90">
                      {verifyingItem.description || 'Intake deposited in T.Nagar hub.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Proof from owner (bills, screenshot, Aadhaar masked) */}
              <div className="bg-white border border-[#E8D5B7] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#2E7D6B]/15 text-[#14532D] rounded-md text-[10px] font-bold w-fit">
                    OWNER SUBMISSION (உரிமையாளர் ஆவணம்)
                  </span>
                  
                  {/* IMEI match indicator: Neem Green badge "IMEI பொருந்துகிறது ✓" */}
                  <span className="px-2.5 py-0.5 bg-[#2E7D6B] text-white rounded-full text-[10px] font-bold shadow-xs">
                    IMEI பொருந்துகிறது ✓
                  </span>
                </div>

                {/* Proof Screenshot simulation */}
                <div className="h-44 w-full rounded-lg overflow-hidden bg-[#F7F0E6] border border-[#E8D5B7] p-3 flex flex-col justify-between text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#2B1810]">Invoice / Serial Verification:</span>
                    <span className="font-mono text-xs text-[#7B2D00] bg-white p-1.5 rounded border border-[#E8D5B7]">
                      IMEI: 8642-9901-2384-510 [MATCH]
                    </span>
                  </div>

                  <div className="p-2 bg-[#F0FDF4] rounded border border-[#2E7D6B]/30 text-[11px] text-[#14532D]">
                    <strong>Digilocker Identity:</strong> Verified Aadhaar (XXXX-XXXX-8921)
                  </div>
                </div>

                <div className="text-xs flex flex-col gap-1">
                  <span className="text-[#614436] block">Owner Secret Detail:</span>
                  <p className="font-inter text-[#2B1810] bg-[#F7F0E6] p-2 rounded-lg border border-[#E8D5B7]">
                    "நீல நிற leather wallet, front corner-ல் சிறிய scratch இருக்கு."
                  </p>
                </div>
              </div>

            </div>

            {/* BOTTOM ACTION BAR (sticky, Marina Rust): "Approve Claim" (Neem Green) | "Request More Info" (Jasmine) | "Reject" (Red) */}
            <div className="bg-[#7B2D00] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <span className="text-xs text-white/80 font-jakarta">
                Decision requires physical release verification at counter
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleRejectClaim(verifyingItem)}
                  className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-jakarta font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast('SMS / WhatsApp query sent to owner.');
                    setVerifyingItem(null);
                  }}
                  className="px-4 py-2 bg-[#F5C842] text-[#2B1810] rounded-xl text-xs font-jakarta font-bold hover:brightness-105 transition-colors cursor-pointer"
                >
                  Request More Info
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveClaim(verifyingItem)}
                  className="px-5 py-2 bg-[#2E7D6B] text-white rounded-xl text-xs font-jakarta font-bold hover:brightness-110 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <IconCheck size={16} stroke={3} />
                  <span>Approve Claim</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B1810] text-white px-4 py-3 rounded-xl text-xs font-jakarta font-bold shadow-xl border border-[#E8D5B7]/30 flex items-center gap-2 animate-bounce-short">
          <IconCheck size={16} className="text-[#2E7D6B]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
