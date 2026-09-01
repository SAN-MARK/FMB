import React from 'react';
import { ItemStatus } from '../../types';

interface StatusTimelineProps {
  status: ItemStatus;
  className?: string;
}

interface StepConfig {
  key: ItemStatus | 'found';
  title: string;
  description: string;
  order: number;
}

const STEPS: StepConfig[] = [
  {
    key: 'found',
    title: 'Found',
    description: 'Item reported and secured by you.',
    order: 0
  },
  {
    key: 'dropped_at_hub',
    title: 'Dropped Off',
    description: 'Safely handed over to the institution.',
    order: 1
  },
  {
    key: 'listed',
    title: 'Listed',
    description: 'Cataloged in our secure database.',
    order: 2
  },
  {
    key: 'claimed',
    title: 'Claimed',
    description: 'Owner verified their identity.',
    order: 3
  },
  {
    key: 'returned',
    title: 'Returned',
    description: 'Reunited with its rightful owner.',
    order: 4
  }
];

function getStatusOrder(status: ItemStatus): number {
  switch (status) {
    case 'reported':
      return 0;
    case 'dropped_at_hub':
      return 1;
    case 'listed':
      return 2;
    case 'claimed':
    case 'verified':
      return 3;
    case 'returned':
      return 4;
    default:
      return 0;
  }
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status, className = '' }) => {
  const currentStepIndex = getStatusOrder(status);

  return (
    <div className={`w-full bg-surface-container-low rounded-xl border border-outline-variant/30 p-6 ambient-shadow-card text-left ${className}`}>
      <h3 className="font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-6">
        Recovery Process
      </h3>

      <div className="relative pl-6 border-l-2 border-outline-variant/50 space-y-7">
        {STEPS.map((step, index) => {
          const isPassed = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div
              key={step.key}
              className={`relative transition-opacity duration-300 ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* Connector dot */}
              {isPassed ? (
                <div className="absolute -left-[35px] top-0 w-6 h-6 bg-surface-container-lowest border-2 border-primary rounded-full flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[12px] text-primary filled">
                    check
                  </span>
                </div>
              ) : isCurrent ? (
                <div className="absolute -left-[35px] top-0 w-6 h-6 bg-tertiary-fixed border-2 border-tertiary-container rounded-full flex items-center justify-center z-10 shadow-[0_0_0_4px_rgba(164,243,202,0.4)]">
                  <span className="material-symbols-outlined text-[12px] text-tertiary-container filled">
                    radio_button_checked
                  </span>
                </div>
              ) : (
                <div className="absolute -left-[35px] top-0 w-6 h-6 bg-surface-container-highest border-2 border-outline-variant rounded-full flex items-center justify-center z-10" />
              )}

              {/* Step text */}
              <div className="flex items-start">
                <div>
                  <p
                    className={`font-label-bold text-sm ${
                      isCurrent
                        ? 'text-tertiary-container font-bold'
                        : isPassed
                        ? 'text-primary font-semibold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {step.title}
                    {isCurrent && (
                      <span className="ml-2 text-xs font-normal text-tertiary-container bg-tertiary-fixed/60 px-2 py-0.5 rounded-full">
                        Current Status
                      </span>
                    )}
                  </p>
                  <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
