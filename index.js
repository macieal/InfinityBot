require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// --- KEEP ALIVE PARA O RENDER / FUNCIONA NO PC ---
const app = express();
app.get("/", (req, res) => res.send("Bot está online!"));
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor web ativo!");
});

// --- BOT DO DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", (client) => {
    console.log(`Bot iniciado como ${client.user.tag}`);

    const statusList = [
	    "☄ InfinityStudios ✨",
        "☕ InfinityStore ⭐",
        "☄ InfinityBrowser 🌌",
        "☁ InfinityCloud 🔨",
        "☄ infinitystudios.vercel.app 🏓",
		"🌌 infinitystore.onrender.com ☄",
		"☁ infinitycloud.onrender.com ☁",
		"👻",
		"☄ InfinityStudios, trabalhando para o seu melhor! 🌌",
    ];

    let index = 0;

    // Força definir o primeiro status imediatamente
    client.user.setActivity(statusList[index], { type: 3 });

    // E depois troca a cada 12 segundos
    setInterval(() => {
        index = (index + 1) % statusList.length;
        client.user.setActivity(statusList[index], { type: 3 });
        console.log("Status trocado para:", statusList[index]);
    }, 12000);
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    const args = msg.content.split(" ");
    const cmd = args.shift().toLowerCase();

    // =============================
    // 1) !entrar <id da call>
    // =============================
    if (cmd === "!entrar") {
        const canal = args[0];
        if (!canal) return msg.reply("❌ Você precisa colocar o ID de um canal de voz!");
		
		if (!msg.member.permissions.has("Administrator"))
            return msg.reply("❌ Você não tem permissão!");

        try {
            const voiceChannel = msg.guild.channels.cache.get(canal);
            if (!voiceChannel || voiceChannel.type !== 2)
                return msg.reply("❌ ID inválido ou canal não é de voz!");

            const { joinVoiceChannel } = require("@discordjs/voice");

            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: msg.guild.id,
                adapterCreator: msg.guild.voiceAdapterCreator
            });

            msg.reply("🎧 Entrei no canal!");
        } catch (err) {
            console.log(err);
            msg.reply("❌ Não consegui entrar no canal!");
        }
    }

    // =============================
    // 2) !embed <titulo> <descrição>
    // =============================
    if (cmd === "!embed") {
        const titulo = args[0];
        const desc = args.slice(1).join(" ");

        if (!titulo || !desc)
            return msg.reply("❌ Use: !embed <titulo> <descrição>");

        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(desc)
            .setColor("black");

        msg.channel.send({ embeds: [embed] });
    }

    // =============================
    // 3) !useravatar @menção
    // =============================
    if (cmd === "!useravatar") {
        const user = msg.mentions.users.first() || msg.author;

        const { EmbedBuilder } = require("discord.js");
        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${user.username}`)
            .setImage(user.displayAvatarURL({ size: 4096 }))
            .setColor("black");

        msg.reply({ embeds: [embed] });
    }

    // =============================
    // 4) !userbanner @menção
    // =============================
    if (cmd === "!userbanner") {
        const user = msg.mentions.users.first() || msg.author;

        const fetched = await user.fetch();
        const banner = fetched.bannerURL({ size: 4096 });

        if (!banner)
            return msg.reply("❌ Esse usuário não tem banner!");

        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
            .setTitle(`Banner de ${user.username}`)
            .setImage(banner)
            .setColor("black");

        msg.reply({ embeds: [embed] });
    }

    // =============================
    // 5) !serverinfo
    // =============================
    if (cmd === "!serverinfo") {
        const server = msg.guild;
        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
            .setTitle(server.name)
            .setDescription(server.description || "Sem descrição 😔")
            .setThumbnail(server.iconURL({ size: 1024 }))
            .setColor("black");

        msg.reply({ embeds: [embed] });
    }

    // =============================
    // 6) !say <mensagem>
    // =============================
    if (cmd === "!say") {
        const texto = args.join(" ");
        if (!texto) return msg.reply("❌ Use: !say <mensagem>");
        msg.delete().catch(() => {});
        msg.channel.send(texto);
    }

    // =============================
    // 7) !help
    // =============================
    if (cmd === "!help") {
        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
            .setTitle("📘 Lista de Comandos")
            .setColor("black")
            .setDescription(`
**Comandos gerais:**
> !entrar (id)
> !embed (titulo) (descrição)
> !useravatar (@)
> !userbanner (@)
> !serverinfo
> !say (texto)
> !help

**Moderação (ADM):**
> !ban @user
> !kick @user
> !clear (quantidade)
            `);

        msg.reply({ embeds: [embed] });
    }

    // =============================
    // 🔧 COMANDOS DE MODERAÇÃO
    // =============================

    // BAN
    if (cmd === "!ban") {
        if (!msg.member.permissions.has("Administrator"))
            return msg.reply("❌ Você não tem permissão!");

        const user = msg.mentions.members.first();
        if (!user) return msg.reply("❌ Mencione alguém!");

        await user.ban();
        msg.reply("🔨 Usuário banido!");
    }

    // KICK
    if (cmd === "!kick") {
        if (!msg.member.permissions.has("Administrator"))
            return msg.reply("❌ Você não tem permissão!");

        const user = msg.mentions.members.first();
        if (!user) return msg.reply("❌ Mencione alguém!");

        await user.kick();
        msg.reply("👢 Usuário expulso!");
    }

    // CLEAR
    if (cmd === "!clear") {
        if (!msg.member.permissions.has("Administrator"))
            return msg.reply("❌ Você não tem permissão!");

        const qnt = parseInt(args[0]);
        if (!qnt || qnt > 100)
            return msg.reply("❌ Use: !clear <1-100>");

        await msg.channel.bulkDelete(qnt);
        msg.reply(`🧹 Apaguei ${qnt} mensagens!`).then(m => setTimeout(() => m.delete(), 3000));
    }
});

// LOGIN
client.login(process.env.TOKEN);

// --- DEBUG PRA MOSTRAR QUALQUER ERRO ---
client.on("error", (err) => console.error("Erro no client:", err));
process.on("unhandledRejection", (err) => console.error("Promise rejeitada:", err));
process.on("uncaughtException", (err) => console.error("Erro fatal:", err));