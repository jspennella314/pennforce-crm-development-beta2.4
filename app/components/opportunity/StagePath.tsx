'use client';

import { Check } from 'lucide-react';

interface Stage {
  value: string;
  label: string;
}

interface StagePathProps {
  stages: Stage[];
  currentStage: string;
  onChange?: (stage: string) => void;
}

// Default stages for opportunities
export const defaultOpportunityStages: Stage[] = [
  { value: 'QUALIFICATION', label: 'Qualification' },
  { value: 'NEEDS_ANALYSIS', label: 'Needs Analysis' },
  { value: 'PROPOSAL', label: 'Proposal/Price Quote' },
  { value: 'NEGOTIATION', label: 'Negotiation/Review' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
];

export default function StagePath({ stages, currentStage, onChange }: StagePathProps) {
  const currentIndex = stages.findIndex((s) => s.value === currentStage);

  const getStageStyle = (index: number) => {
    if (index < currentIndex) {
      // Completed stages - green
      return {
        container: 'bg-green-600 text-white cursor-pointer hover:bg-green-700',
        icon: true,
      };
    } else if (index === currentIndex) {
      // Current stage - blue
      return {
        container: 'bg-[#0176d3] text-white ring-2 ring-[#0176d3] ring-offset-2',
        icon: false,
      };
    } else {
      // Future stages - gray
      return {
        container: 'bg-gray-200 text-gray-600 cursor-pointer hover:bg-gray-300',
        icon: false,
      };
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Stage Path */}
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-[18px] left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }} />

          {/* Progress Bar Fill */}
          {currentIndex > 0 && (
            <div
              className="absolute top-[18px] left-0 h-1 bg-green-600 transition-all duration-300"
              style={{
                width: `${(currentIndex / (stages.length - 1)) * 100}%`,
                zIndex: 0,
              }}
            />
          )}

          {/* Stages */}
          <div className="relative flex justify-between" style={{ zIndex: 1 }}>
            {stages.map((stage, index) => {
              const style = getStageStyle(index);
              const isClickable = onChange && index !== currentIndex;

              return (
                <div
                  key={stage.value}
                  className="flex flex-col items-center"
                  style={{ flex: 1 }}
                >
                  {/* Stage Button */}
                  <button
                    onClick={() => isClickable && onChange(stage.value)}
                    disabled={!isClickable}
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center
                      text-sm font-semibold transition-all duration-200
                      ${style.container}
                      ${isClickable ? '' : 'cursor-default'}
                    `}
                  >
                    {style.icon ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>

                  {/* Stage Label */}
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-medium ${
                        index === currentIndex
                          ? 'text-[#0176d3]'
                          : index < currentIndex
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {stage.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Actions */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Stage: <span className="font-semibold text-gray-900">{stages[currentIndex]?.label}</span>
          </div>
          <div className="flex gap-2">
            {currentIndex > 0 && onChange && (
              <button
                onClick={() => onChange(stages[currentIndex - 1].value)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Mark Previous Stage
              </button>
            )}
            {currentIndex < stages.length - 1 && onChange && (
              <button
                onClick={() => onChange(stages[currentIndex + 1].value)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-[#0176d3] rounded hover:bg-[#014486] transition-colors"
              >
                Mark Stage as Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
