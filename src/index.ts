import { Message } from "node-telegram-bot-api";
import { token } from "../config.json"
import { StreamersRegexList } from "./constants/validation";
import { downloadSongSC, getSongInfoSC } from "./Soundcloud/soundcloud";
import { downloader, parseInfo } from "./Youtube/youtube";
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(token, { polling: true });


bot.onText(StreamersRegexList.YOUTUBE, async (msg: Message, match: any) => {
    const chatId = msg.chat.id;
    try {

        bot.sendMessage(chatId, "Fetching the video from Link...");
        const video = await parseInfo(match[0])
        bot.sendMessage(chatId, `Found: ${video.title} - ${video.author}`);
        const videoBuffer = await downloader(video.qualities[0].url)
        const fileOptions = {
            filename: video.title,
            contentType: `application/octet-stream`
        };
        bot.sendVideo(chatId, videoBuffer, {}, fileOptions)

    } catch (error: any) {
        bot.sendMessage(chatId, error.message)
    }
});



bot.onText(StreamersRegexList.SOUNDCLOUD, async (msg: Message, match: any) => {
    const chatId = msg.chat.id;
    try {

        bot.sendMessage(chatId, "Fetching the video from Link...");
        const video = await getSongInfoSC(match[0])
        bot.sendMessage(chatId, `Found: ${video.title} - ${video.author.name}`)
        const videoBuffer = await downloadSongSC(video)
        const fileOptions = {
            filename: video.title,
        };
        bot.sendAudio(chatId, videoBuffer, {}, fileOptions)

    } catch (error: any) {
        bot.sendMessage(chatId, error.message)
    }
});


bot.on('polling_error', (error: { code: any; }) => {
    console.log(error.code);  // => 'EFATAL'
});