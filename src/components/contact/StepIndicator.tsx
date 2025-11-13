// Step 진행 표시 컴포넌트

import { motion } from 'framer-motion';
import { STEP_STYLES } from '@/lib/styles';
import { FaPhone, FaFileAlt, FaCalendarAlt, FaEye, FaTruck } from 'react-icons/fa';

interface StepIndicatorProps {
  currentStep: number;
  drawingType?: 'create' | 'have' | '';
}

export default function StepIndicator({ currentStep, drawingType = '' }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: '연락처', icon: FaPhone },
    { number: 2, label: '도면 및 샘플', icon: FaFileAlt },
    { number: 3, label: drawingType === 'have' ? '납품업체' : '일정 조율', icon: drawingType === 'have' ? FaTruck : FaCalendarAlt },
    { number: 4, label: '내용 확인', icon: FaEye },
  ];

  return (
    <div className="mb-8 flex justify-center">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div className="relative">
                  {/* 그림자 효과 - 현재 활성 단계에만 */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 rounded-full ${STEP_STYLES.active.circle} blur-lg`}
                      animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.6, 0.3, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  
                  {/* 단계 원 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold relative z-10 ${
                      isActive || isCompleted 
                        ? STEP_STYLES.active.circle 
                        : STEP_STYLES.inactive.circle
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <step.icon className={`w-4 h-4 flex-shrink-0 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    )}
                  </div>
                </div>
                
                {/* 라벨 텍스트 */}
                <div className="relative ml-2">
                  {/* 텍스트 그림자 효과 - 현재 활성 단계에만 */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 font-medium whitespace-nowrap ${STEP_STYLES.active.text} blur-lg`}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0.3, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {step.label}
                    </motion.div>
                  )}
                  <span
                    className={`font-medium whitespace-nowrap relative z-10 ${
                      isActive || isCompleted
                        ? STEP_STYLES.active.text
                        : STEP_STYLES.inactive.text
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
              
              {/* 진행 바 */}
              {index < steps.length - 1 && (
                <div className="relative w-8 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {isCompleted ? (
                    <div
                      className="absolute inset-0 bg-[#ED6C00] dark:bg-[#ED6C00]"
                      style={{ width: '100%' }}
                    />
                  ) : isActive ? (
                    <motion.div
                      key={`progress-${currentStep}-${index}`}
                      className="absolute inset-0 bg-[#ED6C00] dark:bg-[#ED6C00]"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ 
                        duration: 1.2,
                        ease: [0.25, 0.1, 0.25, 1] // 부드러운 easing
                      }}
                    />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}





