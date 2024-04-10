const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
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

// anti-ghostping, not used
const ghostSchema = require("./Schemas.js/ghostpingSchema");
const numSchema = require("./Schemas.js/ghostnumSchema");

// Ticket system
const ticketSchema = require("./Schemas.js/ticketSchema");

// ticket modal create
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) return;
  if (interaction.isChatInputCommand()) return;

  const modalTicket = new ModalBuilder()
    .setTitle("Provide us with more information")
    .setCustomId("modalTicket");

  const topicTicket = new TextInputBuilder()
    .setCustomId("topicTicket")
    .setRequired(true)
    .setLabel("What is the topic of your ticket?")
    .setPlaceholder("Server connection issue? Server crashed. Etc.")
    .setStyle(TextInputStyle.Short);

  const infoTicket = new TextInputBuilder()
    .setCustomId("infoTicket")
    .setRequired(true)
    .setLabel("Specify the issue, in detail.")
    .setPlaceholder(
      "Error messages? What happened? What have you tried already to fix it? Etc."
    )
    .setStyle(TextInputStyle.Paragraph);

  const additionalTicket = new TextInputBuilder()
    .setCustomId("additionalTicket")
    .setRequired(true)
    .setLabel("Anything to add? Links/Clips/Screenshots/etc.")
    .setPlaceholder("Links to Clips/Screenshots. Server IP/Name.")
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder().addComponents(topicTicket);
  const secondActionRow = new ActionRowBuilder().addComponents(infoTicket);
  const thirdActionRow = new ActionRowBuilder().addComponents(additionalTicket);

  modalTicket.addComponents(firstActionRow, secondActionRow, thirdActionRow);

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
      interaction.showModal(modalTicket);
    }
  }
});

// ticket creation
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "modalTicket") {
      ticketSchema.findOne(
        { Guild: interaction.guild.id },
        async (err, data) => {
          const topicInput =
            interaction.fields.getTextInputValue("topicTicket");
          const infoInput = interaction.fields.getTextInputValue("infoTicket");
          const additionalInput =
            interaction.fields.getTextInputValue("additionalTicket");

          if (infoInput.length > 500 || additionalInput.length > 500) {
            return await interaction.reply({
              content: `You have entered too much text, please shorten it and try again.`,
              ephemeral: true,
            });
          }

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

// CS:GO & Mc whitelist request commands, unban request command, report command
const whitelistSchema = require("./Schemas.js/whitelistSchema");
const mcWhitelistSchema = require("./Schemas.js/mcWhitelistSchema");
const unbanSchema = require("./Schemas.js/unbanSchema");
const reportSchema = require("./Schemas.js/reportSchema");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "modalMc") {
    const uuid = interaction.fields.getTextInputValue("uuidMc");
    const reason = interaction.fields.getTextInputValue("reasonMc");
    const request = interaction.fields.getTextInputValue("requestMc");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const server = interaction.guild.name;
    const serverId = interaction.guild.id;

    if (reason.length > 500 || request.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embedMc = new EmbedBuilder()
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

          channel.send({ embeds: [embedMc] });

          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
        }
      }
    );
  }

  if (interaction.customId === "modalWhitelist") {
    const steam = interaction.fields.getTextInputValue("steamWhitelist");
    const reason = interaction.fields.getTextInputValue("reasonWhitelist");
    const request = interaction.fields.getTextInputValue("requestWhitelist");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const guild = interaction.guild.name;
    const guildId = interaction.guild.id;

    if (reason.length > 500 || request.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embedWhitelist = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Whitelist Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${guild} (${guildId})`
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

          channel.send({ embeds: [embedWhitelist] });

          await interaction.reply({
            content: "Your request has been submitted.",
            ephemeral: true,
          });
        }
      }
    );
  }

  // unban request command
  if (interaction.customId === "modalUnban") {
    const steam = interaction.fields.getTextInputValue("steamUnban");
    const reason = interaction.fields.getTextInputValue("reasonUnban");
    const server = interaction.fields.getTextInputValue("serverUnban");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const guild = interaction.guild.name;
    const guildId = interaction.guild.id;

    if (reason.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embedUnban = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Unban Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${guild} (${guildId})`
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
        value: `${server}`,
        inline: false,
      })
      .setTimestamp();

    unbanSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (!data) return;

      if (data) {
        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embedUnban] });

        await interaction.reply({
          content: "Your request has been submitted.",
          ephemeral: true,
        });
      }
    });
  }

  // report/suggestion command
  if (interaction.customId === "modalReport") {
    const issue = interaction.fields.getTextInputValue("issueReport");
    const info = interaction.fields.getTextInputValue("infoReport");
    const more = interaction.fields.getTextInputValue("moreReport");

    const member = interaction.user.id;
    const tag = interaction.user.tag;
    const guild = interaction.guild.name;
    const guildId = interaction.guild.id;

    if (info.length > 500 || more.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embedReport = new EmbedBuilder()
      .setColor("Red")
      .setTitle("New Report/Suggestion Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${tag} (${member})\nIn Server: ${guild} (${guildId})`
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

        channel.send({ embeds: [embedReport] });

        await interaction.reply({
          content: "Your report/suggestion has been submitted.",
          ephemeral: true,
        });
      }
    });
  }
});

// antilink system
const linkSchema = require("./Schemas.js/linkSchema");

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

// ------------------------------------------------------------------------ interaction logger
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
  const channel = await client.channels.cache.get(`${process.env.logschatID}`);
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

// REACTION ROLES //
const reactions = require("./Schemas.js/reactionrs");

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

// AUDIT LOG //
const Audit_Log = require("./Schemas.js/auditlog");
// ------------------------------------------------------------------------ ban logs
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
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
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
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Ban Removed")
    .addFields({ name: "Member:", value: `${user}` });
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ channel logs
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
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Channel Created")
    .addFields(
      { name: "Name:", value: channel.name, inline: false },
      { name: "Type:", value: channel.type, inline: false },
      {
        name: "Category:",
        value: channel.parent || "No Category",
        inline: false,
      },
      { name: "ID:", value: channel.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ChannelDelete, async (channel) => {
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

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Channel Deleted")
    .addFields(
      { name: "Name:", value: channel.name, inline: false },
      { name: "Type:", value: channel.type, inline: false },
      {
        name: "Category:",
        value: channel.parent || "No Category",
        inline: false,
      },
      { name: "ID:", value: channel.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
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
  if (oldChannel.parent !== newChannel.parent) {
    changes.push(
      `Category: \`${oldChannel.parent}\` → \`${newChannel.parent}\``
    );
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

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Channel Updated")
    .addFields(
      { name: "Changes:", value: changesText },
      { name: "ID:", value: channel.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ Invite logs
client.on(Events.InviteCreate, async (invite) => {
  const data = await Audit_Log.findOne({
    Guild: invite.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Invite Created")
    .addFields(
      { name: "Author:", value: invite.inviter, inline: false },
      { name: "Max uses:", value: invite.maxUses, inline: false },
      {
        name: "Expires:",
        value: `${invite.expiresTimestamp} / ${invite.expiresAt}`,
        inline: false,
      },
      { name: "Channel:", value: invite.channel, inline: false },
      { name: "Invite:", value: invite.code, inline: false },
      { name: "Url:", value: invite.url, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.InviteDelete, async (invite) => {
  const data = await Audit_Log.findOne({
    Guild: invite.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Invite Deleted")
    .addFields(
      { name: "Author:", value: invite.inviter, inline: false },
      {
        name: "Uses / Max Uses:",
        value: `${invite.uses} / ${invite.maxUses}`,
        inline: false,
      },
      { name: "Channel:", value: invite.channel, inline: false },
      { name: "Invite:", value: invite.code, inline: false },
      { name: "Url:", value: invite.url, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ emoji logs
client.on(Events.GuildEmojiCreate, async (emoji) => {
  const data = await Audit_Log.findOne({
    Guild: emoji.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  let image = emoji.imageURL({ size: 64 });

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(`${image}` || `https://femboy.kz/images/wide.png`)
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Emoji Added")
    .addFields(
      { name: "Name:", value: emoji.name, inline: false },
      { name: "Author:", value: emoji.author, inline: false },
      { name: "Animated?:", value: emoji.animated || "?", inline: false },
      { name: "ID:", value: emoji.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildEmojiDelete, async (emoji) => {
  const data = await Audit_Log.findOne({
    Guild: emoji.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  let image = emoji.imageURL({ size: 64 });

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(`${image}` || `https://femboy.kz/images/wide.png`)
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Emoji Deleted")
    .addFields(
      { name: "Name:", value: emoji.name, inline: false },
      { name: "Author:", value: emoji.author, inline: false },
      { name: "Animated?:", value: emoji.animated || "?", inline: false },
      { name: "ID:", value: emoji.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) => {
  const data = await Audit_Log.findOne({
    Guild: newEmoji.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  const changes = [];

  if (oldEmoji.name !== newEmoji.name) {
    changes.push(`Name: \`${oldEmoji.name}\` → \`${newEmoji.name}\``);
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");
  let image = newEmoji.imageURL({ size: 64 });

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(`${image}` || `https://femboy.kz/images/wide.png`)
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Emoji Edited")
    .addFields(
      { name: "Changes:", value: changesText, inline: false },
      { name: "Author:", value: newEmoji.author, inline: false },
      { name: "ID:", value: newEmoji.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ Sticker logs
client.on(Events.GuildStickerCreate, async (sticker) => {
  const data = await Audit_Log.findOne({
    Guild: sticker.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  let image = sticker.imageURL({ size: 64 });

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(`${image}` || `https://femboy.kz/images/wide.png`)
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Sticker Added")
    .addFields(
      { name: "Name:", value: sticker.name, inline: false },
      { name: "Description:", value: sticker.description, inline: false },
      { name: "Author:", value: sticker.author, inline: false },
      { name: "Format:", value: sticker.format, inline: false },
      { name: "ID:", value: sticker.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildStickerDelete, async (sticker) => {
  const data = await Audit_Log.findOne({
    Guild: sticker.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  let image = sticker.url({ size: 128 });

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(`${image}` || `https://femboy.kz/images/wide.png`)
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Sticker Deleted")
    .addFields(
      { name: "Name:", value: sticker.name, inline: false },
      { name: "Author:", value: sticker.author, inline: false },
      { name: "ID:", value: sticker.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildStickerUpdate, async (oldSticker, newSticker) => {
  const data = await Audit_Log.findOne({
    Guild: newSticker.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  const changes = [];

  if (oldSticker.name !== newSticker.name) {
    changes.push(`Name: \`${oldSticker.name}\` → \`${newSticker.name}\``);
  }
  if (oldSticker.description !== newSticker.description) {
    changes.push(
      `Description: \`${oldSticker.description || "None"}\` → \`${
        newSticker.description || "None"
      }\``
    );
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");
  let image = newSticker.url({ size: 128 });

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setImage(`${image}` || `https://femboy.kz/images/wide.png`)
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Sticker Edited")
    .addFields(
      { name: "Changes:", value: changesText, inline: false },
      { name: "Author:", value: newSticker.author, inline: false },
      { name: "ID:", value: newSticker.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ Role logs
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
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Role Created")
    .addFields(
      { name: "Name:", value: role.name, inline: false },
      { name: "ID:", value: role.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildRoleDelete, async (role) => {
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

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Role Deleted")
    .addFields(
      { name: "Name:", value: role.name, inline: false },
      { name: "ID:", value: role.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
  const data = await Audit_Log.findOne({
    Guild: newRole.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);
  const changes = [];

  if (oldRole.name !== newRole.name) {
    changes.push(`Name: \`${oldRole.name}\` → \`${newRole.name}\``);
  }

  if (oldRole.permissions !== newRole.permissions) {
    changes.push(
      `Permissions: \`${oldRole.permissions || "None"}\` → \`${
        newRole.permissions || "None"
      }\``
    );
  }

  if (oldRole.mentionable !== newRole.mentionable) {
    changes.push(
      `Mentionable?: \`${oldRole.mentionable || "None"}\` → \`${
        newRole.mentionable || "None"
      }\``
    );
  }

  if (oldRole.hoist !== newRole.hoist) {
    changes.push(
      `Hoisted?: \`${oldRole.hoist || "None"}\` → \`${
        newRole.hoist || "None"
      }\``
    );
  }

  if (oldRole.color !== newRole.color) {
    changes.push(
      `Color: \`${oldRole.color + " " + oldRole.hexColor || "None"}\` → \`${
        newRole.color + " " + newRole.hexColor || "None"
      }\``
    );
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle("Role Updated")
    .setFooter({ text: "FKZ Log System" })
    .addFields(
      { name: "Changes:", value: changesText, inline: false },
      { name: "ID:", value: newRole.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ message logs
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
  if (!message.author) return;
  if (message.author.bot) return;
  if (!message.author.id === client.user.id) return;

  try {
    const auditChannel = client.channels.cache.get(logID);
    if (message.content.length >= 4096) {
      const tooLongEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setAuthor("Too Long Message Deleted (characters >= 4096)")
        .addFields(
          { name: "Author:", value: `${message.author}`, inline: false },
          { name: "Channel:", value: `${message.channel}`, inline: false },
          {
            name: "Message:",
            value: "`Message too long to embed.`",
            inline: false,
          },
          { name: "MessageID:", value: `${message.id}` }
        );
      await auditChannel.send({ embeds: [tooLongEmbed] });
      return;
    }

    if (message.content.length >= 1024) {
      const longEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setAuthor("Long Message Deleted (characters >= 1024)")
        .setTitle("Message:")
        .setDescription(message.content)
        .addFields(
          { name: "Author:", value: `${message.author}`, inline: false },
          { name: "Channel:", value: `${message.channel}`, inline: false },
          { name: "MessageID:", value: `${message.id}` }
        );
      await auditChannel.send({ embeds: [longEmbed] });
      return;
    }

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Message Deleted")
      .addFields(
        { name: "Author:", value: `${message.author}`, inline: false },
        { name: "Channel:", value: `${message.channel}`, inline: false },
        { name: "Message:", value: `${message.content}`, inline: false },
        { name: "MessageID:", value: `${message.id}` }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (err) {
    return console.log(err);
  }
});
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (oldMessage.author.id === client.user.id) return;
  const data = await Audit_Log.findOne({
    Guild: newMessage.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  if (!message.author) return;
  if (message.author.bot) return;
  if (!message.author.id === client.user.id) return;

  try {
    const auditChannel = client.channels.cache.get(logID);
    const changes = [];
    if (oldMessage.content.length || newMessage.content.length >= 2048) {
      const tooLongEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setAuthor("Too Long Message Edited (characters >= 2048)")
        .addFields(
          { name: "Author:", value: `${message.author}`, inline: false },
          { name: "Channel:", value: `${message.channel}`, inline: false },
          {
            name: "Message:",
            value: "`Message too long to embed.`",
            inline: false,
          },
          { name: "MessageID:", value: `${message.id}` }
        );
      await auditChannel.send({ embeds: [tooLongEmbed] });
      return;
    }

    if (oldMessage.content !== newMessage.content) {
      changes.push(
        `Topic: \`${oldMessage.content || "None"}\` → \`${
          newMessage.content || "None"
        }\``
      );
    }
    if (changes.length === 0) return;
    const changesText = changes.join("\n");

    if (oldMessage.content.length || newMessage.content.length >= 612) {
      const longEmbed = new EmbedBuilder()
        .setColor("#ff00b3")
        .setTimestamp()
        .setFooter({ text: "FKZ Log System" })
        .setAuthor("Long Message Edited (characters >= 612)")
        .setTitle("Message:")
        .setDescription(message.content)
        .addFields(
          { name: "Author:", value: `${message.author}`, inline: false },
          { name: "Channel:", value: `${message.channel}`, inline: false },
          { name: "MessageID:", value: `${message.id}` }
        );
      await auditChannel.send({ embeds: [longEmbed] });
      return;
    }

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Message Edited")
      .addFields(
        { name: "Author:", value: `${newMessage.author}`, inline: false },
        { name: "Channel:", value: `${newMessage.channel}`, inline: false },
        { name: "Edit:", value: `${changesText}`, inline: false },
        { name: "MessageID:", value: `${newMessage.id}` }
      );
    await auditChannel.send({ embeds: [auditEmbed] });
  } catch (err) {
    return console.log(err);
  }
});
// ------------------------------------------------------------------------ Automod logs
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

  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Automod Rule Created")
    .addFields(
      {
        name: "Creator:",
        value: `<@${autoModerationRule.creatorId}>`,
        inline: false,
      },
      { name: "Name:", value: autoModerationRule.name },
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
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Automod Rule Deleted")
    .addFields(
      {
        name: "Creator:",
        value: `<@${autoModerationRule.creatorId}>`,
        inline: false,
      },
      { name: "Name:", value: autoModerationRule.name, inline: false },
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
  // 1st param is "param or null" and reads null ???? --------------------------- #1
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

    const auditChannel = client.channels.cache.get(logID);
    const changes = [];

    const nullEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Automod Rule Updated")
      .addFields({
        name: "Changes:",
        value: `NULL`,
      });

    if (oldAutoModerationRule === null) {
      return await auditChannel.send({ embeds: [nullEmbed] }); // avoid crash cuz of #1
    }

    if (oldAutoModerationRule.name !== newAutoModerationRule.name) {
      changes.push(
        `Name: \`${oldAutoModerationRule.name || "None"}\` → \`${
          newAutoModerationRule.name || "None"
        }\``
      );
    }

    if (oldAutoModerationRule.actions !== newAutoModerationRule.actions) {
      changes.push(
        `Actions: \`${oldAutoModerationRule.actions.map || "None"}\` → \`${
          newAutoModerationRule.actions.map || "None"
        }\``
      );
    }

    if (changes.length === 0) return;
    const changesText = changes.join("\n");

    const auditEmbed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTimestamp()
      .setFooter({ text: "FKZ Log System" })
      .setTitle("Automod Rule Updated")
      .addFields({
        name: "Changes:",
        value: `${changesText || "null"}`,
      });
    await auditChannel.send({ embeds: [auditEmbed] });
  }
);
// ------------------------------------------------------------------------ Thread logs
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
  const auditChannel = client.channels.cache.get(logID);
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
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
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Thread Deleted")
    .addFields(
      { name: "Name:", value: thread.name, inline: false },
      { name: "Tag:", value: `<#${thread.id}>`, inline: false },
      { name: "ID:", value: thread.id, inline: false }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});
client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
  const data = await Audit_Log.findOne({
    Guild: oldThread.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }

  const auditChannel = client.channels.cache.get(logID);
  const changes = [];

  if (oldThread.name !== newThread.name) {
    changes.push(`Name: \`${oldThread.name}\` → \`${newThread.name}\``);
  }

  if (oldThread.archived !== newThread.archived) {
    changes.push(
      `Archived?: \`${oldThread.archived || "None"}\` → \`${
        newThread.archived || "None"
      }\``
    );
  }
  if (oldThread.locked !== newThread.locked) {
    changes.push(
      `Locked?: \`${oldThread.locked || "None"}\` → \`${
        newThread.locked || "None"
      }\``
    );
  }

  if (changes.length === 0) return;
  const changesText = changes.join("\n");

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .addFields(
      { name: "Changes:", value: changesText, inline: false },
      { name: "ID:", value: newThread.id, inline: false }
    )
    .setTitle("Thread Edited")
    .setFooter({ text: "FKZ Log System" });
  await auditChannel.send({ embeds: [auditEmbed] });
});
// ------------------------------------------------------------------------ member logs, invite info logs
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
  const data = await Audit_Log.findOne({
    Guild: member.guild.id,
  });

  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }

  const newInvites = await member.guild.invites.fetch();
  const oldInvites = invites.get(member.guild.id);

  const invite = newInvites.find((i) => i.uses > oldInvites.get(i.code));

  const auditChannel = client.channels.cache.get(logID);
  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle(`${member.user.username} Has Joined the Server!`)
    .setAuthor({ name: `Member Joined` })
    .setImage("https://femboy.kz/images/wide.png")
    .setFooter({ text: "FKZ Log System" });

  if (!invite) {
    auditEmbed.setDescription(
      `${member.user.tag} joined the server using an unknown invite. This could mean they used a vanity invite link if the server has one.`
    );
    return await auditChannel.send({ embeds: [auditEmbed] });
  }

  const inviter = await client.users.fetch(invite.inviter.id);

  const auditEmbed2 = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle(`${member.user.username} Has Joined the Server!`)
    .setDescription(
      `${member.user.tag} Joined the server using the invite: ${invite.code} Which was created by: ${inviter.tag}.\nThe invite has been used ${invite.uses} times since it was created.`
    )
    .setAuthor({ name: `Member Joined` })
    .setImage("https://femboy.kz/images/wide.png")
    .setFooter({ text: "FKZ Log System" });

  const auditEmbed3 = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setTitle(`${member.user.username} Has Joined the Server!`)
    .setDescription(
      `${member} Joined the server, but the invite used cannot be found. `
    )
    .setAuthor({ name: `Member Joined` })
    .setImage("https://femboy.kz/images/wide.png")
    .setFooter({ text: "FKZ Log System" });

  inviter
    ? auditChannel.send({ embeds: [auditEmbed2] })
    : auditChannel.send({ embeds: [auditEmbed3] });
});
client.on(Events.GuildMemberRemove, async (member) => {
  const data = await Audit_Log.findOne({
    Guild: member.guild.id,
  });
  let logID;
  if (data) {
    logID = data.Channel;
  } else {
    return;
  }
  const auditChannel = client.channels.cache.get(logID);

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setAuthor({ name: `Member Left` })
    .setFooter({ text: "FKZ Log System" })
    .setTitle(`${member.user.username} has left the server`)
    .setDescription(`${member} has left the Server`);
  await auditChannel.send({ embeds: [auditEmbed] });
});
// update name or pfp
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const data = await Audit_Log.findOne({
    Guild: oldMember.guild.id,
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
    .setFooter({ text: "FKZ Log System" })
    .setTitle("User Updated");

  const auditChannel = client.channels.cache.get(logID);
  const changesName = [];
  const changesPfp = [];

  if (
    oldMember.displayName !== newMember.displayName ||
    oldMember.nickname !== newMember.nickname
  ) {
    changesName.push(
      `DisplayName: \`${
        oldMember.displayName || oldMember.nickname || "none"
      }\` → \`${newMember.displayName || newMember.nickname || "none"}\``
    );
    const changesNameText = changesName.join("\n");
    auditEmbed.addFields({
      value: changesNameText,
      inline: false,
    });
  }

  if (oldMember.avatar !== newMember.avatar) {
    changesPfp.push(
      `Profile Picture: \`[Old Pfp](<${oldMember.avatarURL({
        size: 512,
      })}>)\` → \`[New Pfp](<${newMember.avatarURL({ size: 512 })}>)\``
    );
    const changesPfpText = changesPfp.join("\n");
    const pfp = newMember.avatarURL({ size: 64 });
    auditEmbed.setImage(pfp).addFields({
      value: changesPfpText,
      inline: false,
    });
  }

  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    oldMember.roles.cache.forEach((role) => {
      if (!newMember.roles.cache.has(role.id)) {
        auditEmbed.addFields({ name: "Role Removed: ", value: role });
      }
    });
  } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    newMember.roles.cache.forEach((role) => {
      if (!oldMember.roles.cache.has(role.id)) {
        auditEmbed.addFields({ name: "Role Added: ", value: role });
      }
    });
  }

  if (changesName.length || changesPfp.length === 0) return;

  auditEmbed.addFields({ name: "ID:", value: newMember.id, inline: false });
  await auditChannel.send({ embeds: [auditEmbed] });
});

// ------------------------------------------------------------------------ AUTOROLE
const autorole = require("./Schemas.js/autorole");

client.on(Events.GuildMemberAdd, async (member) => {
  // only supports 1 role through command lol, added extra ones here lol #3
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
