const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-all")
    .setDescription("[Admin] Give a role to everyone in the server")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role you want to give everyone")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options, guild } = interaction;
    const role = options.getRole("role");

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        ephemeral: true,
      });

    await interaction.deferReply({ ephemeral: false });

    const members = await guild.members.fetch();
    if (!members)
      return interaction.editReply({
        content: "Could not fetch members, try again later.",
      });

    await interaction.editReply({
      content: `Giving everyone the  ${role.name}  role...`,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * 5);
    });

    let num = 0;
    for (const [_, member] of members) {
      member.roles.add(role.id).catch(() => {
        num--;
      });
      num++;

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setDescription(`${num} members now have the ${role.name} role.`);

      await interaction.editReply({ embeds: [embed] });
    }

    await interaction.editReply({
      conent: "done giving roles :3",
    });
  },
};
