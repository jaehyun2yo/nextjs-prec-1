import sharp from "sharp";
import { buildVariantKeys, uploadBufferToR2 } from "@/lib/r2/upload";

export type ImageVariants = {
  thumb: string;
  medium: string;
  original: string;
};

export async function createAndUploadVariants(file: File): Promise<ImageVariants> {
  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  const contentType = file.type || "image/jpeg";
  const keys = buildVariantKeys(file.name);

  // Generate thumb (width ~320)
  const thumbBuf = await sharp(input).rotate().resize({ width: 320, withoutEnlargement: true }).toFormat("webp", { quality: 60 }).toBuffer();
  // Generate medium (width ~800)
  const mediumBuf = await sharp(input).rotate().resize({ width: 800, withoutEnlargement: true }).toFormat("webp", { quality: 70 }).toBuffer();

  // Upload
  const [thumb, medium, original] = await Promise.all([
    uploadBufferToR2(thumbBuf, "image/webp", keys.thumb.replace(/\.[^.]+$/, ".webp")),
    uploadBufferToR2(mediumBuf, "image/webp", keys.medium.replace(/\.[^.]+$/, ".webp")),
    uploadBufferToR2(input, contentType, keys.original),
  ]);

  return {
    thumb: thumb.url,
    medium: medium.url,
    original: original.url,
  };
}


