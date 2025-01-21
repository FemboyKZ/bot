const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const schema = require("../../schemas/base-system.js");
const mutes = require("../../schemas/moderation/mute.js");
const roles = require("../../schemas/moderation/mute-role.js");
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
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the mute")
        .setRequired(false)
    ),
  /*.addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration for the mute (format: `1d` = 1 day)")
        .setRequired(false)
    )*/
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
    const reason =
      interaction.options.getString("reason") || "No reason provided.";
    //const duration = interaction.options.getString("duration") || "permanent";
    //const duationMS = parse(duration);

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
      .setTitle("User Muted")
      .setDescription(
        `**User:** <@${user.id}>\n**Reason:** ${reason}\n**Duration:** ${duration}\n**Executor:** <@${interaction.user.id}>`
      );

    const roleId = await roles.findOne({ Guild: interaction.guild.id });
    const role = await interaction.guild.roles.cache.get(roleId.Role);

    try {
      if (mute) {
        try {
          await interaction.reply({
            content: `User <@${user.id}> is already muted.`,
            ephemeral: true,
          });
          if (!member.roles.cache.has(role)) {
            await member.roles.add(role);
          }
          return;
        } catch (error) {
          console.error("Mute event error:", error);
        }
      } else {
        try {
          await mutes.create({
            Guild: interaction.guild.id,
            User: user.id,
            Reason: reason,
            Executor: interaction.user.id,
          });
          await interaction.reply({
            content: `User <@${user.id}> has been muted.`,
            ephemeral: true,
          });
          if (!member.roles.cache.has(role)) {
            await member.roles.add(role);
          }
          if (data && data.Channel) {
            const channel = interaction.guild.channels.cache.get(data.Channel);
            await channel.send({ embeds: [embed] });
          }
        } catch (error) {
          console.error("Mute event error:", error);
        }
      }
    } catch (error) {
      console.error("Failed to mute user:", error);
      await interaction.reply({
        content: "Failed to mute user.",
        ephemeral: true,
      });
    }
  },
};
