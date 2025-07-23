// lib/makeShareCard.ts
// Client-only utility to build a PNG share card and return an object URL.

type Opts = {
  words: string[];        // oldest -> newest (your stack array)
  score: number;
  mode: 'endless' | 'daily';
  seed: string;
  date?: string;          // daily key
  width?: number;
  height?: number;
};

export async function makeShareCard({
  words,
  score,
  mode,
  seed,
  date,
  width = 1080,
  height = 1350,
}: Opts): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0f172a'); // dark slate top
  grad.addColorStop(1, '#334155'); // slightly lighter bottom
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';

  // Title
  ctx.font = 'bold 110px Inter, sans-serif';
  ctx.fillText('LEXIT', width / 2, 140);

  // Mode line
  ctx.font = '600 56px Inter, sans-serif';
  ctx.fillText(mode === 'daily' ? 'DAILY CHALLENGE' : 'ENDLESS MODE', width / 2, 230);

  // Seed chip
  ctx.font = 'bold 60px Inter, sans-serif';
  const chipPaddingX = 48;
  const chipPaddingY = 20;
  const chipText = seed.toUpperCase();
  const chipTextWidth = ctx.measureText(chipText).width;
  const chipW = chipTextWidth + chipPaddingX * 2;
  const chipH = 100;
  const chipX = (width - chipW) / 2;
  const chipY = 280;
  // green background
  ctx.fillStyle = '#10B981';
  roundRect(ctx, chipX, chipY, chipW, chipH, 28).fill();
  // text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(chipText, width / 2, chipY + chipH / 2 + 20);

  // Score line
  ctx.font = 'bold 80px Inter, sans-serif';
  ctx.fillText(`Score: ${score}`, width / 2, chipY + chipH + 110);

  // Date (daily)
  if (date) {
    ctx.font = '32px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(date, width / 2, chipY + chipH + 160);
  }

  // Words list header
  ctx.font = '46px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Your Stack', width / 2, chipY + chipH + 240);

  // Draw stack blocks (newest at top)
  const blockW = width * 0.8;
  const blockH = 80;
  const gap = 16;
  let startY = chipY + chipH + 280;

  const blockFont = 'bold 42px Inter, sans-serif';

  const newest = words[0]; // you show newest first in UI
  words.forEach((w, i) => {
    const isNewest = w === newest;
    const color = isNewest ? '#1e293b' /* dark seed */ : '#10B981'; // green for completed
    ctx.fillStyle = color;
    const bx = (width - blockW) / 2;
    roundRect(ctx, bx, startY, blockW, blockH, 22).fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = blockFont;
    ctx.fillText(w, width / 2, startY + blockH / 2 + 14);

    startY += blockH + gap;
    if (startY > height - 160) return; // cut off if too many
  });

  // Footer
  ctx.font = '28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('lexit.uno', width / 2, height - 40);

  // Return blob url
  return new Promise<string>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve('');
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 'image/png', 1);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  return ctx;
}
