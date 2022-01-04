import { Message } from "node-telegram-bot-api";
import { token } from "../config.json"
import { createWriteStream, readFileSync } from "fs"
const youtubedl = require('youtube-dl-exec')
const TelegramBot = require('node-telegram-bot-api');


const bot = new TelegramBot(token, { polling: true });

const YoutubeRegex = /^((?:https?:)\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))((?!channel)(?!user)\/(?:[\w\-]+\?v=|embed\/|v\/)?)((?!channel)(?!user)[\w\-]+)(((.*(\?|\&)t=(\d+))(\D?|\S+?))|\D?|\S+?)$/


bot.onText(YoutubeRegex, async (msg: Message, match: any) => {
    const chatId = msg.chat.id;
    const readVideo = readFileSync(`${__dirname}/${chatId}.mp4`)
    bot.sendVideo(chatId, readVideo);
});
