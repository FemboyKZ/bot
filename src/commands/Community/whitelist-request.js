import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import whitelistSchema from "../../Schemas.js/whitelistSchema";

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-request")
    .setDescription("Request to join the whitelist."),
  async execute(interaction) {
    if (timeout.includes(interaction.user.id))
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });

    whitelistSchema.findOne(
      { Guild: interaction.guild.id },
      async (err, data) => {
        if (!data) {
          return await interaction.reply({
            content: "The whitelist requests are currently disabled.",
            ephemeral: true,
          });
        }

        if (data) {
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
        }
      }
    );

    timeout.push(interaction.user.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);
  },
};
