import { useEffect, useState } from 'react';

interface WindowSize {
  height: number;
  width: number;
}

const RESIZE = 'resize';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }
    window.addEventListener(RESIZE, handleResize);
    handleResize();
    return () => window.removeEventListener(RESIZE, handleResize);
  }, []);

  return windowSize;
}
