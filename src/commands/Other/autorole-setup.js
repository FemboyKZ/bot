import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import autorole from "../../Schemas.js/autorole";

const already = new EmbedBuilder()
  .setColor("#ff00b3")
  .setDescription("You already have a autorole setup!");

const noperms = new EmbedBuilder()
  .setColor("#ff00b3")
  .setDescription("You need to have Admin to use this command!");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-setup")
    .setDescription("[Admin] Set the autorole for this Server!")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Role you want to set for the Autorole")
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole("role");

    const set = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`The Autorole has been set to ${role.name}`);

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({ embeds: [noperms], ephemeral: true });

    autorole.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (!data) {
        autorole.create({
          Guild: interaction.guild.id,
          Role: role.id,
        });
        await interaction.reply({ embeds: [set], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [already], ephemeral: true });
        return;
      }
    });
  },
};
