import fs from "fs";
import path from "path";
import https from "https";

const TARGET_DIR = path.join(process.cwd(), "public", "wasm");

const FILES_TO_DOWNLOAD = [
  {
    url: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
    dest: "ffmpeg-core.js",
  },
  {
    url: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
    dest: "ffmpeg-core.wasm",
  },
];

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects (unpkg often redirects to specific versions/files)
          downloadFile(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => reject(err));
      });
  });
}

async function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  console.log("Downloading WASM dependencies to /public/wasm...");

  for (const file of FILES_TO_DOWNLOAD) {
    const destPath = path.join(TARGET_DIR, file.dest);
    console.log(`Downloading ${file.dest}...`);
    try {
      await downloadFile(file.url, destPath);
      console.log(`✅ Downloaded ${file.dest}`);
    } catch (error) {
      console.error(`❌ Error downloading ${file.dest}:`, error.message);
      process.exit(1);
    }
  }

  console.log("All WASM dependencies downloaded successfully.");
}

main();
