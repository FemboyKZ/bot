const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages from a specific user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to purge messages from")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Number of messages to search (1-9999)")
        .setMinValue(1)
        .setMaxValue(9999)
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to purge (default: current channel)")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getUser("user");
    const limit = interaction.options.getInteger("limit");
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.editReply(
        "I don't have permission to manage messages in that channel!",
      );
    }

    try {
      let count = 0;
      let lastId = null;
      let collected = 0;

      while (collected < limit) {
        const fetchLimit = Math.min(100, limit - collected);
        const options = { limit: fetchLimit, before: lastId };

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        const userMessages = messages.filter(
          (msg) => msg.author.id === user.id,
        );

        for (const message of userMessages.values()) {
          try {
            if (Date.now() - message.createdTimestamp < 1209600000) {
              await channel.bulkDelete([message], true);
            } else {
              await message.delete();
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            count++;
          } catch (error) {
            console.error(`Failed to delete message ${message.id}:`, error);
          }
        }

        collected += messages.size;
        lastId = messages.last()?.id;

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      await interaction.editReply(
        `Deleted ${count} messages from ${user.tag} in ${channel}`,
      );
    } catch (error) {
      console.error("Purge Error:", error);
      await interaction.editReply("An error occurred while purging messages.");
    }
  },
};
