import { type InteractiveElement } from '@/shared/types/dom';
import { type LlmImage } from '@/shared/types/llm';
import { bytesToBase64 } from '@/shared/util/base64';

const BADGE_PADDING = 4;
const BADGE_OFFSET = 2;
const BASE_FONT_PX = 12;
const BADGE_BG = 'rgba(220, 53, 69, 0.95)';
const BADGE_FG = '#ffffff';
const BOX_STROKE = 'rgba(220, 53, 69, 0.45)';

async function decode(image: LlmImage): Promise<ImageBitmap> {
  const dataUrl = `data:${image.mediaType};base64,${image.dataBase64}`;
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

function drawMark(
  ctx: OffscreenCanvasRenderingContext2D,
  element: InteractiveElement,
  pixelRatio: number,
  fontSize: number,
  badgeHeight: number,
  padding: number,
): void {
  const { ref, box } = element;
  const x = box.x * pixelRatio;
  const y = box.y * pixelRatio;
  const width = box.width * pixelRatio;
  const height = box.height * pixelRatio;

  ctx.strokeStyle = BOX_STROKE;
  ctx.lineWidth = Math.max(1, Math.round(pixelRatio));
  ctx.strokeRect(x, y, width, height);

  const label = String(ref);
  const labelWidth = ctx.measureText(label).width + padding * 2;
  ctx.fillStyle = BADGE_BG;
  ctx.fillRect(x, y, labelWidth, badgeHeight);

  ctx.fillStyle = BADGE_FG;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(label, x + padding, y + BADGE_OFFSET);
}

export async function annotateScreenshot(
  image: LlmImage,
  elements: InteractiveElement[],
  pixelRatio: number,
): Promise<LlmImage> {
  const bitmap = await decode(image);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas did not return a 2D context for overlay rendering.');

  ctx.drawImage(bitmap, 0, 0);

  const fontSize = Math.round(BASE_FONT_PX * pixelRatio);
  const badgeHeight = fontSize + BADGE_PADDING * 2;
  const padding = Math.round(BADGE_PADDING * pixelRatio);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';

  for (const element of elements) {
    drawMark(ctx, element, pixelRatio, fontSize, badgeHeight, padding);
  }

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const dataBase64 = bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
  return { mediaType: 'image/png', dataBase64 };
}
