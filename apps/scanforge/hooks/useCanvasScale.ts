
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

export const useCanvasScale = (imageWidth?: number, imageHeight?: number) => {
  const [ref, bounds] = useMeasure();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (bounds.width && bounds.height && imageWidth && imageHeight) {
      const fitScale = Math.min(
        bounds.width / imageWidth,
        bounds.height / imageHeight
      );
      setScale(fitScale);
    }
  }, [bounds, imageWidth, imageHeight]);

  return { ref, bounds, scale };
};
