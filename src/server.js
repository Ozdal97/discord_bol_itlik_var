require("dotenv").config();
const { createApp } = require("./app");
const { loginDiscord, ready } = require("./discord/client");
const { startActionCron } = require("./jobs/checkActions");

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        // 1) Discord’a bağlan
        await loginDiscord();
        await ready;

        // 2) Express’i aç
        const app = createApp();
        app.listen(PORT, () => {
            startActionCron();
            console.log(`🌐 HTTP listening on :${PORT}`);
            console.log(`➡️  POST /actions/kick       { guildId, userId, reason? }`);
            console.log(`➡️  POST /actions/disconnect { guildId, userId, reason? }`);
        });
    } catch (e) {
        console.error("Boot error:", e?.message || e);
        process.exit(1);
    }
})();
