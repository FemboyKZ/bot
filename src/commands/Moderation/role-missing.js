const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const schema = require("../../schemas/reactionRoles.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-missing")
    .setDescription("[Admin] Backfill reaction roles for members who reacted")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      return await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: `You don't have perms to use this command.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const reactionsData = await schema.find({ Guild: guild.id });
      if (!reactionsData.length) {
        return await interaction.editReply(
          "No reaction roles are configured for this server.",
        );
      }

      // The schema doesn't store a channel, so locate each referenced message
      // by scanning the guild's text channels (cached per message id).
      const textChannels = guild.channels.cache.filter(
        (c) => typeof c.messages?.fetch === "function" && !c.isThread?.(),
      );
      const messageCache = new Map();
      const findMessage = async (messageId) => {
        if (messageCache.has(messageId)) return messageCache.get(messageId);
        for (const ch of textChannels.values()) {
          const msg = await ch.messages.fetch(messageId).catch(() => null);
          if (msg) {
            messageCache.set(messageId, msg);
            return msg;
          }
        }
        messageCache.set(messageId, null);
        return null;
      };

      let added = 0;
      for (const data of reactionsData) {
        const role = guild.roles.cache.get(data.Role);
        if (!role) continue;

        const message = await findMessage(data.Message);
        if (!message) continue;

        // Match the stored emoji key against the message's reactions.
        const reaction = message.reactions.cache.find((r) => {
          const e = r.emoji;
          const key = e.id
            ? `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`
            : e.name;
          return key === data.Emoji;
        });
        if (!reaction) continue;

        const users = await reaction.users.fetch().catch(() => null);
        if (!users) continue;

        for (const user of users.values()) {
          if (user.bot) continue;
          const member = await guild.members.fetch(user.id).catch(() => null);
          if (member && !member.roles.cache.has(role.id)) {
            await member.roles.add(role).catch(() => {});
            added++;
          }
        }
      }

      await interaction.editReply(
        `Backfill complete. Added ${added} missing reaction role(s).`,
      );
    } catch (error) {
      console.error("Error in role-missing:", error);
      await interaction.editReply(
        "An error occurred while executing this command.",
      );
    }
  },
};
