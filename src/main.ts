import { token } from '../config.json';
import { StreamersRegexList } from './constants/validation';
import { downloadSongSC, getSongInfoSC } from './Soundcloud/soundcloud';
import { onlyUnique } from './Utils/Utils';
import { DownloadAudioAndVideo, DownloadAudioOnly, parseInfo, VideoInfo } from './Youtube/youtube';
import { createReadStream } from 'node:fs';

const Slimbot = require('slimbot');
const slimbot = new Slimbot(token);

let searchResult: VideoInfo;
let qualityOptions: any[] = [];

slimbot.on('message', async (message: any) => {
    const chatId = message.chat.id;

    if (StreamersRegexList.YOUTUBE.test(message.text)) {
        searchResult = await parseInfo(message.text);
        await slimbot.sendMessage(message.chat.id, `Found: ${searchResult.title} - ${searchResult.author}`);
        const filterResult = searchResult.qualities.map((quality) => {
            if (quality.quality !== null) {
                return quality.quality;
            }
        });
        // @ts-expect-error
        qualityOptions = filterResult.filter(onlyUnique);
        qualityOptions.push('Audio');

        const keyboardOptionsArray = qualityOptions
            .filter((element) => element !== undefined)
            .map((option) => new Array({ text: option, callback_data: option }));

        let optionalParams = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: keyboardOptionsArray
            })
        };
        await slimbot.sendMessage(chatId, 'Please choose the format/quality you wish to download!', optionalParams);
    }

    if (StreamersRegexList.SOUNDCLOUD.test(message.text)) {
        const songInfo = await getSongInfoSC(message.text);
        await slimbot.sendMessage(message.chat.id, `Found: ${songInfo.title} - ${songInfo.author.name}`);
        const audioBuffer = await downloadSongSC(songInfo);
        await slimbot.sendAudio(chatId, audioBuffer);
        return;
    }

    await slimbot.sendMessage(message.chat.id, 'Only Soundcloud and Youtube links are supported!');
});

slimbot.on('callback_query', async (query: any) => {
    if (qualityOptions.includes(query.data)) {
        if (query.data === 'Audio') {
            await slimbot.sendMessage(
                query.message.chat.id,
                `Ok, Downloading ${searchResult.title} in ${query.data}, Please be patient`
            );
            const audioBuffer = await DownloadAudioOnly(searchResult);
            console.log(audioBuffer);
            await slimbot.sendAudio(query.message.chat.id, audioBuffer);
            return;
        }

        await slimbot.sendMessage(
            query.message.chat.id,
            `Ok, Downloading ${searchResult.title} in ${query.data}, Please be patient`
        );
        await DownloadAudioAndVideo(searchResult, query.data, `${searchResult.title}_${query.id}`);
        setTimeout(async () => {
            // const videoPath = readFileSync(`${__dirname}/../videos/${searchResult.title}_${query.message.chat.id}.mkv`)
            const stream = createReadStream(`${__dirname}/../../videos/${searchResult.title}_${query.id}.mkv`);
            await slimbot.sendVideo(query.message.chat.id, stream);
        }, 2000);
    } else {
        await slimbot.sendMessage(query.message.chat.id, `I could not find the quality you specified!`);
    }
});

slimbot.startPolling();
