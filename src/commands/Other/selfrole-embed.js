const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("selfrole-embed")
    .setDescription("[Admin] Posts the embeds the for Self-Role channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where to send the embed")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const channel = interaction.options.getChannel("channel");

    const embed1 = new EmbedBuilder()
      .setTitle("**FKZ Self-Roles**")
      .setImage("https://femboy.kz/images/selfrols.png")
      .setColor("#ff00b3");

    const embed12 = new EmbedBuilder()
      .setDescription(
        "> FemboyKZ has a lot of roles to choose from to customize your experience on the server.\n> **Choose your own by reacting to the messages below**:"
      )
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3");

    const embed2 = new EmbedBuilder()
      .setTitle("**Ping Roles**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> These Roles are for if you want to get pinged for events, news or more. <#858419058172887074>"
      )
      .addFields([
        {
          name: "** **",
          value:
            ":speaking_head:  ~  Announcements\n:mailbox_with_mail:  ~  Polls\n:globe_with_meridians:  ~  Events",
        },
      ]);
    const embed3 = new EmbedBuilder()
      .setTitle("**Region Roles**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> Roles for showing off your current region.\n> The amounts on these will help us choose server locations!"
      )
      .addFields([
        {
          name: "** **",
          value:
            ":flag_eu:  ~  Europe\n:flag_us:  ~  North America\n:flag_br:  ~  South America\n:flag_za:  ~  Africa\n:flag_hk:  ~  Asia\n:flag_au:  ~  Oceania",
        },
      ]);
    const embed4 = new EmbedBuilder()
      .setTitle("**Game Roles**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> Roles for showing off what games you play, and to get pinged for anything related to them."
      )
      .addFields([
        {
          name: "** **",
          value:
            "<:whitelist:1147535788960141412>  ~  CS:GO\n<:RatNerdd:1179769834339311626>  ~  CS2\n<:fucker:1147535249312583701>  ~  Apex Legends\n<:raf:1179772433197178900>  ~  Osu!\n:saluting_face:  ~  Minecraft",
        },
      ]);
    const embed5 = new EmbedBuilder()
      .setTitle("**Interest Roles**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription("> Roles for showing off your interests.")
      .addFields([
        {
          name: "** **",
          value:
            "<:cheesd2meetu:1172228027292340234>  ~  Weeb (Anime / Manga)\n<:RAT:986814917183172628>  ~  Music\n<:picljuus:1147537598466764880>  ~  Coding\n:art:  ~  Art",
        },
      ]);
    const embed6 = new EmbedBuilder()
      .setTitle("**Age Roles**")
      .setImage("https://femboy.kz/images/wide.png")
      .setColor("#ff00b3")
      .setDescription(
        "> Roles for showing off which age group you belong in.\n> **`18+ Role will be required to see the NSFW Channels!`**"
      )
      .addFields([
        {
          name: "** **",
          value:
            "<:gremlin:1179774969224372334>  ~  Minor\n<:thisfuckingthing:1152840535086735430>  ~  18+",
        },
      ]);

    await channel.send({
      embeds: [embed1, embed12],
    });
    await channel.send({
      embeds: [embed2],
    });
    await channel.send({
      embeds: [embed3],
    });
    await channel.send({
      embeds: [embed4],
    });
    await channel.send({
      embeds: [embed5],
    });
    await channel.send({
      embeds: [embed6],
    });
    await interaction.reply({
      content: `The embeds have been posted on ${channel}.`,
      ephemeral: true,
    });
  },
};
