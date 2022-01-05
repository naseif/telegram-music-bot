const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();


/**
 * Loads the info of the given Song
 * @param url soundcloud song URL
 * @returns SongInfo
 */

export async function getSongInfoSC(url: string) {
    const info = await client.getSongInfo(url)
    return info
}

/**
 * Downloads the Stream and returns the buffer
 * @param info the result of getSongInfo
 * @returns 
 */

export async function downloadSongSC(info: any) {
    const stream = await info.downloadProgressive();
    return stream;
}