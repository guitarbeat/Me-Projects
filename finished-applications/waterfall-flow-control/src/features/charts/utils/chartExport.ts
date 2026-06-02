export const exportSVGToPNG = (svgElement: SVGSVGElement, filename: string) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const bbox = svgElement.getBoundingClientRect();

    // Use viewBox if available, otherwise use bounding box
    const viewBox = svgElement.viewBox.baseVal;
    canvas.width = viewBox.width || bbox.width;
    canvas.height = viewBox.height || bbox.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;

      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();

      URL.revokeObjectURL(url);
      URL.revokeObjectURL(link.href);
    }, 'image/png');
  };

  img.src = url;
};
