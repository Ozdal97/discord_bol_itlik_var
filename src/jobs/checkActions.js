const cron = require("node-cron");
const {  disconnectFromVoice,sendDM,getUserId } = require("../services/discord.service");
const {  generateMorningMessage } = require("../services/chatgpt.service");
const guildId = "348949173078589440"
const userId = "269180337647648769"
const reason = "AFK"

const userIds = ["181127142648709121","303298929498390528", "269180337647648769", "366920433485873152","327543211557912597"];

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
async function discordMessage() {

    for (const id of userIds) {
        let userName = await getUserId(id);
        if (userName == null){
            continue;
        }

       let message = await generateMorningMessage(userName)

        console.log(message);


       let result = await sendDM({
            guildId: guildId,
            userId: id,
            text: message,
        })
        console.log(result)
    }

    return true;


}

async function onlyOnePersonMessage() {

}

module.exports = { startActionCron,discordMessage };
