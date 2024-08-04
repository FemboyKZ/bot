const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-embed")
    .setDescription("[Admin] Posts an embed in your chosen channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the embed is located")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The id of the message where to edit the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("The contents of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("The footer of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The color of the embed (e.g. #ff00b3)")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("Whether the embed should be ephemeral")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("timestamp")
        .setDescription("Whether the embed should have a timestamp")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const channel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message");
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const footer = interaction.options.getString("footer");
    const color = interaction.options.getString("color");
    const timestamp = interaction.options.getBoolean("timestamp");
    const ephemeral = interaction.options.getBoolean("ephemeral");

    try {
      const message = await channel.messages.fetch(messageId);
      if (!channel) {
        await interaction.reply({
          content: "Invalid channel",
          ephemeral: true,
        });
        return;
      }

      if (!message) {
        await interaction.reply({
          content: "Message not found",
          ephemeral: true,
        });
        return;
      }

      if (message.embeds.length === 0) {
        await interaction.reply({
          content: "Message is not an embed",
          ephemeral: true,
        });
        return;
      }

      const embed = message.embeds[0];

      if (title) {
        embed.setTitle(title);
      } else {
        if (!embed.title) {
          embed.setTitle("Untitled");
        }
        embed.setTitle(embed.title);
      }
      if (content) {
        embed.setDescription(content);
      } else {
        if (embed.description.length > 0)
          embed.setDescription(embed.description);
      }
      if (footer) {
        embed.setFooter({ text: footer });
      } else {
        if (embed.footer) embed.setFooter(embed.footer);
      }
      if (color) {
        embed.setColor(color);
      } else {
        if (embed.color) {
          embed.setColor(embed.color);
        } else {
          embed.setColor("#ff00b3");
        }
      }
      if (timestamp) {
        embed.setTimestamp();
      } else {
        if (embed.timestamp) embed.setTimestamp();
      }

      await message.edit({ embeds: [embed] });

      await interaction.reply({
        content: "Embed updated",
        ephemeral,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    }
  },
};
