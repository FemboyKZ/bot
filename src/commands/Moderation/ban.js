const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Error")
        .setDescription(
          "You do not have the required permissions to use this command"
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
      if (bans.has(user.id)) {
        const alreadyBannedEmbed = new EmbedBuilder()
          .setColor("#ff00b3")
          .setTimestamp()
          .setTitle("Error")
          .setDescription(`User <@${user.id}> is already banned`)
          .setFooter({ text: "FKZ" });

        return await interaction.reply({ embeds: [alreadyBannedEmbed] });
      }

      await interaction.guild.bans.create(user, {
        reason: `Requested by moderator: ${reason}`,
      });

      const successEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Successfully Banned")
        .setDescription(`Successfully banned <@${user.id}> Reason: ${reason}`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Failed to ban user:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Error")
        .setDescription(`Failed to ban <@${user.id}>`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
