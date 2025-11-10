'use client';

interface DownloadButtonProps {
  url: string;
  fileName?: string | null;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function DownloadButton({
  url,
  fileName,
  onClick,
  size = 'sm',
  className = '',
}: DownloadButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName || undefined}
      onClick={onClick}
      className={`bg-[#ED6C00] hover:bg-[#ED6C00]/90 text-white rounded font-medium transition-colors duration-200 whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      다운로드
    </a>
  );
}

