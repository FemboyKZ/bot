const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction) return;
  if (!interaction.isChatInputCommand()) return;
  else {
    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "audit-logs",
    });
    if (!data) return;

    const logID = data.Channel;
    const auditChannel = client.channels.cache.get(logID);
    if (!auditChannel) return;

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
          name: "User",
          value: `${user} / <@${userID}>`,
        },
        {
          name: "Command & User Input",
          value: `\`${interaction}\``,
        },
      ]);

    try {
      await auditChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
});
