const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.InteractionCreate, async (interaction) => {
  const settingsData = await settings.findOne({
    Guild: interaction.guild.id,
  });
  if (settingsData.Interactions === false) return;
  if (settingsData.Post === false) return;

  if (!interaction.isChatInputCommand()) return;

  const data = await schema.findOne({
    Guild: interaction.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTitle("Chat Command Executed.")
    .setFooter({ text: `FKZ` })
    .setTimestamp()
    .addFields([
      {
        name: "User",
        value: `${interaction.user.username} / <@${interaction.user.id}>`,
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
});
