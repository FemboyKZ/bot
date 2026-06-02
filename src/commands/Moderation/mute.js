const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const { requireAdmin } = require("../../utils/permissions.js");
const schema = require("../../schemas/baseSystem.js");
const mutes = require("../../schemas/moderation/mutes.js");
const roles = require("../../schemas/moderation/muteRoles.js");
//var parse = require("parse-duration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to mute")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the mute")
        .setRequired(false),
    ),
  /*.addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration for the mute (format: `1d` = 1 day)")
        .setRequired(false)
    )*/
  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;

    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided.";
    //const duration = interaction.options.getString("duration") || "permanent";
    //const duationMS = parse(duration);

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return await interaction.reply({
        content: `User <@${user.id}> is not in this server.`,
        flags: MessageFlags.Ephemeral,
      });
    }

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
      .setTitle("User Muted")
      .setDescription(
        `**User:** <@${user.id}>\n**Reason:** ${reason}\n**Executor:** <@${interaction.user.id}>`, // **Duration:** ${duration}\n
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
    if (!role) {
      return await interaction.reply({
        content: "Configured mute role no longer exists.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (mute) {
        await interaction.reply({
          content: `User <@${user.id}> is already muted.`,
          flags: MessageFlags.Ephemeral,
        });
        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role);
        }
        return;
      }

      await mutes.create({
        Guild: interaction.guild.id,
        User: user.id,
        Reason: reason,
        Executor: interaction.user.id,
      });
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
      }
      await interaction.reply({
        content: `User <@${user.id}> has been muted.`,
        flags: MessageFlags.Ephemeral,
      });
      if (data && data.Channel) {
        const channel = interaction.guild.channels.cache.get(data.Channel);
        if (channel) await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Failed to mute user:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "Failed to mute user.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
