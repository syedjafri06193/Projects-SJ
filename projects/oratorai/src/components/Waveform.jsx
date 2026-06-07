import { useRef, useEffect } from 'react';

/**
 * Waveform — animated canvas waveform component.
 * Props: active (bool), color (string), height (number), analyser (AnalyserNode|null)
 */
export default function Waveform({ active = true, color = '#00e5a0', height = 64, analyser = null, style = {} }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const draw = () => {
      const w = canvas.offsetWidth || canvas.width;
      canvas.width = w;

      ctx.clearRect(0, 0, w, height);

      if (!active) {
        ctx.strokeStyle = '#1e2530';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(w, height / 2);
        ctx.stroke();
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (analyser) {
        const buf = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buf);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        buf.forEach((v, i) => {
          const x = (i / buf.length) * w;
          const y = ((v / 128) * height) / 2;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const amp = (height / 2 - 6) * Math.abs(Math.sin(x * 0.012 + t * 0.4));
          const y   = height / 2 + Math.sin(x * 0.09 + t) * amp * 0.7;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        t += 0.1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, color, height, analyser]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      style={{ width: '100%', display: 'block', ...style }}
      role="img"
      aria-label="Audio waveform visualizer"
    />
  );
}
