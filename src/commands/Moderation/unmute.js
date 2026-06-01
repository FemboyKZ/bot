const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const schema = require("../../schemas/baseSystem.js");
const mutes = require("../../schemas/moderation/mutes.js");
const roles = require("../../schemas/moderation/muteRoles.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unmute")
        .setRequired(true),
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        flags: MessageFlags.Ephemeral,
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
        `**User:** <@${user.id}>\n**Executor:** <@${interaction.user.id}>`,
      );

    const roleId = await roles.findOne({ Guild: interaction.guild.id });
    if (!roleId) {
      return await interaction.reply({
        content:
          "No mute role configured. Set one with `/set-mute-role` first.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const role = interaction.guild.roles.cache.get(roleId.Role);

    try {
      if (!mute) {
        await interaction.reply({
          content: `User <@${user.id}> is already unmuted.`,
          flags: MessageFlags.Ephemeral,
        });
        if (role && member && member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
        }
        return;
      }

      await mutes.findOneAndDelete({
        Guild: interaction.guild.id,
        User: user.id,
      });
      if (role && member && member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
      }
      await interaction.reply({
        content: `User <@${user.id}> has been unmuted.`,
        flags: MessageFlags.Ephemeral,
      });
      if (data && data.Channel) {
        const channel = interaction.guild.channels.cache.get(data.Channel);
        if (channel) await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Failed to unmute user:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "Failed to unmute user.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
