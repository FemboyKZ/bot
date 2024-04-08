const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
  MessageManager,
  Embed,
  Collection,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  StringSelectMenuBuilder,
  MessageType,
  AutoModerationRule,
} = require(`discord.js`);
const fs = require("fs");
const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

require("dotenv").config();

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

// anticrash
const process = require("node:process");

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.token);
})();

// schemas
const whitelistSchema = require("./Schemas.js/whitelistSchema");
const unbanSchema = require("./Schemas.js/unbanSchema");
const reportSchema = require("./Schemas.js/reportSchema");
const ticketSchema = require("./Schemas.js/ticketSchema");
const linkSchema = require("./Schemas.js/linkSchema");
const inviteSchema = require("./Schemas.js/inviteSchema");
const ghostSchema = require("./Schemas.js/ghostpingSchema");
const numSchema = require("./Schemas.js/ghostnumSchema");
const mcWhitelistSchema = require("./Schemas.js/mcWhitelistSchema");
const welcomeschema = require("./Schemas.js/welcome");
const reactions = require("./Schemas.js/reactionrs");
const autorole = require("./Schemas.js/autorole");

// ticket systems modal create
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) return;
  if (interaction.isChatInputCommand()) return;

  const modal4 = new ModalBuilder()
    .setTitle("Provide us with more information")
    .setCustomId("modal4");

  const topic4 = new TextInputBuilder()
    .setCustomId("topic4")
    .setRequired(true)
    .setLabel("What is the topic of your ticket?")
    .setPlaceholder("Server connection issue? Server crashed. Etc.")
    .setStyle(TextInputStyle.Short);

  const info4 = new TextInputBuilder()
    .setCustomId("info4")
    .setRequired(true)
    .setLabel("Specify the issue, in detail.")
    .setPlaceholder(
      "Error messages? What happened? What have you tried already to fix it? Etc."
    )
    .setStyle(TextInputStyle.Paragraph);

  const additional4 = new TextInputBuilder()
    .setCustomId("additional4")
    .setRequired(true)
    .setLabel("Anything to add? Links/Clips/Screenshots/etc.")
    .setPlaceholder("Links to Clips/Screenshots. Server IP/Name.")
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder().addComponents(topic4);
  const secondActionRow = new ActionRowBuilder().addComponents(info4);
  const thirdActionRow = new ActionRowBuilder().addComponents(additional4);

  modal4.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  let choices;
  if (interaction.isStringSelectMenu()) {
    choices = interaction.values;

    const result = choices.join("");

    ticketSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      const filter = { Guild: interaction.guild.id };
      const update = { Ticket: result };

      ticketSchema
        .updateOne(filter, update, {
          new: true,
        })
        .then((value) => {
          console.log(value);
        });
    });

    if (!interaction.isModalSubmit()) {
      interaction.showModal(modal4);
    }
  }
});

// ticket creation
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "modal4") {
      ticketSchema.findOne(
        { Guild: interaction.guild.id },
        async (err, data) => {
          const topicInput = interaction.fields.getTextInputValue("topic4");
          const infoInput = interaction.fields.getTextInputValue("info4");
          const additionalInput =
            interaction.fields.getTextInputValue("additional4");

          const posChannel = await interaction.guild.channels.cache.find(
            (c) => c.name === `ticket-${interaction.user.id}`
          );
          if (posChannel)
            return await interaction.reply({
              content: `You already have an open ticket - ${posChannel}`,
              ephemeral: true,
            });

          const category = data.Channel;

          const embed = new EmbedBuilder()
            .setColor("#ff00b3")
            .setTitle(`${interaction.user.username}'s Ticket`)
            .setDescription(
              `Thank you for opening a ticket. Please wait while the staff reviews your information. We will respond to you shortly.`
            )
            .addFields([
              {
                name: `Topic`,
                value: `${topicInput}`,
                inline: false,
              },
              {
                name: `Info`,
                value: `${infoInput}`,
                inline: false,
              },
              {
                name: `Additional Info`,
                value: `${additionalInput}`,
                inline: false,
              },
              {
                name: `Type`,
                value: `${data.Ticket}`,
                inline: false,
              },
            ])
            .setFooter({ text: `${interaction.guild.name} Tickets` })
            .setTimestamp()
            .setImage("https://femboy.kz/images/wide.png");

          const buttonClose = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("ticket-close")
              .setLabel("Close ticket")
              .setStyle(ButtonStyle.Danger)
          );

          let channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.id}`,
            type: ChannelType.GuildText,
            parent: `${category}`,
          });

          let msg = await channel.send({
            embeds: [embed],
            components: [buttonClose],
          });
          await interaction.reply({
            content: `You have opened a ticket: ${channel}`,
            ephemeral: true,
          });

          const member = interaction.user.id;
          await channel.permissionOverwrites.edit(member, {
            SendMessages: true,
            ViewChannel: true,
          });

          const collector = msg.createMessageComponentCollector();

          collector.on("collect", async (i) => {
            if (
              !i.member.permissions.has(PermissionsBitField.Flags.Administrator)
            )
              return await interaction.reply({
                content: "You don't have perms to use this command.",
                ephemeral: true,
              });

            await channel.delete();
          });
        }
      );
    }
  }
});

// whitelist request command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "modal6") {
    const uuid = interaction.fields.getTextInputValue("uuid1");
    const reason = interaction.fields.getTextInputValue("reason6");
    const request = interaction.fields.getTextInputValue("request6");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const server = interaction.guild.name;
    const serverId = interaction.guild.id;

    const embed8 = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Whitelist Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${server} (${serverId})`
      )
      .addFields({
        name: "Name / UUID",
        value: `${uuid}`,
        inline: false,
      })
      .addFields({
        name: "Reasoning for whitelist",
        value: `${reason}`,
        inline: false,
      })
      .addFields({
        name: "What they want to do on the server",
        value: `${request}`,
        inline: false,
      })
      .setTimestamp();

    mcWhitelistSchema.findOne(
      { Guild: interaction.guild.id },
      async (err, data) => {
        if (!data) return;

        if (data) {
          const channelID = data.Channel;
          const channel = interaction.guild.channels.cache.get(channelID);

          channel.send({ embeds: [embed8] });

          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
        }
      }
    );
  }

  if (interaction.customId === "modal1") {
    const steam = interaction.fields.getTextInputValue("steam1");
    const reason = interaction.fields.getTextInputValue("reason1");
    const request = interaction.fields.getTextInputValue("request1");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const server = interaction.guild.name;
    const serverId = interaction.guild.id;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Whitelist Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${server} (${serverId})`
      )
      .addFields({
        name: "SteamID / Profile URL",
        value: `${steam}`,
        inline: false,
      })
      .addFields({
        name: "Reasoning for whitelist",
        value: `${reason}`,
        inline: false,
      })
      .addFields({
        name: "Requested to Group? Yes/No",
        value: `${request}`,
        inline: false,
      })
      .setTimestamp();

    whitelistSchema.findOne(
      { Guild: interaction.guild.id },
      async (err, data) => {
        if (!data) return;

        if (data) {
          const channelID = data.Channel;
          const channel = interaction.guild.channels.cache.get(channelID);

          channel.send({ embeds: [embed] });

          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
        }
      }
    );
  }

  // unban request command
  if (interaction.customId === "modal2") {
    const steam = interaction.fields.getTextInputValue("steam2");
    const reason = interaction.fields.getTextInputValue("reason2");
    const csServer = interaction.fields.getTextInputValue("server2");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const server = interaction.guild.name;
    const serverId = interaction.guild.id;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Unban Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${server} (${serverId})`
      )
      .addFields({
        name: "SteamID / Profile URL",
        value: `${steam}`,
        inline: false,
      })
      .addFields({
        name: "Reasoning for unban",
        value: `${reason}`,
        inline: false,
      })
      .addFields({
        name: "Server IP/Name",
        value: `${csServer}`,
        inline: false,
      })
      .setTimestamp();

    unbanSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (!data) return;

      if (data) {
        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embed] });

        await interaction.reply({
          content: "Your request has been submitted.",
          ephemeral: true,
        });
      }
    });
  }

  // report/suggestion command
  if (interaction.customId === "modal3") {
    const issue = interaction.fields.getTextInputValue("issue3");
    const info = interaction.fields.getTextInputValue("info3");
    const more = interaction.fields.getTextInputValue("more3");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const server = interaction.guild.name;
    const serverId = interaction.guild.id;

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("New Report/Suggestion Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${server} (${serverId})`
      )
      .addFields({
        name: "Reported issue / Suggestion",
        value: `${issue}`,
        inline: false,
      })
      .addFields({
        name: "Issue/Suggestion in detail",
        value: `${info}`,
        inline: false,
      })
      .addFields({
        name: "More info, such as links.",
        value: `${more}`,
        inline: false,
      })
      .setTimestamp();

    reportSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (!data) return;

      if (data) {
        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embed] });

        await interaction.reply({
          content: "Your report/suggestion has been submitted.",
          ephemeral: true,
        });
      }
    });
  }
});

// antilink system
client.on(Events.MessageCreate, async (message) => {
  if (
    message.content.startsWith("http") ||
    message.content.startsWith("discord.gg") ||
    message.content.includes("https://") ||
    message.content.includes("http://") ||
    message.content.includes("discord.gg/")
  ) {
    const Data = await linkSchema.findOne({ Guild: message.guild.id });

    if (!Data) return;

    const memberPerms = Data.Perms;
    const user = message.author;
    const member = message.guild.members.cache.get(user.id);

    if (member.permissions.has(memberPerms)) return;
    else {
      await (
        await message.channel.send({
          conent: `${message.author}, you can't send links here!`,
        })
      ).then((msg) => {
        setTimeout(() => msg.delete(), 3000);
      });
      (await message).delete();
    }
  }
});

// invite logger
const invites = new Collection();
const wait = require("timers/promises").setTimeout;

client.on("ready", async () => {
  await wait(2000);

  client.guilds.cache.forEach(async (guild) => {
    const clientMember = guild.members.cache.get(client.user.id);

    if (!clientMember.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return;

    const firstInvites = await guild.invites.fetch().catch((err) => {
      console.log(err);
    });

    invites.set(
      guild.id,
      new Collection(firstInvites.map((invite) => [invite.code, invite.uses]))
    );
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  const Data = await inviteSchema.findOne({ Guild: member.guild.id });
  if (!Data) return;

  const channelID = Data.Channel;
  const channel = await member.guild.channels.cache.get(channelID);

  const newInvites = await member.guild.invites.fetch();
  const oldInvites = invites.get(member.guild.id);

  const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));

  const embed1 = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTitle(`${member.user.tag} Has Joined the Server!`)
    .setDescription(
      `${member.user.tag} joined the server using an unknown invite. This could mean they used a vanity invite link if the server has one.`
    )
    .setImage("https://femboy.kz/images/wide.png")
    .setTimestamp();

  if (!invite) return await channel.send({ embeds: [embed1] });

  const inviter = await client.users.fetch(invite.inviter.id);

  const embed2 = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTitle(`${member.user.tag} Has Joined the Server!`)
    .setDescription(
      `${member.user.tag} Joined the server using the invite: ${invite.code} Which was created by: ${inviter.tag}.\nThe invite has been used ${invite.uses} times since it was created.`
    )
    .setImage("https://femboy.kz/images/wide.png")
    .setTimestamp();

  const embed3 = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTitle(`${member.user.tag} Has Joined the Server!`)
    .setDescription(
      `${member} Joined the server, but the invite used cannot be found. `
    )
    .setImage("https://femboy.kz/images/wide.png")
    .setTimestamp();

  inviter
    ? channel.send({ embeds: [embed2] })
    : channel.send({ embeds: [embed3] });
});

// Leave Message //

client.on(Events.GuildMemberRemove, async (member, err) => {
  const leavedata = await welcomeschema.findOne({ Guild: member.guild.id });

  if (!leavedata) return;
  else {
    const channelID = leavedata.Channel;
    const channelwelcome = member.guild.channels.cache.get(channelID);

    const embedleave = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle(`${member.user.username} has left`)
      .setDescription(`> ${member} has left the Server`)
      .setTimestamp()
      .setAuthor({ name: `Member Left` });

    const welmsg = await channelwelcome
      .send({ embeds: [embedleave] })
      .catch(err);
  }
});

// Welcome Message //

client.on(Events.GuildMemberAdd, async (member, err) => {
  const welcomedata = await welcomeschema.findOne({ Guild: member.guild.id });

  if (!welcomedata) return;
  else {
    const channelID = welcomedata.Channel;
    const channelwelcome = member.guild.channels.cache.get(channelID);
  }
});

// interaction logger
// doesn't have an enable/disable command and only runs on fkz server cuz lazy lol
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction) return;
  if (!interaction.isChatInputCommand()) return;
  else {
    const channel = await client.channels.cache.get(
      `${process.env.logschatID}`
    );
    const server = interaction.guild.name;
    const serverID = interaction.guild.id;
    const user = interaction.user.username;
    const userID = interaction.user.id;
    const iChannel = interaction.channel.name;
    const iChannelID = interaction.channel.id;

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("Chat Command Executed.")
      .setTimestamp()
      .addFields([
        {
          name: "Server / ServerID",
          value: `${server} / ${serverID}`,
        },
        {
          name: "Channel / ChannelID",
          value: `${iChannel} / ${iChannelID}`,
        },
        {
          name: "User / UserID",
          value: `${user} / ${userID}`,
        },
        {
          name: "Command & User Input",
          value: `${interaction}`,
        },
      ]);

    await channel.send({ embeds: [embed] });
  }
});

// bot join/leave logger, useless feature
// doesn't have an enable/disable command and only runs on fkz server cuz lazy lol
client.on(Events.GuildCreate, async (guild) => {
  const channel = await client.channels.cache.get(`${process.env.logschatID}`);
  const name = guild.name;
  const serverID = guild.id;
  const memberCount = guild.memberCount;

  const ownerID = guild.ownerId;
  const owner = await client.users.cache.get(ownerID);
  const ownerName = owner.username;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("FKZ Bot has joined a new server.")
    .addFields([
      {
        name: "Server",
        value: `> ${name} / ${serverID}`,
      },
      {
        name: "Server Membercount",
        value: `> ${memberCount}`,
      },
      {
        name: "Server Owner",
        value: `> ${ownerName} / ${ownerID}`,
      },
      {
        name: "Server Age",
        value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
      },
    ])
    .setTimestamp()
    .setFooter({ text: "Guild Join" });
  await channel.send({ embeds: [embed] });
});
client.on(Events.GuildDelete, async (guild) => {
  const channel = await client.channels.cache.get(`${process.env.logchatID}`);
  const name = guild.name;
  const serverID = guild.id;
  const memberCount = guild.memberCount;

  const ownerID = guild.ownerId;
  const owner = await client.users.cache.get(ownerID);
  const ownerName = owner.username;

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("FKZ Bot has left a server.")
    .addFields([
      {
        name: "Server",
        value: `> ${name} / ${serverID}`,
      },
      {
        name: "Server Membercount",
        value: `> ${memberCount}`,
      },
      {
        name: "Server Owner",
        value: `> ${ownerName} / ${ownerID}`,
      },
      {
        name: "Server Age",
        value: `> <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
      },
    ])
    .setTimestamp()
    .setFooter({ text: "Guild Leave" });
  await channel.send({ embeds: [embed] });
});

// AUDIT LOG //
const Audit_Log = require("./Schemas.js/auditlog");
client.on(Events.GuildBanAdd, async (guild, user) => {
  const data = await Audit_Log.findOne({
    Guild: guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const banInfo = await guild.fetchBan(user);
  if (!banInfo) return;

  const { reason, executor } = banInfo;
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Ban Added")
    .addFields(
      { name: "Banned Member:", value: user.tag, inline: false },
      { name: "Executor:", value: executor.tag, inline: false },
      { name: "Reason:", reason }
    );

  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildBanRemove, async (user) => {
  const data = await Audit_Log.findOne({
    Guild: user.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Ban Removed")
    .addFields({ name: "Member:", value: `${user}` });
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ChannelCreate, async (channel) => {
  const data = await Audit_Log.findOne({
    Guild: channel.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Channel Created")
    .addFields(
      { name: "Channel Name:", value: channel.name, inline: false },
      { name: "Channel ID:", value: channel.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ChannelDelete, async (channel) => {
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const data = await Audit_Log.findOne({
    Guild: channel.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Channel Deleted")
    .addFields(
      { name: "Channel Name:", value: channel.name, inline: false },
      { name: "Channel ID:", value: channel.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const data = await Audit_Log.findOne({
    Guild: oldChannel.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }

  const auditChannel = client.channels.cache.get(logID);
  const changes = [];

  if (oldChannel.name !== newChannel.name) {
    changes.push(`Name: \`${oldChannel.name}\` → \`${newChannel.name}\``);
  }

  if (oldChannel.topic !== newChannel.topic) {
    changes.push(
      `Topic: \`${oldChannel.topic || "None"}\` → \`${
        newChannel.topic || "None"
      }\``
    );
  }

  if (changes.length === 0) return;

  const changesText = changes.join("\n");

  auditEmbed
    .setTitle("Channel Updated")
    .addFields({ name: "Changes:", value: changesText });
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildRoleCreate, async (role) => {
  const data = await Audit_Log.findOne({
    Guild: role.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Role Created")
    .addFields(
      { name: "Role Name:", value: role.name, inline: false },
      { name: "Role ID:", value: role.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildRoleDelete, async (role) => {
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const data = await Audit_Log.findOne({
    Guild: role.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Role Deleted")
    .addFields(
      { name: "Role Name:", value: role.name, inline: false },
      { name: "Role ID:", value: role.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.MessageDelete, async (message) => {
  const data = await Audit_Log.findOne({
    Guild: message.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  try {
    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" });

    const auditChannel = client.channels.cache.get(logID);

    auditEmbed
      .setTitle("Message Deleted")
      .addFields(
        { name: "Author:", value: `${message.author}`, inline: false },
        { name: "Message:", value: `${message.content}`, inline: false },
        { name: "Message ID:", value: `${message.id}` }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (err) {
    return;
  }
});
client.on(Events.AutoModerationRuleCreate, async (autoModerationRule) => {
  const data = await Audit_Log.findOne({
    Guild: autoModerationRule.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed.setTitle("Automod Rule Created").addFields(
    {
      name: "Rulecreator:",
      value: `<@${autoModerationRule.creatorId}>`,
      inline: false,
    },
    { name: "Rulename:", value: autoModerationRule.name },
    {
      name: "Actions:",
      value: `${autoModerationRule.actions}`,
      inline: false,
    }
  );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.AutoModerationRuleDelete, async (autoModerationRule) => {
  const data = await Audit_Log.findOne({
    Guild: autoModerationRule.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });

  const auditChannel = client.channels.cache.get(logID);

  auditEmbed.setTitle("Automod Rule Deleted").addFields(
    {
      name: "Rulecreator:",
      value: `<@${autoModerationRule.creatorId}>`,
      inline: false,
    },
    { name: "Rulename:", value: autoModerationRule.name, inline: false },
    {
      name: "Actions:",
      value: `${autoModerationRule.actions}`,
      inline: false,
    }
  );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(
  Events.AutoModerationRuleUpdate,
  // 1st param is "param or null" and reads null ????
  async (oldAutoModerationRule, newAutoModerationRule) => {
    const data = await Audit_Log.findOne({
      Guild: newAutoModerationRule.guild.id,
    });
    let logID;
    if (data) {
      logID = data.Channel;
    } else {
      return;
    }

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" });

    const auditChannel = client.channels.cache.get(logID);

    auditEmbed.setTitle("Automod Rule Updated").addFields(
      {
        name: "New Rulename:",
        value: `${newAutoModerationRule.name}`,
        inline: false,
      },
      {
        name: "New Actions:",
        // value: `${newAutoModerationRule.actions}`,
        value: `this doesn't work lol, fix it dumbass`,
        inline: false,
      }
    );
    await auditChannel.send({ embeds: [auditEmbed] });
  }
);
client.on(
  Events.AutoModerationRuleUpdate,
  // 1st param is "param or null" and reads null ????
  async (newAutoModerationRule, oldAutoModerationRule) => {
    const data = await Audit_Log.findOne({
      Guild: oldAutoModerationRule.guild.id,
    });
    let logID;
    if (data) {
      logID = data.Channel;
    } else {
      return;
    }

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" });

    const auditChannel = client.channels.cache.get(logID);

    auditEmbed.setTitle("Automod Rule Updated").addFields(
      {
        name: "Old Rulename:",
        value: `${oldAutoModerationRule.name}`,
        inline: false,
      },
      {
        name: "Old Actions:",
        // value: `${oldAutoModerationRule.actions}`,
        value: `this doesn't work lol, fix it dumbass`,
        inline: false,
      }
    );
    await auditChannel.send({ embeds: [auditEmbed] });
  }
);
client.on(Events.ThreadCreate, async (thread) => {
  const data = await Audit_Log.findOne({
    Guild: thread.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });
  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Thread Created")
    .addFields(
      { name: "Name:", value: thread.name, inline: false },
      { name: "Tag:", value: `<#${thread.id}>`, inline: false },
      { name: "ID:", value: thread.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ThreadDelete, async (thread) => {
  const data = await Audit_Log.findOne({
    Guild: thread.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" });
  const auditChannel = client.channels.cache.get(logID);

  auditEmbed
    .setTitle("Thread Deleted")
    .addFields(
      { name: "Name:", value: thread.name, inline: false },
      { name: "Tag:", value: `<#${thread.id}>`, inline: false },
      { name: "ID:", value: thread.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

// AUTOROLE //

client.on(Events.GuildMemberAdd, async (member) => {
  const data = await autorole.findOne({ Guild: member.guild.id });
  const rol = process.env.autoroleID1;
  const rol2 = process.env.autoroleID2;
  if (!data) return;
  else {
    try {
      await member.roles.add(data.Role);
      await member.roles.add(rol);
      await member.roles.add(rol2);
    } catch (e) {
      return;
    }
  }
});

// REACTION ROLES //

// reaction add
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });
  if (!data) return;

  const guild = await client.guilds.cache.get(reaction.message.guildId);
  const member = await guild.members.cache.get(user.id);

  try {
    await member.roles.add(data.Role);
  } catch (e) {
    return;
  }
});

// reaction remove
client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });
  if (!data) return;

  const guild = await client.guilds.cache.get(reaction.message.guildId);
  const member = await guild.members.cache.get(user.id);

  try {
    await member.roles.remove(data.Role);
  } catch (e) {
    return;
  }
});
