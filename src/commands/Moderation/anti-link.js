const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const schema = require("../../schemas/baseSystem.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti-link")
    .setDescription("[Admin] Setup/Disable the anti-link system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Set up the anti link system")
        .addStringOption((option) =>
          option
            .setName("permissions")
            .setRequired(true)
            .setDescription(
              "Choose the permissions to bypass the anti-link system",
            )
            .addChoices(
              { name: "Manage Channel", value: "ManageChannels" },
              { name: "Manage Server", value: "ManageGuild" },
              { name: "Embed Links", value: "EmbedLinks" },
              { name: "Attach File", value: "AttachFiles" },
              { name: "Manage Messages", value: "ManageMessages" },
              { name: "Administrator", value: "Administrator" },
            ),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the anti-link system"),
    )
    .addSubcommand((command) =>
      command
        .setName("check")
        .setDescription("[Admin] Checks the status of the anti-link system"),
    )
    .addSubcommand((command) =>
      command
        .setName("edit")
        .setDescription("[Admin] Edit the permissions of the anti-link system")
        .addStringOption((option) =>
          option
            .setName("permissions")
            .setRequired(true)
            .setDescription(
              "Choose the permissions to bypass the anti-link system",
            )
            .addChoices(
              { name: "Manage Channel", value: "ManageChannels" },
              { name: "Manage Server", value: "ManageGuild" },
              { name: "Embed Links", value: "EmbedLinks" },
              { name: "Attach File", value: "AttachFiles" },
              { name: "Manage Messages", value: "ManageMessages" },
              { name: "Administrator", value: "Administrator" },
            ),
        ),
    ),

  async execute(interaction) {
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const sub = options.getSubcommand();

    switch (sub) {
      case "setup": {
        const permissions = options.getString("permissions");

        const Data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "anti-link",
        });

        if (Data)
          return await interaction.reply({
            content: "The link system is already setup.",
            ephemeral: true,
          });

        if (!Data) {
          schema.create({
            Guild: interaction.guild.id,
            ID: "anti-link",
            ByPass: permissions,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("#ff00b3")
          .setDescription(
            `The anti-link system has been enabled with the bypass permissions set to ${permissions}.`,
          );

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case "disable": {
        await schema.deleteMany({
          Guild: interaction.guild.id,
          ID: "anti-link",
        });

        const embed2 = new EmbedBuilder()
          .setColor("#ff00b3")
          .setDescription(`The anti-link system has been disabled.`);

        await interaction.reply({ embeds: [embed2] });
        break;
      }

      case "check": {
        const Data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "anti-link",
        });
        if (!Data)
          return await interaction.reply({
            content: "The anti-link system has not been setup.",
            ephemeral: true,
          });

        const permissions = Data.ByPass;
        if (!permissions)
          return await interaction.reply({
            content: "The anti-link system has not been setup.",
            ephemeral: true,
          });
        else
          await interaction.reply({
            content: `The anti-link system is set up. Members with **${permissions}** can bypass it.`,
            ephemeral: true,
          });
        break;
      }

      case "edit": {
        const Data = await schema.findOne({
          Guild: interaction.guild.id,
          ID: "anti-link",
        });
        const permissions = options.getString("permissions");

        if (!Data)
          return await interaction.reply({
            content: "The anti-link system has not been setup.",
            ephemeral: true,
          });
        else {
          await schema.deleteMany({
            Guild: interaction.guild.id,
            ID: "anti-link",
          });

          await schema.create({
            Guild: interaction.guild.id,
            ID: "anti-link",
            ByPass: permissions,
          });

          const embed3 = new EmbedBuilder()
            .setColor("#ff00b3")
            .setDescription(
              `The anti-link system bypass permissions have been set to ${permissions}.`,
            );

          await interaction.reply({ embeds: [embed3] });
        }
        break;
      }
    }
  },
};
