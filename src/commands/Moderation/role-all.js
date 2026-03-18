const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-all")
    .setDescription("[Admin] Give a role to everyone in the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role you want to give everyone")
        .setRequired(true),
    ),
  async execute(interaction) {
    const { options, guild } = interaction;
    const role = options.getRole("role");

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        flags: MessageFlags.Ephemeral,
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
    const BATCH_SIZE = 10;
    const memberArray = Array.from(members.values());
    for (let i = 0; i < memberArray.length; i += BATCH_SIZE) {
      const batch = memberArray.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((member) => member.roles.add(role.id)),
      );
      num += results.filter((r) => r.status === "fulfilled").length;

      const embed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setDescription(`${num} members now have the ${role.name} role.`);

      await interaction.editReply({ embeds: [embed] });
    }

    await interaction.editReply({
      content: "done giving roles :3",
    });
  },
};
