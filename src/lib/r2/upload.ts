// R2 upload utility (S3 compatible)
// Expects envs: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import https from "https";

function getS3() {
  const endpoint = process.env.R2_ENDPOINT as string;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID as string;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY as string;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured: missing endpoint or credentials");
  }

  // Node.js 22 TLS compatibility: Use NodeHttpHandler with custom HTTPS agent
  const httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: true,
    maxSockets: 50,
  });

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // R2 requires path-style addressing
    requestHandler: new NodeHttpHandler({
      httpsAgent,
    }),
  });
}

function buildObjectKey(filename: string, prefix: string = 'portfolio') {
  const ext = filename.split(".").pop() || "bin";
  const base = filename.replace(/\.[^.]+$/, "");
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}/${id}-${base}.${ext}`;
}

export async function uploadFileToR2(file: File, prefix: string = 'portfolio'): Promise<{ key: string; url: string }> {
  console.log('[DEBUG_R2 ENV]', {
    R2_ENDPOINT: process.env.R2_ENDPOINT || '[MISSING]',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '[OK]' : '[MISSING]',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '[OK]' : '[MISSING]',
    R2_BUCKET: process.env.R2_BUCKET || '[MISSING]',
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || '[MISSING]',
  });
  try {
    const bucket = process.env.R2_BUCKET as string;
    const publicBase = process.env.R2_PUBLIC_BASE_URL as string;
    if (!bucket || !publicBase) {
      throw new Error("R2 is not configured: missing bucket or public base url");
    }
    const key = buildObjectKey(file.name, prefix);
    const Body = Buffer.from(await file.arrayBuffer());
    const ContentType = file.type || "application/octet-stream";
    const s3 = getS3();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body,
        ContentType,
        ACL: undefined, // R2 ignores; control via bucket policy
      })
    );
    const url = `${publicBase.replace(/\/$/, "")}/${key}`;
    return { key, url };
  } catch(e) {
    console.error('[R2 upload error]', e && typeof e === 'object' && 'message' in e ? e.message : e, e);
    throw e;
  }
}

export async function uploadBufferToR2(
  buffer: Buffer,
  contentType: string,
  objectKey: string
): Promise<{ key: string; url: string }> {
  console.log('[DEBUG_R2 ENV]', {
    R2_ENDPOINT: process.env.R2_ENDPOINT || '[MISSING]',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '[OK]' : '[MISSING]',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '[OK]' : '[MISSING]',
    R2_BUCKET: process.env.R2_BUCKET || '[MISSING]',
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || '[MISSING]',
  });
  try {
    const bucket = process.env.R2_BUCKET as string;
    const publicBase = process.env.R2_PUBLIC_BASE_URL as string;
    if (!bucket || !publicBase) {
      throw new Error("R2 is not configured: missing bucket or public base url");
    }
    const s3 = getS3();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
      })
    );
    const url = `${publicBase.replace(/\/$/, "")}/${objectKey}`;
    return { key: objectKey, url };
  } catch(e) {
    console.error('[R2 upload error]', e && typeof e === 'object' && 'message' in e ? e.message : e, e);
    throw e;
  }
}

export function buildVariantKeys(filename: string) {
  const ext = filename.split(".").pop() || "jpg";
  const base = filename.replace(/\.[^.]+$/, "");
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const basePath = `portfolio/${id}-${base}`;
  return {
    thumb: `${basePath}-thumb.${ext}`,
    medium: `${basePath}-medium.${ext}`,
    original: `${basePath}-original.${ext}`,
  } as const;
}


