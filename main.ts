import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Wednesday 25 November 2026 world brief.
// The image is drawn in this session and shipped beside this file.
// Grade time has no network, so the program only copies those bytes.

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const source = new URL("./entry.png", import.meta.url);
const bytes = readFileSync(source);

function isPng(buf: Buffer): boolean {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  );
}

function pngPixelSize(buf: Buffer): { width: number; height: number } {
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") {
    process.stderr.write("PNG is missing IHDR\n");
    process.exit(1);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

if (!isPng(bytes)) {
  process.stderr.write("shipped image is not a PNG\n");
  process.exit(1);
}

const MAX_BYTES = 1_048_576;
const MAX_EDGE = 1024;
const { width, height } = pngPixelSize(bytes);
if (bytes.length > MAX_BYTES || width > MAX_EDGE || height > MAX_EDGE || width < 1 || height < 1) {
  process.stderr.write("shipped image exceeds the contest limits\n");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.png"), bytes);
