const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-embed")
    .setDescription("[Admin] Posts the embeds the for Welcome channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const channel = interaction.options.getChannel("channel");

    const embedBanner = new EmbedBuilder()
      .setTitle("**Welcome to FemboyKZ! <3**")
      .setImage("https://femboy.kz/images/tehe.png")
      .setColor("#ff00b3");

    const embedInfo = new EmbedBuilder()
      .setTitle("**FemboyKZ Info**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "This is a Discord server for the Femboy KZ CS:GO and CS2 servers. Here you can chat about the game with other members of the server, get <#860283188646248510> for server related issues, and get <#858419058172887074> relating the servers."
      )
      .addFields([
        {
          name: "** **",
          value:
            "We are a small community consisting of mostly CS:GO/CS2 VNL/Movement players. The purpose of this community is to provide players with a place to play and experience VNL in all the possible ways, different tickrates, with autobhop and more!\nAlthough we may dip into other games such as Minecraft whenever theres demand.",
        },
        {
          name: "** **",
          value:
            "Check out our **Website**:\n<https://Femboy.KZ>\nJoin our **Steam Group**:\n<https://steamcommunity.com/groups/FemboyKZ>\nCheck out our **Youtube Channel**:\n<https://www.youtube.com/@FemboyKZ>\nFollow our **Twitter**:\n<https://twitter.com/FemboyKZ>\nCheck out our **Twitch Channel**:\n<https://www.twitch.tv/FemboyKZ>",
        },
      ]);

    const embedRules = new EmbedBuilder()
      .setTitle("**FemboyKZ Rules**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "Not following these rules can result in certain punishments."
      )
      .addFields([
        {
          name: "** **",
          value:
            " **1.** Treat everyone with respect. Absolutely no harassment, witch hunting, sexism, racism or hate speech will be tolerated.",
        },
        {
          name: "** **",
          value:
            " **2.** No spam or self-promotion (server invites, advertisements, etc) without permission from a staff member. This includes DMing fellow members.",
        },
        {
          name: "** **",
          value:
            " **3.** NSFW content is allowed only on specific channels marked as NSFW. Posting actual pornography, gore or vore is not allowed. NSFW content of minors is not allowed to any extent and will result in a permanent ban.\n **3.1** NSFW channels require the <@&1179794850627997706> Role. Lying about your age for this is a punishable offense.",
        },
        {
          name: "** **",
          value: ` **4.** No discussion or posts on sensitive topics, such as politics, war, religion, mental health (selfharm, disorders), sexuality and gender. This includes memes, videos, links, songs and emoji.`,
        },
        {
          name: "** **",
          value: ` **5.** No impersonation or violation of a person's privacy. "Doxing" a fellow member will result in a permanent ban.`,
        },
        {
          name: "** **",
          value:
            " **6.** Do not beg for roles, perks or whitelist. You will be given those if you deserve them.",
        },
        {
          name: "** **",
          value:
            " **7.** Do not evade Server bans or other punishments. If it's found out that you are banned on 1 account and now using another to evade a punishment, your ban will be extended to a *Permanent* ban.",
        },
        {
          name: "** **",
          value:
            " **8.** Keep in mind this is a public server, do not post confidential information or images of others or of yourself.",
        },
        {
          name: "** **",
          value:
            " **9.** Keep discussions and content in their respective channels, and avoid interrupting others.",
        },
        {
          name: "** **",
          value:
            " **10.** No advocating for or encouraging any of the above behavior.",
        },
        {
          name: "** **",
          value:
            "**Follow the Discord Terms of Service. Anything that breaks the TOS also breaks our rules.**\nAll of the rules also apply to the gameservers.\nThese rules are subject to change at any point in time.\nServer staff are not an exception, report anything the staff does personally to me (<@289767921956290580>) via DMs.",
        },
      ]);

    await channel.send({
      embeds: [embedBanner, embedInfo, embedRules],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      ephemeral: true,
    });
  },
};
