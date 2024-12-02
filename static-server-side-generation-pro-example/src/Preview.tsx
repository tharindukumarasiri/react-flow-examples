import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useStore, useFlow } from './store';

export default function Preview() {
  const type = useStore((state) => state.type);
  const flow = useFlow();

  const htmlPreviewKey = useMemo(
    () => window.crypto.randomUUID(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flow]
  );
  const htmlPreviewUrl = useMemo(() => {
    const json = JSON.stringify({ type, ...flow }, null, 0);
    const query = new URLSearchParams({ json }).toString();

    return `${import.meta.env.VITE_API_ENDPOINT}?${query}`;
  }, [type, flow]);

  const containerRef = useRef<HTMLIFrameElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleX = width / flow.width;
      const scaleY = height / flow.height;
      const scale = Math.min(scaleX, scaleY, 1);

      setPreviewScale(scale);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [flow.width, flow.height]);

  const downloadImage = async () => {
    const image = await fetch(htmlPreviewUrl);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = `react-flow-output.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className="w-full h-full flex">
      <div
        className="relative overflow-hidden m-auto outline outline-1 outline-gray-300"
        style={{
          width: flow.width * previewScale,
          height: flow.height * previewScale,
        }}
      >
        {(() => {
          switch (type) {
            case 'html':
              return (
                <iframe
                  key={htmlPreviewKey}
                  className="origin-top-left"
                  src={htmlPreviewUrl}
                  width={flow.width}
                  height={flow.height}
                  style={{ transform: `scale(${previewScale})` }}
                />
              );

            case 'jpg':
            case 'png':
              return (
                <>
                  <button
                    className="absolute text-xs bg-[#777] text-white px-2 py-1 rounded-sm right-0"
                    onClick={downloadImage}
                  >
                    download image
                  </button>
                  <img
                    className="border-1 border-solid border-[#777]"
                    key={htmlPreviewKey}
                    src={htmlPreviewUrl}
                  ></img>
                </>
              );
          }
        })()}
      </div>
    </div>
  );
}
