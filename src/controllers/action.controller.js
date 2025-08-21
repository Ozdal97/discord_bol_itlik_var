const { kickFromGuild, disconnectFromVoice,sendDM } = require("../services/discord.service");

function parseBody(req, fields) {
    const body = req.body || {};
    const missing = fields.filter((f) => !body[f]);
    if (missing.length) {
        return { error: `Missing fields: ${missing.join(", ")}` };
    }
    return { data: body };
}

async function kick(req, res) {
    const check = parseBody(req, ["guildId", "userId"]);
    if (check.error) return res.status(400).json({ ok: false, error: check.error });

    const result = await kickFromGuild({
        guildId: check.data.guildId,
        userId: check.data.userId,
        reason: check.data.reason
    });

    return res.status(result.ok ? 200 : (result.status || 400)).json(result);
}

async function disconnect(req, res) {
    const check = parseBody(req, ["guildId", "userId"]);
    if (check.error) return res.status(400).json({ ok: false, error: check.error });

    const result = await disconnectFromVoice({
        guildId: check.data.guildId,
        userId: check.data.userId,
        reason: check.data.reason
    });

    return res.status(result.ok ? 200 : (result.status || 400)).json(result);
}

async function directMessage(req, res) {
    const check = parseBody(req, ["guildId", "userId","text"]);
    if (check.error) return res.status(400).json({ ok: false, error: check.error });

    const result = await sendDM({
        userId: check.data.userId,
        text: check.data.text
    });

    return res.status(result.ok ? 200 : (result.status || 400)).json(result);
}

module.exports = { kick, disconnect,directMessage };
