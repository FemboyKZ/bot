const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-message")
    .setDescription("[Admin] Edit a message sent by the FKZ bot")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("ID of the message to edit")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel where the message is located")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("New text content (set empty to remove)")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("embeds")
        .setDescription("JSON array of embeds (use [] to remove)")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    }

    const message = interaction.options.getString("message");
    const channel =
      interaction.options.getChannel("channel") ||
      message?.channel ||
      interaction.channel;
    const content = interaction.options.getString("content");
    const embeds = interaction.options.getString("embeds");

    try {
      const target = await channel.messages.fetch(message);

      if (target.author.id !== interaction.client.user.id) {
        return await interaction.reply(
          "The specified message is not owned by FKZ bot.",
        );
      }

      const payload = {};

      if (content !== null) {
        payload.content = content === "" ? null : content;
      }

      if (embeds !== null) {
        try {
          const parsed = JSON.parse(embeds);

          if (!Array.isArray(parsed)) {
            throw new Error("Embeds must be a JSON array");
          }

          payload.embeds = parsed.map((embed) => new EmbedBuilder(embed));
        } catch (error) {
          return await interaction.reply({
            content: `Embed error: ${error.message}`,
            ephemeral: true,
          });
        }
      }

      if (!Object.keys(payload).length) {
        return await interaction.reply({
          content: "No changes specified!",
          ephemeral: true,
        });
      }

      await target.edit(payload);
      return await interaction.reply({
        content: `Message updated successfully! [Jump to Message](${target.url})`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return await interaction.reply(`Error: ${error.message}`);
    }
  },
};
