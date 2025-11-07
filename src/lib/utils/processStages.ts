// 공정 단계 상수 및 유틸리티

export type ProcessStage = 
  | 'drawing'           // 도면작업
  | 'sample'            // 샘플제작 및 확인
  | 'drawing_confirmed' // 도면 확정 및 목형의뢰
  | 'laser'             // 레이저 가공
  | 'cutting'           // 칼 / 오시 작업
  | 'inspection'        // 검수
  | 'delivery'          // 납품
  | null;               // 공정 시작 전

export interface ProcessStageInfo {
  id: ProcessStage;
  label: string;
  order: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PROCESS_STAGES: Record<NonNullable<ProcessStage>, ProcessStageInfo> = {
  drawing: {
    id: 'drawing',
    label: '도면작업',
    order: 1,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
  },
  sample: {
    id: 'sample',
    label: '샘플제작 및 확인',
    order: 2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
  },
  drawing_confirmed: {
    id: 'drawing_confirmed',
    label: '도면 확정 및 목형의뢰',
    order: 3,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-500',
  },
  laser: {
    id: 'laser',
    label: '레이저 가공',
    order: 4,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
  },
  cutting: {
    id: 'cutting',
    label: '칼 / 오시 작업',
    order: 5,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-500',
  },
  inspection: {
    id: 'inspection',
    label: '검수',
    order: 6,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'border-teal-500',
  },
  delivery: {
    id: 'delivery',
    label: '납품',
    order: 7,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
  },
};

export const PROCESS_STAGES_ARRAY = Object.values(PROCESS_STAGES).sort((a, b) => a.order - b.order);

/**
 * 공정 단계 정보 가져오기
 */
export function getProcessStageInfo(stage: ProcessStage): ProcessStageInfo | null {
  if (!stage) return null;
  return PROCESS_STAGES[stage] || null;
}

/**
 * 공정 단계가 시작되었는지 확인 (status가 'read' 이상이면 공정 시작)
 */
export function isProcessStarted(status: string): boolean {
  return status === 'read' || status === 'replied' || status === 'completed';
}

/**
 * 현재 공정 단계의 진행률 계산 (0-100)
 */
export function getProcessProgress(stage: ProcessStage): number {
  if (!stage) return 0;
  const stageInfo = PROCESS_STAGES[stage];
  if (!stageInfo) return 0;
  return Math.round((stageInfo.order / PROCESS_STAGES_ARRAY.length) * 100);
}

