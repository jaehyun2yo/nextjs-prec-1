// Step 진행 표시 컴포넌트

import { STEP_STYLES } from '@/lib/styles';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: '연락처' },
    { number: 2, label: '도면 및 샘플' },
    { number: 3, label: '일정 조율' },
    { number: 4, label: '내용 확인' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className={`flex items-center ${currentStep >= step.number ? STEP_STYLES.active.text : STEP_STYLES.inactive.text}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= step.number ? STEP_STYLES.active.circle : STEP_STYLES.inactive.circle}`}>
                {step.number}
              </div>
              <span className="ml-2 font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

