"use server";

import { exec } from "child_process";
import fs from "fs/promises";
import { parseBuffer } from "music-metadata";
import path from "path";

/**
 * Downloads a YouTube video as MP3 using yt-dlp.
 * @param {string} url - The URL of the YouTube video.
 * @param {string} outputDir - The directory where the MP3 file will be saved.
 */
export async function downloadYouTubeAudio(
  url: string,
  outputDir: string = "./"
) {
  if (!url) {
    console.error("URL is required.");
    return;
  }

  const command = `yt-dlp -x --audio-format mp3 --add-metadata --embed-thumbnail --output "${outputDir}/%(title)s.%(ext)s" "${url}"`;

  exec(command, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

/**
 * Processes all MP3 files in the specified directory, extracts metadata, and prints it.
 * @param {string} tracksDir - The directory containing the MP3 files.
 */
async function processDownloadedAudio(tracksDir: string) {
  try {
    const files = await fs.readdir(tracksDir);
    for (const file of files.filter(
      (file) => path.extname(file).toLowerCase() === ".mp3"
    )) {
      const filePath = path.join(tracksDir, file);
      const buffer = await fs.readFile(filePath);
      const metadata = await parseBuffer(buffer, { mimeType: "audio/mpeg" });

      const songData = {
        name: metadata.common.title || path.parse(file).name,
        artist: metadata.common.artist || "Unknown Artist",
        album: metadata.common.album || "Unknown Album",
        duration: Math.round(metadata.format.duration || 0),
        genre: metadata.common.genre?.[0] || "Unknown Genre",
        bpm: metadata.common.bpm ? Math.round(metadata.common.bpm) : null,
        key: metadata.common.key || null,
      };

      console.log(`Metadata for "${file}":`, songData);
    }
  } catch (error) {
    console.error("Error processing MP3 files:", error);
  }
}

async function main() {
  console.log("Downloading audio...");
  await downloadYouTubeAudio(
    "https://www.youtube.com/watch?app=desktop&v=KE3SwHOmlok",
    "./downloads"
  );
  console.log("Processing downloaded audio...");
  await processDownloadedAudio("./downloads");
}

main().then(() => console.log("Done!"));
