import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET;

const client = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials:
    process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }
      : undefined,
  forcePathStyle: true,
});

export async function uploadCharacterAvatar(characterId: string, file: File) {
  if (!bucket) throw new Error("S3_BUCKET is not configured");
  const key = `characters/${characterId}/avatar-${crypto.randomUUID()}`;
  
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    })
  );

  // On retourne uniquement la clé, qui sera transformée en URL signée à l'affichage
  return key;
}

// Nouvelle fonction pour convertir la clé S3 en URL signée valide (valable 1 heure)
export async function getAvatarSignedUrl(key: string | null | undefined): Promise<string | null> {
  if (!bucket || !key) return null;
  // Si c'est déjà une URL complète (ex: http...), on la renvoie directement
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL signée de l'avatar :", error);
    return null;
  }
}

export async function deleteStorageObject(urlOrKey: string | null | undefined) {
  if (!bucket || !urlOrKey) return;
  const key =
    urlOrKey.includes("/") && process.env.S3_PUBLIC_URL
      ? urlOrKey.replace(`${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/`, "")
      : urlOrKey;
      
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}