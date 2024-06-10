const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the kick")
        .setRequired(false)
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

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      const notInServerEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Error")
        .setDescription(`User <@${user.id}> is not in the server`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [notInServerEmbed] });
    }

    try {
      await member.kick(`Requested by moderator: ${reason}`);

      const successEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Successfully Kicked")
        .setDescription(`Successfully kicked <@${user.id}> Reason: ${reason}`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Failed to kick user:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setTitle("Error")
        .setDescription(`Failed to kick <@${user.id}>`)
        .setFooter({ text: "FKZ" });

      return await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
