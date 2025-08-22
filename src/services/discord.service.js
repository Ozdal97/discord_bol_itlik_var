const {PermissionFlagsBits} = require("discord.js");
const {client} = require("../discord/client");

async function disconnectFromVoice({guildId, userId, reason = "AFK"}) {
    // 1) Guild'i güvenli şekilde al
    const guild = await getGuildId(guildId)

    if (!guild) return {ok: false, status: 404, error: "Guild not found"};
    // 2) Botun kendi member nesnesini garanti et
    let me = guild.members.me;
    if (!me) {
        // discord.js v14: fetchMe yoksa, user id ile fetch et
        me = await guild.members.fetch(client.user.id).catch(() => null);
    }
    if (!me) return {ok: false, status: 403, error: "Bot is not a member of this guild"};

    // 3) İzin kontrolünü opsiyonel zincirle
    if (!me.permissions?.has(PermissionFlagsBits.MoveMembers)) {
        return {ok: false, status: 403, error: "Missing MOVE_MEMBERS permission"};
    }

    // 4) Kullanıcının voice state'ini al
    let vs = guild.voiceStates.resolve(userId);
    if (!vs) {
        vs = await guild.voiceStates.fetch(userId).catch(() => null);
    }
    if (!vs || !vs.channel) {
        return {ok: false, status: 400, error: "User not in a voice channel"};
    }

    // 5) Disconnect uygula
    try {
        await vs.setChannel(null, reason);
        return {ok: true, action: "disconnect", guildId, userId};
    } catch (e) {
        return {ok: false, status: 400, error: e.message || "Disconnect failed"};
    }
}

async function getGuildId(guildId) {
    return client.guilds.fetch(guildId).catch(() => null);
}

async function kickFromGuild({guildId, userId, reason = "Policy"}) {
    const guild = await getGuildId(guildId)
    if (!guild) return {ok: false, status: 404, error: "Guild not found"};

    let me = guild.members.me;
    if (!me) me = await guild.members.fetch(client.user.id).catch(() => null);
    if (!me) return {ok: false, status: 403, error: "Bot is not a member of this guild"};

    if (!me.permissions?.has(PermissionFlagsBits.KickMembers)) {
        return {ok: false, status: 403, error: "Missing KICK_MEMBERS permission"};
    }

    try {
        await guild.members.kick(userId, reason);
        return {ok: true, action: "kick", guildId, userId};
    } catch (e) {
        return {ok: false, status: 400, error: e.message || "Kick failed"};
    }
}

async function sendDM({userId, text}) {
    try {
        const user = await client.users.fetch(userId);
        if (!user) return { ok: false, error: "User not found" };

        await user.send(text);
        return { ok: true };
    } catch (e) {
        console.log(e)
        return { ok: false, error: e.message };
    }
}

async function getUserId(userId){

    const user = await client.users.fetch(userId);
    return user.globalName ?? null;

}

module.exports = {disconnectFromVoice, kickFromGuild,sendDM,getUserId};
