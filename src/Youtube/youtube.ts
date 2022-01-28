import ytdl = require('ytdl-core');
const fetch = require('node-fetch');
import cp from 'child_process';
const ffmpeg = require('ffmpeg-static');
import { Readable } from 'stream';

export interface VideoInfo {
    title: string
    author: string
    qualities: [{
        quality: string | undefined
        container: string;
        url: string,
        codecs: string,
        audioQuality: string | undefined
    }]
}

/**
 * Loads the video Info and filters for videos with Audio and Video!
 * @param url YYoutube Video URL
 * @returns Object
 */

export async function parseInfo(url: string): Promise<VideoInfo> {
    const info = await ytdl.getInfo(url);
    const bestquality = info.formats.map((spec) => {

        return (
            {
                quality: spec?.qualityLabel,
                container: spec?.container,
                url: spec?.url,
                codecs: spec?.codecs,
                audioQuality: spec?.audioQuality
            }

        )
    });

    return {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        qualities: bestquality
    } as unknown as VideoInfo
}

/**
 * Returns the Stream Buffer of the Video you wish to download from
 * @param url Youtube download deciphered URL
 * @returns Buffer
 */

export async function FetchMediaBuffer(url: string): Promise<Buffer> {
    const fetchVideo = await fetch(url);
    const buffer = await fetchVideo.buffer();
    return buffer;
}



export async function DownloadAudioAndVideo(videoArray: VideoInfo, queryQuality: string, fileName?: string | number) {
    const getVideo = videoArray.qualities.filter(quality => quality.quality === queryQuality)
    const getAudio = videoArray.qualities.filter((audio) => audio.codecs === "opus" && audio.audioQuality === "AUDIO_QUALITY_MEDIUM")
    if (!getVideo || !getAudio) return

    console.log(`Getting Video....`)
    const video = await FetchMediaBuffer(getVideo[0].url)

    console.log(`Getting Audio....`)
    const audio = await FetchMediaBuffer(getAudio[0].url)

    const ffmpegProcess = cp.spawn(
        ffmpeg,
        [
            '-loglevel',
            '8',
            '-hide_banner',
            '-progress',
            'pipe:3',
            '-i',
            'pipe:4',
            '-i',
            'pipe:5',
            '-map',
            '0:a',
            '-map',
            '1:v',
            '-c:v',
            'copy',
            `${__dirname}/../../../videos/${fileName}.mkv`
        ],
        {
            windowsHide: true,
            stdio: [
                'inherit',
                'inherit',
                'inherit',
                'pipe',
                'pipe',
                'pipe'
            ]
        }
    );

    const audioBuffer = new Readable();
    audioBuffer._read = () => { };
    audioBuffer.push(audio);
    audioBuffer.push(null);

    const videoBuffer = new Readable();
    videoBuffer._read = () => { };
    videoBuffer.push(video);
    videoBuffer.push(null);

    console.log(`Piping....`)
    // @ts-expect-error
    audioBuffer.pipe(ffmpegProcess.stdio[4]);
    // @ts-expect-error
    videoBuffer.pipe(ffmpegProcess.stdio[5]);
    console.log("Done Piping")
}

export async function DownloadAudioOnly(videoArray: VideoInfo): Promise<Buffer> {
    const getAudio = videoArray.qualities.filter((audio) => audio.codecs === "opus" && audio.audioQuality === "AUDIO_QUALITY_MEDIUM")
    const audio = await FetchMediaBuffer(getAudio[0].url)
    return audio
}   