require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates // voice state okumak için yeterli
    ],
    partials: [Partials.GuildMember, Partials.User]
});

let readyResolve;
const ready = new Promise((res) => (readyResolve = res));

client.once("ready", () => {
    console.log(`✅ Discord logged in as ${client.user.tag}`);
    client.guilds.cache.forEach(g => {
        console.log(`• Guild: ${g.name} (${g.id})`);
    });
    readyResolve(true);
});

async function loginDiscord() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) throw new Error("DISCORD_TOKEN missing in .env");
    await client.login(token);
    await ready; // hazır olmadan servis çağrılmasın
    return client;
}

module.exports = { client, loginDiscord, ready };
