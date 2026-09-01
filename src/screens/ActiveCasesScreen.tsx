import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';

export const ActiveCasesScreen: React.FC = () => {
  const { items, hubs, setActiveItem, navigateTo, user, openAuthModal } = useApp();

  // All active items or items related to this user
  const userItems = user
    ? items.filter(
        item => item.reporter_id === user.id || item.reporter_email === user.email
      )
    : items;

  const handleTrackItem = (item: any) => {
    setActiveItem(item);
    navigateTo('item-received');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pt-16 pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} />

      <main className="max-w-[1200px] mx-auto px-container-margin-mobile md:px-container-margin-desktop py-6 md:py-8 flex flex-col gap-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1">
              Active Cases & History
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant">
              Track the real-time recovery progress of your reported and claimed items.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateTo('report-found')}
            icon={<span className="material-symbols-outlined text-sm">add</span>}
          >
            Report Another Item
          </Button>
        </div>

        {/* List of Cases */}
        <div className="space-y-4">
          {userItems.map(item => {
            const hub = hubs.find(h => h.id === item.hub_id) || hubs[0];
            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow-card p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:ambient-shadow-modal transition-all"
              >
                <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                    <img
                      src={item.photo_url}
                      alt={item.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-primary">
                        {item.category}
                      </h3>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-xs font-mono font-bold text-on-surface-variant">
                      Tag #{item.item_code}
                    </p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary filled">store</span>
                      <span>{hub.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/20">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleTrackItem(item)}
                    icon={<span className="material-symbols-outlined text-sm">timeline</span>}
                  >
                    View Status Timeline
                  </Button>
                </div>
              </div>
            );
          })}

          {userItems.length === 0 && (
            <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-8">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                folder_open
              </span>
              <h3 className="font-serif text-lg font-bold text-on-surface mb-1">No Active Cases</h3>
              <p className="text-xs text-on-surface-variant mb-4">
                You haven't reported or claimed any items yet.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigateTo('report-found')}>
                Report a Found Item
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
};
