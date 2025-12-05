const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const { exec } = require("child_process");
const { parseStringPromise } = require("xml2js");
const fs = require("fs");
const wait = require("timers/promises").setTimeout;
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-members")
    .setDescription(
      "[Admin] Posts a TXT file with all members of a selected Steam Group",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("group-url")
        .setDescription("The URL of the Steam Group")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("file-name")
        .setDescription("The name of the TXT file")
        .setRequired(false),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channel = interaction.options.getChannel("channel");
    const groupUrl = interaction.options.getString("group-url");
    const fileName = interaction.options.getString("file-name") || "members";

    try {
      const { stdout, stderr } = await new Promise((resolve, reject) => {
        exec(
          `curl https://steamcommunity.com/groups/${groupUrl}/memberslistxml/?xml=1`,
          (error, stdout, stderr) => {
            if (error) reject(error);
            if (stderr) reject(stderr);
            resolve({ stdout, stderr });
          },
        );
      });

      const data = await parseStringPromise(stdout);
      const memberIds = data.memberList.members.map(
        (member) => member.steamID64,
      );

      await fs.promises.writeFile(`${fileName}.txt`, memberIds.join("\n"));

      const embed = new EmbedBuilder()
        .setTitle(`Members of ${groupUrl}`)
        .setFooter({ text: "FKZ" })
        .setTimestamp()
        .setColor("#ff00b3");

      if (!channel) {
        await interaction.reply({
          embeds: [embed],
          files: [`${fileName}.txt`],
        });
      } else {
        await channel.send({ embeds: [embed], files: [`${fileName}.txt`] });
        await interaction.reply({
          content: `The list has been posted on ${channel}.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await wait(3000);
      fs.unlink(`${fileName}.txt`, (err) => {
        if (err) console.error(err);
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
