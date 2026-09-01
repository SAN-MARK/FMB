import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ItemStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';

export const HubOperatorScreen: React.FC = () => {
  const { items, hubs, updateItemStatus, navigateTo, user, setActiveItem } = useApp();
  const [selectedHubId, setSelectedHubId] = useState(hubs[0]?.id || 'hub-downtown-01');
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const currentHub = hubs.find(h => h.id === selectedHubId) || hubs[0];

  const hubItems = items.filter(item => {
    const matchesHub = item.hub_id === selectedHubId || selectedHubId === 'all';
    const matchesSearch =
      searchFilter === '' ||
      item.item_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesHub && matchesSearch;
  });

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCodeInput.trim()) return;

    const formatted = scanCodeInput.trim().toUpperCase();
    const match = items.find(i => i.item_code.toUpperCase() === formatted || i.id === scanCodeInput.trim());

    if (match) {
      setActiveItem(match);
      updateItemStatus(match.id, 'dropped_at_hub');
      alert(`Item #${match.item_code} successfully scanned in at ${currentHub.name}!`);
      setScanCodeInput('');
    } else {
      alert(`No item found with Tag ID "${scanCodeInput}". Please check the tag number.`);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    await updateItemStatus(itemId, newStatus);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pt-16 pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} />

      <main className="max-w-[1200px] mx-auto px-container-margin-mobile md:px-container-margin-desktop py-6 md:py-8 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-label-bold bg-secondary-container/20 text-secondary border border-secondary-container/40">
                Staff & Operator Console
              </span>
              <span className="text-xs text-on-surface-variant font-mono">V1.0.4</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              Hub Inventory & Drop-off Intake
            </h1>
          </div>

          {/* Hub Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-label-bold text-on-surface-variant">Hub:</span>
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-label-bold text-primary focus:border-primary outline-none"
            >
              <option value="all">All Hubs (Network View)</option>
              {hubs.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick QR / Tag Scan Bar */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 ambient-shadow-card">
          <form onSubmit={handleQuickScan} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-xl">
                qr_code_scanner
              </span>
              <input
                type="text"
                value={scanCodeInput}
                onChange={(e) => setScanCodeInput(e.target.value)}
                placeholder="Scan QR or enter Tag ID (e.g. FB-9921-X)..."
                className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm font-mono focus:border-primary outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="reward"
              size="md"
              className="w-full sm:w-auto shrink-0"
              icon={<span className="material-symbols-outlined text-sm">check</span>}
            >
              Intake Scan
            </Button>
          </form>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter queue by keyword or tag..."
            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs w-full max-w-xs outline-none focus:border-primary"
          />
          <span className="text-xs text-on-surface-variant font-label-bold">
            {hubItems.length} items in queue
          </span>
        </div>

        {/* Items Table / Queue */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-bold">
                <tr>
                  <th className="p-3.5 pl-5">Item</th>
                  <th className="p-3.5">Tag Code</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Advance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {hubItems.map(item => (
                  <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.photo_url}
                          alt={item.category}
                          className="w-10 h-10 rounded-lg object-cover bg-surface-container-high"
                        />
                        <div>
                          <p className="font-bold text-on-surface text-sm">{item.category}</p>
                          <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">
                            {item.description || 'Reported found'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-primary">
                      {item.item_code}
                    </td>

                    <td className="p-3.5 text-on-surface-variant">
                      {item.location_name}
                    </td>

                    <td className="p-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="inline-flex gap-1.5 justify-end">
                        {item.status === 'reported' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'dropped_at_hub')}
                            className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-lg font-label-bold text-[11px] hover:opacity-90"
                          >
                            Mark At Hub
                          </button>
                        )}
                        {item.status === 'dropped_at_hub' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'listed')}
                            className="px-2.5 py-1 bg-primary text-white rounded-lg font-label-bold text-[11px] hover:bg-primary/90"
                          >
                            Publish Listed
                          </button>
                        )}
                        {item.status === 'listed' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'claimed')}
                            className="px-2.5 py-1 bg-primary-fixed-dim text-on-primary-fixed rounded-lg font-label-bold text-[11px] hover:opacity-90"
                          >
                            Mark Claimed
                          </button>
                        )}
                        {item.status === 'claimed' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'returned')}
                            className="px-2.5 py-1 bg-tertiary-container text-on-tertiary-container rounded-lg font-label-bold text-[11px] hover:opacity-90"
                          >
                            Verify & Return
                          </button>
                        )}
                        {item.status === 'returned' && (
                          <span className="text-[11px] text-tertiary-container font-label-bold flex items-center gap-1 justify-end">
                            <span className="material-symbols-outlined text-xs filled">check_circle</span>
                            Resolved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
};
