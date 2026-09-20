import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.S3_BUCKET;
const client = new S3Client({ region: process.env.S3_REGION ?? "auto", endpoint: process.env.S3_ENDPOINT, credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } : undefined });

export async function uploadCharacterAvatar(characterId: string, file: File) {
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  const key = `characters/${characterId}/avatar-${crypto.randomUUID()}`;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type }));
  return process.env.S3_PUBLIC_URL ? `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}` : key;
}

export async function deleteStorageObject(urlOrKey: string | null | undefined) {
  if (!bucket || !urlOrKey) return;
  const key = urlOrKey.includes("/") && process.env.S3_PUBLIC_URL ? urlOrKey.replace(`${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/`, "") : urlOrKey;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
