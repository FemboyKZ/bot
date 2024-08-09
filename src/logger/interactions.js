const { EmbedBuilder, Events } = require("discord.js");
require("dotenv").config();
const { client } = require("../index.js");

// doesn't have an enable/disable command and only runs on fkz server cuz lazy lol
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction) return;
  if (!interaction.isChatInputCommand()) return;
  else {
    const channel = await client.channels.cache.get(process.env.LOGS_CHAT_ID);
    if (!channel) return;

    const server = interaction.guild?.name;
    const serverID = interaction.guild?.id;
    const user = interaction.user?.username;
    const userID = interaction.user?.id;

    if (!server || !serverID || !user || !userID) {
      console.error("Null or undefined value encountered");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("Chat Command Executed.")
      .setFooter({ text: `FKZ • ${serverID}` })
      .setTimestamp()
      .addFields([
        {
          name: "Channel",
          value: `${iChannel} / <#${iChannelID}>`,
        },
        {
          name: "User",
          value: `${user} / <@${userID}>`,
        },
        {
          name: "Command & User Input",
          value: `\`${interaction}\``,
        },
      ]);

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
});
