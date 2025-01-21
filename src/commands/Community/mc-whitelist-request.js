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
    .setName("mc-whitelist-request")
    .setDescription("Request to join the Minecraft whitelist."),
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
      Type: "mc-whitelist",
    });

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "mc-whitelist",
    });

    const modalMc = new ModalBuilder()
      .setTitle("Minecraft Whitelist Request form")
      .setCustomId("modalMc");

    const uuidMc = new TextInputBuilder()
      .setCustomId("uuidMc")
      .setRequired(true)
      .setLabel("What is your Minecraft name or UUID?")
      .setPlaceholder("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
      .setStyle(TextInputStyle.Short);

    const reasonMc = new TextInputBuilder()
      .setCustomId("reasonMc")
      .setRequired(true)
      .setLabel("Why should you get whitelisted?")
      .setPlaceholder(
        "Do the owners know you? Were you whitelisted before? Are you a femboy? Etc."
      )
      .setStyle(TextInputStyle.Paragraph);

    const requestMc = new TextInputBuilder()
      .setCustomId("requestMc")
      .setRequired(true)
      .setLabel("What would you do on the Minecraft server?")
      .setPlaceholder("build cool shit or ... ?")
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(uuidMc);
    const secondActionRow = new ActionRowBuilder().addComponents(reasonMc);
    const thirdActionRow = new ActionRowBuilder().addComponents(requestMc);

    modalMc.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    try {
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

      await interaction.showModal(modalMc);
      timeout.push(interaction.user.id);
      setTimeout(() => {
        timeout.shift();
      }, 10000);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while processing the request.",
        ephemeral: true,
      });
    }
  },
};
