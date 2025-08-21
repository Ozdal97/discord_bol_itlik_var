const cron = require("node-cron");
const {  disconnectFromVoice,sendDM } = require("../services/discord.service");
const guildId = "348949173078589440"
const userId = "181127142648709121"
const reason = "AFK"

function startActionCron() {
    // */5 * * * * *  => her 5 saniyede bir
    cron.schedule("*/5 * * * * *", async () => {
        try {
            const response = await disconnectFromVoice({
                guildId: guildId,
                userId: userId,
                reason: reason
            });
            let text;
            if (response.ok){
                 text  = "Siktir git gelme bir daha"
            }else {
                 text = "Gel Gel atmıycam"
            }
            await sendDM({
                guildId: guildId,
                userId: userId,
                text: text,
            })
        } catch (e) {
            console.error("cron error:", e.message);
        }
    });
}

module.exports = { startActionCron };
