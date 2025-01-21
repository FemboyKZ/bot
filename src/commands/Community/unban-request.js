const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const schema = require("../../schemas/base-system.js");
const status = require("../../schemas/request-status.js");

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
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });
    }

    const statusData = await status.findOne({
      User: interaction.user.id,
      Type: "unban",
    });

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "unban",
    });

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

    try {
      if (statusData) {
        if (statusData.Status === false) {
          return await interaction.reply({
            content:
              "Unfortunately your unban request has been denied, you can request again later.",
            ephemeral: true,
          });
        }

        if (statusData.Status === true) {
          return await interaction.reply({
            content: "You have already been unbanned.",
            ephemeral: true,
          });
        }

        if (statusData.Status === null) {
          return await interaction.reply({
            content: "You have already requested, please check again later.",
            ephemeral: true,
          });
        }
      }

      if (!data) {
        return await interaction.reply({
          content: "The unban requests are currently disabled.",
          ephemeral: true,
        });
      }

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
