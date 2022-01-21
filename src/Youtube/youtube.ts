import ytdl = require('ytdl-core');
const fetch = require('node-fetch');

export interface VideoInfo {
    title: string;
    author: string;
    qualities: any[];
}

/**
 * Loads the video Info and filters for videos with Audio and Video!
 * @param url YYoutube Video URL
 * @returns Object
 */

export async function parseInfo(url: string): Promise<VideoInfo> {
    const info = await ytdl.getInfo(url);
    const bestquality = info.formats.filter((spec) => {
        if (spec.hasVideo && spec.hasAudio) {
            return spec; // This will only return a 360p quality since this is the only one that has audio in it!
        }
    });
    return {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        qualities: bestquality
    } as unknown as VideoInfo;
}

/**
 * Returns the Stream Buffer of the Video you wish to download from
 * @param url Youtube download deciphered URL
 * @returns Buffer
 */

export async function downloader(url: string): Promise<Buffer> {
    const fetchVideo = await fetch(url);
    const buffer = await fetchVideo.buffer();
    return buffer;
}
