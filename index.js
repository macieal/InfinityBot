require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// --- KEEP ALIVE PARA O RENDER ---
const app = express();
app.get("/", (req, res) => res.send("Bot está online 24h!"));
app.listen(3000, () => console.log("Servidor web ativo!"));


// --- BOT DO DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
    client.user.setActivity("💻 Online 24h", { type: 3 });
});

client.on("messageCreate", (msg) => {
    if (msg.author.bot) return;

    if (msg.content === "!ping") {
        msg.reply("🏓 Pong!");
    }
});

client.login(process.env.TOKEN);