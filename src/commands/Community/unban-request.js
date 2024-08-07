const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const unbanSchema = require("../../Schemas/unbans");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban-request")
    .setDescription("Request to get unbanned from the servers"),
  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    if (timeout.includes(interaction.user.id)) {
      await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });
      return;
    }

    try {
      const data = await unbanSchema.findOne({ Guild: interaction.guild.id });
      if (!data) {
        await interaction.reply({
          content: "The unban requests are currently disabled.",
          ephemeral: true,
        });
        return;
      }

      const modalUnban = new ModalBuilder()
        .setTitle("Unban Request form")
        .setCustomId("modalUnban");

      const steamUnban = new TextInputBuilder()
        .setCustomId("steamUnban")
        .setRequired(true)
        .setLabel("What is your SteamID, or Steam Profile URL")
        .setPlaceholder("STEAM_1:0:XXX, replace X with your ID")
        .setStyle(TextInputStyle.Short);

      const reasonUnban = new TextInputBuilder()
        .setCustomId("reasonUnban")
        .setRequired(true)
        .setLabel("Why should you get unbanned?")
        .setPlaceholder(
          "Why were you banned? Why would we trust that you won't do it again? Etc."
        )
        .setStyle(TextInputStyle.Paragraph);

      const serverUnban = new TextInputBuilder()
        .setCustomId("serverUnban")
        .setRequired(true)
        .setLabel("Which server were you banned from?")
        .setPlaceholder("IP or name of the server")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(steamUnban);
      const secondActionRow = new ActionRowBuilder().addComponents(reasonUnban);
      const thirdActionRow = new ActionRowBuilder().addComponents(serverUnban);

      modalUnban.addComponents(firstActionRow, secondActionRow, thirdActionRow);

      await interaction.showModal(modalUnban);

      timeout.push(interaction.user.id);
      setTimeout(() => {
        timeout.shift();
      }, 10000);
    } catch (error) {
      console.error("Error executing command:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
