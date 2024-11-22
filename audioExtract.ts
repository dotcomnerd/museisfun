"use server";

import { exec } from "child_process";
import fs from "fs/promises";
import { parseBuffer } from "music-metadata";
import path from "path";
import { createClient } from "./lib/supabase/server";

/**
 * Downloads a YouTube video as MP3 using yt-dlp and uploads it to Supabase.
 * @param {string} url - The URL of the YouTube video.
 * @param {string} outputDir - The directory where the MP3 file will be saved.
 */
export async function downloadYouTubeAudio(
  url: string,
  outputDir: string = "./downloads"
) {
  const supabase = await createClient();
  if (!url) {
    console.error("URL is required.");
    return;
  }

  const auth = await supabase.auth.getUser();
  const userId = auth.data.user?.id;

  if (!userId) {
    throw new Error("User ID not found.");
  }

  const command = `yt-dlp -x --audio-format mp3 --add-metadata --embed-thumbnail --output "${outputDir}/%(title)s.%(ext)s" "${url}"`;

  exec(command, async (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);

    const files = await fs.readdir(outputDir);

    for (const file of files.filter(
      (file) => path.extname(file).toLowerCase() === ".mp3"
    )) {
      const filePath = path.join(outputDir, file);
      try {
        const fileBuffer = await fs.readFile(filePath);
        const { data, error: uploadError } = await supabase.storage
          .from("audio")
          .upload(`${userId}/${path.basename(filePath)}`, fileBuffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: "audio/mpeg",
          });

        if (uploadError) {
          console.error(
            "Error uploading file to Supabase:",
            uploadError.message
          );
        } else {
          console.log("File uploaded successfully:", data);
        }
      } catch (readError) {
        console.error("Error reading file:", readError);
      }
    }
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
