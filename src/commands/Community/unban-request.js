const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const schema = require("../../schemas/baseSystem.js");
const status = require("../../schemas/requestStatus.js");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban-request")
    .setDescription("Request to get unbanned from the servers"),
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
      Type: "unban",
    });

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "unban",
    });

    const steamUnban = new TextInputBuilder({
      customId: "steamUnban",
      required: true,
      label: "What is your SteamID, or Steam Profile URL",
      placeholder: "STEAM_1:0:XXX, replace X with your ID",
      style: TextInputStyle.Short,
    });

    const reasonUnban = new TextInputBuilder({
      customId: "reasonUnban",
      required: true,
      label: "Why should you get unbanned?",
      placeholder:
        "Why were you banned? Why would we trust that you won't do it again? Etc.",
      style: TextInputStyle.Paragraph,
    });

    const serverUnban = new TextInputBuilder({
      customId: "serverUnban",
      required: true,
      label: "Which server were you banned from?",
      placeholder: "Server name or ID",
      style: TextInputStyle.Short,
    });

    const modalUnban = new ModalBuilder({
      customId: "modalUnban",
      title: "Unban Request form",
      components: [
        new ActionRowBuilder({ components: [steamUnban] }),
        new ActionRowBuilder({ components: [reasonUnban] }),
        new ActionRowBuilder({ components: [serverUnban] }),
      ],
    });

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
