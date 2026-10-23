import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "./db.ts";
import { randomToken } from "./security.ts";

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

type Kind = "image" | "audio";

/** Detect the real file type from magic bytes — never trust the client's Content-Type. */
function sniff(buf: Buffer): { ext: string; kind: Kind } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", kind: "image" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", kind: "image" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", kind: "image" };
  if (buf.toString("ascii", 0, 3) === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) return { ext: "mp3", kind: "audio" };
  if (buf.toString("ascii", 4, 8) === "ftyp") return { ext: "m4a", kind: "audio" };
  if (buf.toString("ascii", 0, 4) === "OggS") return { ext: "ogg", kind: "audio" };
  return null;
}

export async function storeUpload(buf: Buffer, allowed: Kind[]) {
  const type = sniff(buf);
  if (!type || !allowed.includes(type.kind)) throw new UploadError("Fayl turi qo‘llab-quvvatlanmaydi");
  const limit = type.kind === "image" ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
  if (buf.length > limit) throw new UploadError("Fayl hajmi juda katta");
  const name = `${randomToken(12)}.${type.ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf, { flag: "wx" });
  return { url: `/uploads/${name}`, kind: type.kind };
}

export class UploadError extends Error {}
