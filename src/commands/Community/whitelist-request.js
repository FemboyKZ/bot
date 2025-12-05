const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const schema = require("../../schemas/baseSystem.js");
const status = require("../../schemas/requestStatus.js");
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

    const statusData = await status.findOne({
      User: interaction.user.id,
      Type: "whitelist",
    });

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "whitelist",
    });

    const steamWhitelist = new TextInputBuilder({
      customId: "steamWhitelist",
      required: true,
      label: "What is your SteamID, or Steam Profile URL",
      placeholder: "STEAM_1:0:XXX, replace X with your ID",
      style: TextInputStyle.Short,
    });

    const reasonWhitelist = new TextInputBuilder({
      customId: "reasonWhitelist",
      required: true,
      label: "Why should you get whitelisted",
      placeholder:
        "Do the owners know you? Were you whitelisted before? Are you a femboy? Etc.",
      style: TextInputStyle.Paragraph,
    });

    const requestWhitelist = new TextInputBuilder({
      customId: "requestWhitelist",
      required: true,
      label: "Have you requested to join the WL SteamGroup?",
      placeholder: "Yes/No",
      style: TextInputStyle.Short,
    });

    const modalWhitelist = new ModalBuilder({
      customId: "modalWhitelist",
      title: "Whitelist Request form",
      components: [
        new ActionRowBuilder({ components: [steamWhitelist] }),
        new ActionRowBuilder({ components: [reasonWhitelist] }),
        new ActionRowBuilder({ components: [requestWhitelist] }),
      ],
    });

    try {
      if (interaction.member.roles.cache.has(whitelistRole)) {
        return await interaction.reply({
          content: "You have already been whitelisted.",
          ephemeral: true,
        });
      }

      if (statusData) {
        if (statusData.Status === false) {
          return await interaction.reply({
            content:
              "Unfortunately your whitelist request has been denied, you will not be whitelisted.",
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
      }

      if (!data) {
        return await interaction.reply({
          content: "The whitelist requests are currently disabled.",
          ephemeral: true,
        });
      }

      await interaction.showModal(modalWhitelist);
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
