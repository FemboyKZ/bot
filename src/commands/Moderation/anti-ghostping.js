const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const schema = require("../../Schemas/moderation/ghostping.js");
const count = require("../../Schemas/moderation/ghostnum.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti-ghostping")
    .setDescription("[Admin] Setup the anti-ghostping system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Set up the anti-ghostping system")
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the anti-ghostping system")
    )
    .addSubcommand((command) =>
      command
        .setName("number-reset")
        .setDescription("[Admin] Reset a users ghost ping count")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to reset the ghostpings of")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { options } = interaction;

    const sub = options.getSubcommand();

    const Data = await schema.findOne({ Guild: interaction.guild.id });

    switch (sub) {
      case "setup":
        if (Data)
          return await interaction.reply({
            content: "The anti-ghostping system is already set up.",
            ephemeral: true,
          });
        else {
          await schema.create({
            Guild: interaction.guild.id,
          });

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription("The anti-ghostping system has been set up.");

          await interaction.reply({ embeds: [embed] });
        }
        break;

      case "disable":
        if (!Data)
          return await interaction.reply({
            content: "The anti-ghostping system has not yet been set up.",
            ephemeral: true,
          });
        else {
          await schema.deleteMany({
            Guild: interaction.guild.id,
          });

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription("The anti-ghostping system has been disabled.");

          await interaction.reply({ embeds: [embed] });
        }
        break;

      case "number-reset":
        const member = options.getUser("user");
        const data = await count.findOne({
          Guild: interaction.guild.id,
          User: member.id,
        });

        if (!Data)
          return await interaction.reply({
            content: "This member does not have any past ghostpings",
            ephemeral: true,
          });
        else {
          await data.deleteOne({
            User: member.id,
          });

          await interaction.reply({
            content: `${member}'s ghostping count has been reset.`,
          });
        }
    }
  },
};
