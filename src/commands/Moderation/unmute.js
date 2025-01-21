const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const schema = require("../../schemas/base-system.js");
const mutes = require("../../schemas/moderation/mute.js");
const roles = require("../../schemas/moderation/mute-role.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unmute")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    const mute = await mutes.findOne({
      Guild: interaction.guild.id,
      User: user.id,
    });

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "audit-logs",
    });

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ" })
      .setTitle("User Unmuted")
      .setDescription(
        `**User:** <@${user.id}>\n**Executor:** <@${interaction.user.id}>`
      );

    const roleId = await roles.findOne({ Guild: interaction.guild.id });
    const role = await interaction.guild.roles.cache.get(roleId.Role);

    try {
      if (!mute) {
        try {
          await interaction.reply({
            content: `User <@${user.id}> is already unmuted.`,
            ephemeral: true,
          });
          if (member.roles.cache.has(role)) {
            await member.roles.remove(role);
          }
          return;
        } catch (error) {
          console.error("Unmute event error:", error);
        }
      } else {
        try {
          await mutes.findOneAndDelete({
            Guild: interaction.guild.id,
            User: user.id,
          });
          if (member.roles.cache.has(role)) {
            await member.roles.remove(role);
          }
          await interaction.reply({
            content: `User <@${user.id}> has been unmuted.`,
            ephemeral: true,
          });
          if (data && data.Channel) {
            const channel = interaction.guild.channels.cache.get(data.Channel);
            await channel.send({ embeds: [embed] });
          }
        } catch (error) {
          console.error("Unmute event error:", error);
        }
      }
    } catch (error) {
      console.error("Failed to unmute user:", error);
      await interaction.reply({
        content: "Failed to unmute user.",
        ephemeral: true,
      });
    }
  },
};
