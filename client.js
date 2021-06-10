const Discord = require('discord.js')
const MusicBot = require('./music_bot.js')
// const {
// 	prefix,
// 	token,
// } = require('./config.json')

const prefix = process.env.PREFIX
const token = process.env.TOKEN

const bot = new MusicBot()
const client = new Discord.Client()
client.login(token)

client.once('ready', () => {
    console.log('Ready!')
});
client.once('reconnecting', () => {
    console.log('Reconnecting!')
});
client.once('disconnect', () => {
    console.log('Disconnect!')
});

client.on('message', async message => {
    if (message.author.bot) return

    if (!message.content.startsWith(prefix)) return

    const contents = message.content.split(" ")
    const cmd = contents[0]
    let args = null
    if (contents.length > 1) {
        args = contents.slice(1)
    }

    switch (cmd) {
        case '!url':
            success = await bot.changeUrl(message, args[0])
            if (message.member.voice.channel && success) {
                bot.play(message)
            }
            break
        
        case '!play':
            if (!bot.verifyPermission(message)) return

            if (bot.isOccupied(message)) return

            bot.play(message)
            break

        case '!stop':
            bot.stop(message)
            break

        case '!song':
            bot.getSongInfo(message)
            break

        case '!help':
            bot.help(message)
            break
    }
})