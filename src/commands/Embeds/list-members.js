const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const https = require("https");
const { parseStringPromise } = require("xml2js");
const fs = require("fs");
const path = require("path");
const os = require("os");
const wait = require("timers/promises").setTimeout;

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
    const rawFileName = interaction.options.getString("file-name") || "members";
    const sanitizedName = rawFileName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const tmpFile = path.join(
      os.tmpdir(),
      `${sanitizedName}-${Date.now()}.txt`,
    );

    try {
      const encodedGroup = encodeURIComponent(groupUrl);
      const stdout = await new Promise((resolve, reject) => {
        const url = `https://steamcommunity.com/groups/${encodedGroup}/memberslistxml/?xml=1`;
        https
          .get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
          })
          .on("error", reject);
      });

      const data = await parseStringPromise(stdout);
      const memberIds = data.memberList.members.map(
        (member) => member.steamID64,
      );

      await fs.promises.writeFile(tmpFile, memberIds.join("\n"));

      const embed = new EmbedBuilder()
        .setTitle(`Members of ${groupUrl}`)
        .setFooter({ text: "FKZ" })
        .setTimestamp()
        .setColor("#ff00b3");

      if (!channel) {
        await interaction.reply({
          embeds: [embed],
          files: [tmpFile],
        });
      } else {
        await channel.send({ embeds: [embed], files: [tmpFile] });
        await interaction.reply({
          content: `The list has been posted on ${channel}.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await wait(3000);
      await fs.promises.unlink(tmpFile).catch((err) => console.error(err));
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
