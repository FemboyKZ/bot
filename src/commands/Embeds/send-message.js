const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send-message")
    .setDescription("[Admin] Send a message sent by the FKZ bot")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send the message ")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("Text content of the message")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("embeds")
        .setDescription("JSON array of embeds")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channel =
      interaction.options.getChannel("channel") || interaction.channel;
    const content = interaction.options.getString("content");
    const embeds = interaction.options.getString("embeds");

    try {
      if (!channel) {
        return await interaction.reply({
          content: "Please provide a channel.",
          flags: MessageFlags.Ephemeral,
        });
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
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      if (!Object.keys(payload).length) {
        return await interaction.reply({
          content: "Cannot send an empty message.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await channel.send(payload);
      return await interaction.reply({
        content: `Message sent successfully! [View message in channel](${channel.url})`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      return await interaction.reply({
        content: `Error: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
