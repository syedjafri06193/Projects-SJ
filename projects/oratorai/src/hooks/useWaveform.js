import { useEffect, useRef } from 'react';

/**
 * useWaveform — drives an animated canvas waveform from an AnalyserNode.
 * Pass `active` to start/stop animation. Pass `analyser` for live mic input,
 * or leave null for a decorative animated wave.
 */
export function useWaveform({ canvasRef, active = true, analyser = null, color = '#00e5a0' }) {
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (!active) {
        ctx.strokeStyle = '#1e2530';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (analyser) {
        const bufferLength = analyser.fftSize;
        const dataArray    = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        /* decorative animated wave */
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const amp = (height / 2 - 4) * Math.abs(Math.sin(x * 0.015 + t * 0.5));
          const y   = height / 2 + Math.sin(x * 0.08 + t) * amp * 0.6;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        t += 0.12;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, active, analyser, color]);
}
