require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const axios = require("axios");
const express = require("express");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,      // Privileged intent (Developer Portal'da aç)
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.GuildMember, Partials.User]
});

const API = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: { "Authorization": `Bearer ${process.env.API_KEY}` },
    timeout: 10_000
});

// ---- Yardımcılar ----
async function kickFromGuild(guildId, userI, reason = "Policy") {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return { ok: false, error: "Guild not found" };

    // Üyeyi cache'te bulamazsa fetch et
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return { ok: false, error: "Member not found" };

    // Kendi rol hiyerarşin izin veriyor mu?
    if (!guild.members.me.permissions.has("KickMembers"))
        return { ok: false, error: "Missing KICK_MEMBERS permission" };

    // Kick
    await member.kick(reason).catch(e => ({ ok: false, error: e.message }));
    return { ok: true };
}

async function disconnectFromVoice(guildId, userId, reason = "AFK") {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return { ok: false, error: "Guild not found" };

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return { ok: false, error: "Member not found" };

    // Ses kanalında mı?
    if (!member.voice?.channel) return { ok: false, error: "User not in a voice channel" };

    // MOVE_MEMBERS gerekiyor
    if (!guild.members.me.permissions.has("MoveMembers"))
        return { ok: false, error: "Missing MOVE_MEMBERS permission" };

    // Kullanıcının voice state'ini null'a çekmek = disconnect
    await member.voice.disconnect(reason).catch(e => ({ ok: false, error: e.message }));
    return { ok: true };
}

// ---- API'den aksiyon çek, sırayla uygula ----
async function pollActions() {
    try {
        const { data: actions } = await API.get("/actions"); // Örn: /actions kuyruğu
        if (!Array.isArray(actions) || actions.length === 0) return;

        for (const act of actions) {
            let result;
            if (act.type === "kick") {
                result = await kickFromGuild(act.guildId, act.userId, act.reason);
            } else if (act.type === "disconnect") {
                result = await disconnectFromVoice(act.guildId, act.userId, act.reason);
            } else {
                result = { ok: false, error: `Unknown action type: ${act.type}` };
            }

            // Başarılı/başarısız sonucu senin API'ne raporla (opsiyonel)
            try {
                await API.post("/actions/result", {
                    id: act.id ?? null,
                    type: act.type,
                    guildId: act.guildId,
                    userId: act.userId,
                    ok: !!result?.ok,
                    error: result?.error || null
                });
            } catch (_) {}
            // Küçük bir bekleme ile rate-limit'i rahatlat
            await new Promise(r => setTimeout(r, 750));
        }
    } catch (err) {
        console.error(err.message)
        // Sessizce yutma yerine log tut
        console.error("pollActions error:", err?.message || err);
    }
}

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    // 10 saniyede bir aksiyon çek
    setInterval(pollActions, 10_000);
});

// ---- (Opsiyonel) Webhook tarzı tetikleme için küçük Express sunucusu ----
const app = express();
app.use(express.json());

// Dış sistem POST /webhook ile anında emir yollayabilir
app.post("/webhook", async (req, res) => {
    const act = req.body;
    try {
        let result;
        if (act.type === "kick") {
            result = await kickFromGuild(act.guildId, act.userId, act.reason);
        } else if (act.type === "disconnect") {
            result = await disconnectFromVoice(act.guildId, act.userId, act.reason);
        } else {
            return res.status(400).json({ ok: false, error: "Unknown action type" });
        }
        return res.json(result);
    } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP listening on :${PORT}`));

// ---- Giriş ----
client.login(process.env.DISCORD_TOKEN);
