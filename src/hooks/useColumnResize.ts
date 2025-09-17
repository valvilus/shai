import { useState, useCallback, useRef, useEffect } from 'react';

interface UseColumnResizeProps {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onResize: (newWidth: number) => void;
}

export function useColumnResize({
  initialWidth,
  minWidth,
  maxWidth,
  onResize,
}: UseColumnResizeProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(initialWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + deltaX)
      );
      setWidth(newWidth);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, minWidth, maxWidth, onResize]);

  // Синхронизируем width с initialWidth при изменении
  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  return {
    width,
    isResizing,
    handleMouseDown,
  };
}


