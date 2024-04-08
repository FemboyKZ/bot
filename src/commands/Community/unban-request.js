const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const unbanSchema = require("../../Schemas.js/unbanSchema");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban-request")
    .setDescription("Request to get unbanned from the servers"),
  async execute(interaction) {
    if (timeout.includes(interaction.user.id))
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });

    unbanSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (!data) {
        return await interaction.reply({
          content: "The unban requests are currently disabled.",
          ephemeral: true,
        });
      }

      if (data) {
        const modal2 = new ModalBuilder()
          .setTitle("Unban Request form")
          .setCustomId("modal2");

        const steam2 = new TextInputBuilder()
          .setCustomId("steam2")
          .setRequired(true)
          .setLabel("What is your SteamID, or Steam Profile URL")
          .setPlaceholder("STEAM_1:0:XXX, replace X with your ID")
          .setStyle(TextInputStyle.Short);

        const reason2 = new TextInputBuilder()
          .setCustomId("reason2")
          .setRequired(true)
          .setLabel("Why should you get unbanned?")
          .setPlaceholder(
            "Why were you banned? Why would we trust that you won't do it again? Etc."
          )
          .setStyle(TextInputStyle.Paragraph);

        const csServer2 = new TextInputBuilder()
          .setCustomId("server2")
          .setRequired(true)
          .setLabel("Which server were you banned from?")
          .setPlaceholder("IP or name of the server")
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(steam2);
        const secondActionRow = new ActionRowBuilder().addComponents(reason2);
        const thirdActionRow = new ActionRowBuilder().addComponents(csServer2);

        modal2.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        interaction.showModal(modal2);
      }
    });

    timeout.push(interaction.user.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);
  },
};
