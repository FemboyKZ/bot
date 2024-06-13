const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const reaction = require("../../Schemas/reactionrs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reaction-roles")
    .setDescription("[Admin] Setup the reaction roles")
    .addSubcommand((command) =>
      command
        .setName("add")
        .setDescription("Add a reaction role to a message")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("The message to react to")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("Select the emoji to react with")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Select the role for this emoji")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("remove")
        .setDescription("Remove a reaction role from a message")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("The message to remove the react from")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("Select the emoji to unreact with")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const { options, guild, channel } = interaction;
    const sub = options.getSubcommand();
    const emoji = options.getString("emoji");

    let e;
    const message = await channel.messages
      .fetch(options.getString("message-id"))
      .catch((err) => {
        e = err;
      });
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    if (e)
      return await interaction.reply({
        content: `Be sure to get a message from ${channel}`,
        ephemeral: true,
      });

    const data = await reaction.findOne({
      Guild: guild.id,
      Message: message.id,
      Emoji: emoji,
    });

    switch (sub) {
      case "add":
        if (data) {
          return await interaction.reply({
            content: `You already have this reaction setup, using ${emoji}, on this message.`,
            ephemeral: true,
          });
        } else {
          const role = options.getRole("role");
          await reaction.create({
            Guild: guild.id,
            Message: message.id,
            Emoji: emoji,
            Role: role.id,
          });

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription(
              `A Reaction role has been added to ${message.url} with ${emoji} and the role ${role}`
            );

          await message.react(emoji).catch((err) => {});
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        break;
      case "remove":
        if (!data) {
          return await interaction.reply({
            content: `That reaction role doesn't exist`,
            ephemeral: true,
          });
        } else {
          await reaction.deleteMany({
            Guild: guild.id,
            Message: message.id,
            Emoji: emoji,
          });

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription(
              `A Reaction role has been removed from ${message.url} with ${emoji}`
            );

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
  },
};
