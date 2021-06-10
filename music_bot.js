const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const emoji = require('./emoji.json')
const prefix = process.env.PREFIX

class MusicBot {
    constructor() {
        const url = 'https://www.youtube.com/watch?v=l7TxwBhtTUY'
        ytdl.getInfo(url)
        .then(info => this.songInfo = info)
        .catch(err => {
            console.log(err)
            this.songInfo = null
        })
        this.connection = null
    }

    async changeUrl (message, url) {
        let success = false
        await ytdl.getInfo(url)
        .then(info => {
            success = true
            this.songInfo = info
            message.channel.send(`${emoji.CHECK_MARK} Change URL successfully !`)
        })
        .catch(err => {
            console.log(err)
            return message.channel.send(`${emoji.SOS} DJ can not find the video, please check your URL !`)
        })

        return success
    }

    verifyPermission(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send(`${emoji.CANCEL} You need to be in a voice channel to play music !`)
            return false
        }

        const permission = voiceChannel.permissionsFor(message.client.user)
        if (!permission.has("CONNECT") || !permission.has("SPEAK")) {
            message.channel.send(`${emoji.SETTING} I need the permissions to CONNECT and SPEAK in your channel !`)
            return false
        }

        return true
    }

    isOccupied (message) {
        if (this.connection !== null) {
            message.channel.send(`${emoji.CANCEL} Bot already connects to a voice channel !`)
            return true
        }

        return false
    }

    async play (message) {
        const voiceChannel = message.member.voice.channel
        if (this.songInfo === null) {
            return message.channel.send(`${emoji.SOS} DJ can not find the default video, please switch URL !`)
        }

        if (this.connection === null) {
            this.connection = await voiceChannel.join()
            message.channel.send(`${emoji.CD} DJ is in the house, folks. Enjoy the music !`)
        }

        this.connection.play(ytdl(this.songInfo.videoDetails.video_url))
            .on('finish', () => {
                this.play(message)
            })
            .on('error', error => {
                console.log(error)
                message.channel.send(`${emoji.SOS} Oh no, problem at the DJ booth. Better contact the engineer !`)
            })
    }

    stop (message) {
        if (this.connection === null) {
            return message.channel.send(`${emoji.CANCEL} Bot does not connect to any channel !`)
        }
        message.channel.send(`${emoji.ROCKET} Peace out !`)
        this.connection.channel.leave()
        this.connection = null
    }

    getSongInfo (message) {
        if (this.songInfo === null) {
            return message.channel.send(`${emoji.CANCEL} No song in queue right now !`)
        }

        const contents = [
            `Title: ${this.songInfo.videoDetails.title}`,
            `URL: ${this.songInfo.videoDetails.video_url}`
        ]

        message.channel.send(contents)
    }

    help (message) {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('DJ Commands')
            .setDescription('Find all the commands available on this channel')
            .addFields(
                {name: `${emoji.BTN_PLAY} ${prefix}play`, value: 'Play the music'},
                {name: `${emoji.BTN_STOP} ${prefix}stop`, value: 'Stop the music'},
                {name: `${emoji.CD} ${prefix}url + URL`, value: 'Change song URL'},
                {name: `${emoji.MUSICAL_SCORE} ${prefix}song`, value: 'Get song info'},
            )

        message.channel.send(embed)
    }
}

// module.exports = commands
module.exports = MusicBot