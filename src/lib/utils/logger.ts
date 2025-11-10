/**
 * 로깅 유틸리티
 * 프로덕션 환경에서는 로그 레벨에 따라 필터링
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) return true;
    
    // 프로덕션에서는 error와 warn만 로깅
    return level === 'error' || level === 'warn';
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  /**
   * 특정 모듈/컨텍스트별 로거 생성
   */
  createLogger(context: string) {
    return {
      debug: (message: string, ...args: unknown[]) => 
        this.debug(`[${context}] ${message}`, ...args),
      info: (message: string, ...args: unknown[]) => 
        this.info(`[${context}] ${message}`, ...args),
      warn: (message: string, ...args: unknown[]) => 
        this.warn(`[${context}] ${message}`, ...args),
      error: (message: string, error?: unknown, ...args: unknown[]) => 
        this.error(`[${context}] ${message}`, error, ...args),
    };
  }
}

export const logger = new Logger();



