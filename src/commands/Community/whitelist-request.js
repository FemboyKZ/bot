const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const schema = require("../../Schemas/base-system.js");
const status = require("../../Schemas/whitelistStatus.js");
require("dotenv").config();

const whitelistRole = process.env.WHITELIST_ROLE;
var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-request")
    .setDescription("Request to join the whitelist."),
  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    if (timeout.includes(interaction.user.id))
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });

    try {
      const statusData = await status.findOne({
        Request: interaction.user.id,
      });

      if (statusData.Status === false) {
        return await interaction.reply({
          content:
            "Unfortunately your whitelist request has been denied, you will not be whitelisted.",
          ephemeral: true,
        });
      }

      if (interaction.member.roles.cache.has(whitelistRole)) {
        return await interaction.reply({
          content: "You have already been whitelisted.",
          ephemeral: true,
        });
      }

      if (statusData.Status === true) {
        return await interaction.reply({
          content: "You have already been whitelisted.",
          ephemeral: true,
        });
      }

      if (statusData.Status === null) {
        return await interaction.reply({
          content: "You have already requested, please check again later.",
          ephemeral: true,
        });
      }

      const data = await schema.findOne({
        Guild: interaction.guild.id,
        ID: "whitelist",
      });
      if (!data) {
        return await interaction.reply({
          content: "The whitelist requests are currently disabled.",
          ephemeral: true,
        });
      }

      const modalWhitelist = new ModalBuilder()
        .setTitle("Whitelist Request form")
        .setCustomId("modalWhitelist");

      const steamWhitelist = new TextInputBuilder()
        .setCustomId("steamWhitelist")
        .setRequired(true)
        .setLabel("What is your SteamID, or Steam Profile URL")
        .setPlaceholder("STEAM_1:0:XXX, replace X with your ID")
        .setStyle(TextInputStyle.Short);

      const reasonWhitelist = new TextInputBuilder()
        .setCustomId("reasonWhitelist")
        .setRequired(true)
        .setLabel("Why should you get whitelisted")
        .setPlaceholder(
          "Do the owners know you? Were you whitelisted before? Are you a femboy? Etc."
        )
        .setStyle(TextInputStyle.Paragraph);

      const requestWhitelist = new TextInputBuilder()
        .setCustomId("requestWhitelist")
        .setRequired(true)
        .setLabel("Have you requested to join the WL SteamGroup?")
        .setPlaceholder("Yes/No")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(
        steamWhitelist
      );
      const secondActionRow = new ActionRowBuilder().addComponents(
        reasonWhitelist
      );
      const thirdActionRow = new ActionRowBuilder().addComponents(
        requestWhitelist
      );

      modalWhitelist.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow
      );

      interaction.showModal(modalWhitelist);
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    } finally {
      timeout.push(interaction.user.id);
      setTimeout(() => {
        timeout.shift();
      }, 10000);
    }
  },
};
