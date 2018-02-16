const Discord = require('discord.js');
const config = require("./config.json");

const bot = new Discord.Client();
bot.login(config.token);

bot.on('ready', () => {
    bot.channels.array().forEach(channel => {
        if (channel.type === "voice" && channel.members.size)
        {
            console.log("\"" + channel.name + "\" has " + channel.members.size + " members.");
            calculateGame(channel);
        }
    });
    console.log('botBOI locked and loaded.');
});

let chanDefault = {};

function calculateGame(channel) {
    console.log("Calculating...");
    let games = {};
    channel.members.map((member) => {
        if (member.presence.game) {
            if (!(member.presence.game.name in games))
                games[member.presence.game.name] = 1;
            else
                games[member.presence.game.name]++
        }
    });

    let max = {val: 0, game: ""};
    Object.keys(games).forEach(key => {
        if (games[key] > max.val) {
            max.game = key;
            max.val = games[key];
        } else if (games[key] === max.val) {
            max.game = "";
        }
    });

    if (!(channel.id in chanDefault)) {
        chanDefault[channel.id] = channel.name;
    }
    if (max.game) {
        console.log("\"" + channel.name + "\" is now playing \"" + max.game + "\"");
        channel.setName(max.game);
    } else {
        console.log("\"" + channel.name + "\" is now playing \"" + chanDefault[channel.id] + "\"");
        channel.setName(chanDefault[channel.id]);
    }
}

bot.on("voiceStateUpdate", (oldMember, newMember) => {
    const oldChannel = oldMember.voiceChannel;
    const newChannel = newMember.voiceChannel;

    if (newChannel !== undefined) {
        if (oldChannel !== newChannel) {
            if (oldChannel === undefined) {
                // User joins voice channel
                console.log("User \"" + newMember.displayName + "\" joined \"" + newChannel.name + "\"");
                calculateGame(newChannel);
            } else {
                // User moves voice channel
                console.log("User \"" + newMember.displayName + "\" moved to \"" + newChannel.name + "\"");
                calculateGame(oldChannel);
                calculateGame(newChannel);
            }
        }
    } else {
        // User leaves voice channel
        console.log("User \"" + newMember.displayName + "\" left \"" + oldChannel.name + "\"");
        calculateGame(oldChannel);
    }
});

bot.on("presenceUpdate", (oldMember, newMember) => {
    const oldGame = oldMember.presence.game ? oldMember.presence.game.name : "";
    const newGame = newMember.presence.game ? newMember.presence.game.name : "";

    if (newMember.voiceChannel && oldGame !== newGame) {
        console.log("Member \"" + newMember.displayName + "\" in \"" + newMember.voiceChannel.name + "\" is now playing \"" + newGame + "\"");
        calculateGame(newMember.voiceChannel);
    }
    /*else if (oldGame !== newGame) {
        console.log("Member \"" + newMember.displayName + "\" not in a chat is now playing \"" + newGame + "\"");
    }*/
});

function close() {
    console.log("Closing.");
    Object.keys(chanDefault).forEach(id => {
        console.log("Fixing \"" + bot.channels.get(id).name + "\"");
        bot.channels.get(id).setName(chanDefault[id]);
    });
    setTimeout(() => process.exit(), 1000);
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
