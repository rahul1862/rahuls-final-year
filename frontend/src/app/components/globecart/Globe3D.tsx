import { useEffect, useRef } from 'react';

interface City {
  lat: number;
  lon: number;
  pulse: boolean;
}

const CITIES: City[] = [
  { lat: 35.68, lon: 139.69, pulse: true },
  { lat: 40.71, lon: -74.01, pulse: true },
  { lat: 51.51, lon: -0.13,  pulse: false },
  { lat: 48.86, lon: 2.35,   pulse: false },
  { lat: 25.20, lon: 55.27,  pulse: true },
  { lat: 37.57, lon: 126.98, pulse: true },
  { lat: -23.55, lon: -46.63, pulse: false },
  { lat: -33.87, lon: 151.21, pulse: false },
  { lat: 19.43, lon: -99.13,  pulse: false },
  { lat: 55.75, lon: 37.62,   pulse: false },
  { lat: 28.61, lon: 77.21,   pulse: false },
  { lat: 1.35,  lon: 103.82,  pulse: true },
  { lat: 41.01, lon: 28.98,   pulse: false },
  { lat: 59.33, lon: 18.07,   pulse: false },
  { lat: 31.22, lon: 121.46,  pulse: true },
  { lat: 47.38, lon: 8.54,    pulse: true },
  { lat: 45.46, lon: 9.19,    pulse: true },
  { lat: -34.60, lon: -58.38, pulse: false },
  { lat: 43.70, lon: -79.42,  pulse: false },
  { lat: 13.75, lon: 100.52,  pulse: false },
];

const toRad = (d: number) => (d * Math.PI) / 180;

export function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const rotY      = useRef(0);
  const pulseTick = useRef(0);
  const mouse     = useRef({ y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Star = { x: number; y: number; r: number; a: number };
    const stars: Star[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w   = canvas.offsetWidth;
      const h   = canvas.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars.length = 0;
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.2,
          a: Math.random() * 0.4 + 0.1,
        });
      }
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const project = (lat: number, lon: number, R: number, ry: number, tilt: number) => {
      const φ = toRad(lat);
      const λ = toRad(lon) + ry;
      const x =  Math.cos(φ) * Math.sin(λ);
      const y = -Math.sin(φ);
      const z =  Math.cos(φ) * Math.cos(λ);
      const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
      const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
      return { sx: x * R, sy: y2 * R, z: z2 };
    };

    const drawMeridian = (lon: number, cx: number, cy: number, R: number, ry: number, tilt: number) => {
      ctx.beginPath();
      let started = false;
      for (let lat = -88; lat <= 88; lat += 2) {
        const { sx, sy, z } = project(lat, lon, R, ry, tilt);
        if (z >= 0) {
          if (!started) { ctx.moveTo(cx + sx, cy + sy); started = true; }
          else            ctx.lineTo(cx + sx, cy + sy);
        } else {
          started = false;
        }
      }
      ctx.strokeStyle = 'rgba(10,10,10,0.10)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    };

    const drawParallel = (lat: number, alpha: number, lw: number, cx: number, cy: number, R: number, ry: number, tilt: number) => {
      ctx.beginPath();
      let started = false;
      for (let lon = 0; lon <= 362; lon += 2) {
        const { sx, sy, z } = project(lat, lon, R, ry, tilt);
        if (z >= 0) {
          if (!started) { ctx.moveTo(cx + sx, cy + sy); started = true; }
          else            ctx.lineTo(cx + sx, cy + sy);
        } else {
          started = false;
        }
      }
      ctx.strokeStyle = `rgba(10,10,10,${alpha})`;
      ctx.lineWidth   = lw;
      ctx.stroke();
    };

    const frame = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      if (W <= 0 || H <= 0) {
        animRef.current = requestAnimationFrame(frame);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * 0.41;

      rotY.current   += 0.0035;
      pulseTick.current += 0.05;

      const tilt = mouse.current.active
        ? (mouse.current.y - 0.5) * 0.5
        : Math.sin(rotY.current * 0.25) * 0.07;

      stars.forEach(s => {
        const dx = s.x - cx;
        const dy = s.y - cy;
        if (dx * dx + dy * dy > R * R * 1.05) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(10,10,10,${s.a})`;
          ctx.fill();
        }
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      const base = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, 0, cx, cy, R);
      base.addColorStop(0,    'rgba(250,250,250,1)');
      base.addColorStop(0.4,  'rgba(240,240,241,1)');
      base.addColorStop(0.75, 'rgba(228,228,231,1)');
      base.addColorStop(1,    'rgba(212,212,216,1)');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      const shadow = ctx.createRadialGradient(cx + R * 0.45, cy + R * 0.25, 0, cx + R * 0.4, cy + R * 0.2, R * 1.4);
      shadow.addColorStop(0, 'rgba(10,10,10,0.12)');
      shadow.addColorStop(1, 'rgba(10,10,10,0)');
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, W, H);

      for (let lon = 0; lon < 360; lon += 30) {
        drawMeridian(lon, cx, cy, R, rotY.current, tilt);
      }

      for (let lat = -60; lat <= 60; lat += 30) {
        const isEquator = lat === 0;
        drawParallel(lat, isEquator ? 0.22 : 0.09, isEquator ? 1 : 0.5, cx, cy, R, rotY.current, tilt);
      }

      CITIES.forEach(city => {
        const { sx, sy, z } = project(city.lat, city.lon, R, rotY.current, tilt);
        if (z < 0) return;
        const vis = Math.min(1, (z / R) * 1.6);
        const sx2 = cx + sx;
        const sy2 = cy + sy;

        if (city.pulse) {
          const t  = (Math.sin(pulseTick.current + city.lat * 0.07) + 1) / 2;
          const pr = 4 + t * 10;
          const pa = (1 - t) * 0.55 * vis;
          ctx.beginPath();
          ctx.arc(sx2, sy2, pr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(10,10,10,${pa})`;
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }

        ctx.fillStyle = city.pulse
          ? `rgba(10,10,10,${vis})`
          : `rgba(10,10,10,${0.4 * vis})`;
        ctx.beginPath();
        ctx.arc(sx2, sy2, city.pulse ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      const rim = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R);
      rim.addColorStop(0,   'rgba(0,0,0,0)');
      rim.addColorStop(0.7, 'rgba(10,10,10,0.02)');
      rim.addColorStop(1,   'rgba(10,10,10,0.18)');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const spec = ctx.createRadialGradient(
        cx - R * 0.44, cy - R * 0.42, 0,
        cx - R * 0.32, cy - R * 0.32, R * 0.5
      );
      spec.addColorStop(0, 'rgba(255,255,255,0.55)');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current.y = (e.clientY - r.top) / r.height;
    };
    const onTouch = (e: TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current.y = (e.touches[0].clientY - r.top) / r.height;
    };
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('touchmove',  onTouch, { passive: true });
    canvas.addEventListener('mouseenter', () => { mouse.current.active = true;  });
    canvas.addEventListener('mouseleave', () => { mouse.current.active = false; });

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove',  onMove);
      canvas.removeEventListener('touchmove',  onTouch);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}
