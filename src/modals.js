const { EmbedBuilder, Events } = require("discord.js");
const whitelistSchema = require("./Schemas/whitelistSchema");
const mcWhitelistSchema = require("./Schemas/mcWhitelistSchema");
const unbanSchema = require("./Schemas/unbanSchema");
const reportSchema = require("./Schemas/reportSchema");
const { client } = require(".");

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

    mcWhitelistSchema
      .findOne({ Guild: interaction.guild.id })
      .then(async (data) => {
        if (!data) return;

        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embedMc] });

        await interaction.reply({
          content: "Your request has been submitted.",
          ephemeral: true,
        });
      })
      .catch(async (error) => {
        console.error("Error executing command:", error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      });
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

    whitelistSchema
      .findOne({ Guild: interaction.guild.id })
      .then(async (data) => {
        if (!data) return;

        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embedWhitelist] });

        await interaction.reply({
          content: "Your request has been submitted.",
          ephemeral: true,
        });
      })
      .catch(async (error) => {
        console.error("Error executing command:", error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      });
  }

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

    unbanSchema
      .findOne({ Guild: interaction.guild.id })
      .then(async (data) => {
        if (!data) return;

        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embedUnban] });

        await interaction.reply({
          content: "Your request has been submitted.",
          ephemeral: true,
        });
      })
      .catch(async (error) => {
        console.error("Error executing command:", error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      });
  }

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

    reportSchema
      .findOne({ Guild: interaction.guild.id })
      .then(async (data) => {
        if (!data) return;

        const channelID = data.Channel;
        const channel = interaction.guild.channels.cache.get(channelID);

        channel.send({ embeds: [embedReport] });

        await interaction.reply({
          content: "Your request has been submitted.",
          ephemeral: true,
        });
      })
      .catch(async (error) => {
        console.error("Error executing command:", error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      });
  }
});
