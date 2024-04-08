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
const mcWhitelistSchema = require("../../Schemas.js/mcWhitelistSchema");

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-whitelist-request")
    .setDescription("Request to join the Minecraft whitelist."),
  async execute(interaction) {
    if (timeout.includes(interaction.user.id))
      return await interaction.reply({
        content: `You are on a cooldown! Try again in a few seconds.`,
        ephemeral: true,
      });

    mcWhitelistSchema.findOne(
      { Guild: interaction.guild.id },
      async (err, data) => {
        if (!data) {
          return await interaction.reply({
            content: "The whitelist requests are currently disabled.",
            ephemeral: true,
          });
        }

        if (data) {
          const modal6 = new ModalBuilder()
            .setTitle("Minecraft Whitelist Request form")
            .setCustomId("modal6");

          const uuid1 = new TextInputBuilder()
            .setCustomId("uuid1")
            .setRequired(true)
            .setLabel("What is your Minecraft name or UUID?")
            .setPlaceholder("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
            .setStyle(TextInputStyle.Short);

          const reason6 = new TextInputBuilder()
            .setCustomId("reason6")
            .setRequired(true)
            .setLabel("Why should you get whitelisted?")
            .setPlaceholder(
              "Do the owners know you? Were you whitelisted before? Are you a femboy? Etc."
            )
            .setStyle(TextInputStyle.Paragraph);

          const request6 = new TextInputBuilder()
            .setCustomId("request6")
            .setRequired(true)
            .setLabel("What would you do on the Minecraft server?")
            .setPlaceholder("build cool shit or ... ?")
            .setStyle(TextInputStyle.Paragraph);

          const firstActionRow = new ActionRowBuilder().addComponents(uuid1);
          const secondActionRow = new ActionRowBuilder().addComponents(reason6);
          const thirdActionRow = new ActionRowBuilder().addComponents(request6);

          modal6.addComponents(firstActionRow, secondActionRow, thirdActionRow);

          interaction.showModal(modal6);
        }
      }
    );

    timeout.push(interaction.user.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);
  },
};
