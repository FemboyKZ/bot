const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles-embed")
    .setDescription("[Admin] Posts the embeds for the Roles-info channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embeds")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });
    const channel = interaction.options.getChannel("channel");

    const embedBanner = new EmbedBuilder()
      .setTitle("**FKZ Roles**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/rolls.png");
    const embedInfo = new EmbedBuilder()
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        "All the roles that affect the members on the Discord server and what they do. (*Excluding self-roles!*)\n\nRoles marked with [*AutoRole*] are the default roles given to members automatically by bots once they have accepted the server rules.\n\nCheck out our self-roles, these are roles which can be removed/added by members themselves below, by reacting to the messages with the predetermined reacts.\n\nSome members have also been granted personal roles which are not listed here, do not ask for one.",
      );
    const embedStaff = new EmbedBuilder()
      .setTitle("**Staff Roles**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "The Owner(s) of the Servers",
          value: "<@&858419058172887071>",
          inline: false,
        },
        {
          name: "Server Administrators",
          value: "<@&858419058172887070>",
          inline: true,
        },
        {
          name: "Server Moderators",
          value: "<@&863118696430829619>",
          inline: true,
        },
        {
          name: "Server Developers",
          value: "<@&869183938957021254>\n** **",
          inline: false,
        },
      ]);
    const embedSupport = new EmbedBuilder()
      .setTitle("**Supporter Roles**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Server Booster",
          value: "<@&858436013622034473>",
          inline: true,
        },
        {
          name: "Has contributed to the servers",
          value: "<@&867784192795475981>\n** **",
          inline: true,
        },
      ]);
    const embedMember = new EmbedBuilder()
      .setTitle("**Member Roles**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Whitelisted members",
          value: "<@&1054403649641656421>",
          inline: true,
        },
        {
          name: "[AutoRole]\nBase role for members",
          value: "<@&858769645846528041>\n** **",
          inline: true,
        },
      ]);
    const embedSpecial = new EmbedBuilder()
      .setTitle("**Special Roles**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Cool people & Friends",
          value: "<@&885132111449829386>",
          inline: true,
        },
        {
          name: "DJ Role for music bots",
          value: "<@&858443305825206283>\n** **",
          inline: true,
        },
      ]);
    const embedOld = new EmbedBuilder()
      .setTitle("**Old & Removed Roles**")
      .setColor("#ff00b3")
      .setImage("https://femboy.kz/images/wide.png")
      .addFields([
        {
          name: "Members that were on the old whitelist(s)",
          value: "<@&858419058135662631>",
          inline: false,
        },
        {
          name: "Purchased VIP+ on Esterata",
          value: "<@&865705318990610432>",
          inline: true,
        },
        {
          name: "Purchased VIP on Esterata",
          value: "<@&865705061723013141>",
          inline: true,
        },
        {
          name: "Was on the FKZ Minecraft whitelist",
          value: "<@&1128976942452969552>",
          inline: false,
        },
      ]);

    await channel.send({
      embeds: [
        embedBanner,
        embedInfo,
        embedStaff,
        embedSupport,
        embedMember,
        embedSpecial,
        embedOld,
      ],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      ephemeral: true,
    });
  },
};
