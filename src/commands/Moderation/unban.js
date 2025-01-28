const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unban")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the unban")
        .setRequired(false),
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Error")
        .setDescription(
          "You do not have the required permissions to use this command",
        )
        .setFooter({ text: "FKZ" });

      return await interaction.reply({
        embeds: [noPermissionEmbed],
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    try {
      const bans = await interaction.guild.bans.fetch();
      if (!bans.has(user.id)) {
        const notBannedEmbed = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTimestamp()
          .setTitle("Error")
          .setDescription(`User <@${user.id}> is not currently banned`)
          .setFooter({ text: "FKZ" });

        return await interaction.reply({ embeds: [notBannedEmbed] });
      }

      await interaction.guild.bans.remove(user, {
        reason: `Requested by moderator: ${reason}`,
      });

      const successEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Successfully Unbanned")
        .setDescription(`Successfully unbanned <@${user.id}> Reason: ${reason}`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Failed to unban user:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Error")
        .setDescription(`Failed to unban <@${user.id}>`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
