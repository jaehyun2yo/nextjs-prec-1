'use client';

import { useState, useRef, useCallback } from 'react';
import { FaPaperclip, FaTrash } from 'react-icons/fa';

export interface FileUploadProps {
  /** 파일 input의 name 속성 */
  name: string;
  /** 파일 input의 id 속성 */
  id?: string;
  /** 단일 파일 또는 다중 파일 선택 */
  multiple?: boolean;
  /** 허용된 파일 타입 (accept 속성) */
  accept?: string;
  /** 최대 파일 크기 (바이트 단위, 기본값: 10MB) */
  maxSize?: number;
  /** 최대 파일 개수 (multiple일 때만 적용) */
  maxFiles?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 필수 여부 */
  required?: boolean;
  /** 선택된 파일들 */
  files?: File[];
  /** 파일 변경 핸들러 */
  onChange?: (files: File[]) => void;
  /** 에러 핸들러 */
  onError?: (error: string) => void;
  /** 라벨 텍스트 */
  label?: string;
  /** 도움말 텍스트 */
  helpText?: string;
  /** 드래그 앤 드롭 활성화 여부 (기본값: true) */
  enableDragDrop?: boolean;
  /** 커스텀 클래스명 */
  className?: string;
}

export function FileUpload({
  name,
  id,
  multiple = false,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles,
  disabled = false,
  required = false,
  files: controlledFiles,
  onChange,
  onError,
  label,
  helpText,
  enableDragDrop = true,
  className = '',
}: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // controlled 또는 uncontrolled 모드
  const files = controlledFiles !== undefined ? controlledFiles : internalFiles;
  const setFiles = useCallback(
    (newFiles: File[]) => {
      if (controlledFiles === undefined) {
        setInternalFiles(newFiles);
      }
      onChange?.(newFiles);
    },
    [controlledFiles, onChange]
  );

  const validateFile = useCallback(
    (file: File): string | null => {
      // 파일 크기 검증
      if (file.size > maxSize) {
        return `파일 크기는 ${(maxSize / 1024 / 1024).toFixed(0)}MB 이하여야 합니다.`;
      }

      // 파일 타입 검증 (accept가 있는 경우)
      if (accept) {
        const acceptedTypes = accept.split(',').map((type) => type.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const fileType = file.type;

        const isAccepted =
          acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
              return fileExtension === type.toLowerCase();
            }
            if (type.includes('/*')) {
              const baseType = type.split('/')[0];
              return fileType.startsWith(baseType + '/');
            }
            return fileType === type;
          }) || acceptedTypes.some((type) => type === fileType);

        if (!isAccepted) {
          return `허용되지 않은 파일 형식입니다. (${accept})`;
        }
      }

      return null;
    },
    [maxSize, accept]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // 최대 파일 개수 검증
      if (multiple && maxFiles && files.length + fileArray.length > maxFiles) {
        const error = `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`;
        onError?.(error);
        return;
      }

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        onError?.(errors.join('\n'));
      }

      if (validFiles.length > 0) {
        if (multiple) {
          setFiles([...files, ...validFiles]);
        } else {
          setFiles([validFiles[0]]);
        }
      }
    },
    [files, multiple, maxFiles, validateFile, setFiles, onError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enableDragDrop || disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    [enableDragDrop, disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enableDragDrop || disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    [enableDragDrop, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enableDragDrop || disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        addFiles(droppedFiles);
        // 파일 input도 업데이트
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          Array.from(droppedFiles).forEach((file) => {
            const error = validateFile(file);
            if (!error) {
              dataTransfer.items.add(file);
            }
          });
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    },
    [enableDragDrop, disabled, addFiles, validateFile]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [files, setFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const inputId = id || name;
  const displayFiles = multiple ? files : files.slice(0, 1);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          name={name}
          multiple={multiple}
          accept={accept}
          required={required}
          disabled={disabled}
          onChange={handleFileSelect}
          className="hidden"
        />

        {enableDragDrop ? (
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full px-6 py-8 border-2 border-dashed rounded-lg transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-500'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled}
              className="w-full flex flex-col items-center justify-center gap-2 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <FaPaperclip
                className={`text-2xl ${isDragging ? 'text-orange-600 dark:text-orange-400' : ''}`}
              />
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium">
                  {isDragging
                    ? '파일을 여기에 놓으세요'
                    : `파일 선택 또는 드래그 앤 드롭${multiple ? ' (다중 선택 가능)' : ''} (최대 ${(maxSize / 1024 / 1024).toFixed(0)}MB)`}
                </span>
                {!isDragging && helpText && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{helpText}</span>
                )}
              </div>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="w-full px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaPaperclip className="text-base" />
            <span className="text-sm font-medium">
              파일 선택{multiple ? ' (다중 선택 가능)' : ''} (최대 {(maxSize / 1024 / 1024).toFixed(0)}MB)
            </span>
          </button>
        )}

        {/* 선택된 파일 목록 */}
        {displayFiles.length > 0 && (
          <div className="space-y-2">
            {displayFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FaPaperclip className="text-gray-500 dark:text-gray-400 flex-shrink-0 text-base" />
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

