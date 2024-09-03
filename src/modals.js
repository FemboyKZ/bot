const { EmbedBuilder, Events } = require("discord.js");
const schema = require("./Schemas/base-system.js");
const status = require("./Schemas/request-status.js");
const { client } = require("./index.js");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "modalMc") {
    const uuid = interaction.fields.getTextInputValue("uuidMc");
    const reason = interaction.fields.getTextInputValue("reasonMc");
    const request = interaction.fields.getTextInputValue("requestMc");

    if (reason.length > 500 || request.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Whitelist Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`
      )
      .addFields(
        {
          name: "Name / UUID",
          value: `${uuid}`,
          inline: false,
        },
        {
          name: "Reasoning for whitelist",
          value: `${reason}`,
          inline: false,
        },
        {
          name: "What they want to do on the server",
          value: `${request}`,
          inline: false,
        }
      )
      .setTimestamp();

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "mc-whitelist",
    });
    if (!data || !data.Channel) return;
    const channel = interaction.guild.channels.cache.get(data.Channel);
    if (!channel) return;

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Your request has been submitted.",
        ephemeral: true,
      });
      await status.create({
        User: interaction.user.id,
        Type: "mc-whitelist",
        Status: null,
      });
    } catch (error) {
      console.error("Error submitting modal:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "modalWhitelist") {
    const steam = interaction.fields.getTextInputValue("steamWhitelist");
    const reason = interaction.fields.getTextInputValue("reasonWhitelist");
    const request = interaction.fields.getTextInputValue("requestWhitelist");

    if (reason.length > 500 || request.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Whitelist Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`
      )
      .addFields(
        {
          name: "SteamID / Profile URL",
          value: `${steam}`,
          inline: false,
        },
        {
          name: "Reasoning for whitelist",
          value: `${reason}`,
          inline: false,
        },
        {
          name: "Requested to Group? Yes/No",
          value: `${request}`,
          inline: false,
        }
      )
      .setTimestamp();

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "whitelist",
    });
    if (!data || !data.Channel) return;
    const channel = interaction.guild.channels.cache.get(data.Channel);
    if (!channel) return;

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Your request has been submitted.",
        ephemeral: true,
      });
      await status.create({
        User: interaction.user.id,
        Type: "whitelist",
        Status: null,
      });
    } catch (error) {
      console.error("Error submitting modal:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "modalUnban") {
    const steam = interaction.fields.getTextInputValue("steamUnban");
    const reason = interaction.fields.getTextInputValue("reasonUnban");
    const server = interaction.fields.getTextInputValue("serverUnban");

    if (reason.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#ff00b3")
      .setTitle("New Unban Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`
      )
      .addFields(
        {
          name: "SteamID / Profile URL",
          value: `${steam}`,
          inline: false,
        },
        {
          name: "Reasoning for unban",
          value: `${reason}`,
          inline: false,
        },
        {
          name: "Server IP/Name",
          value: `${server}`,
          inline: false,
        }
      )
      .setTimestamp();

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "unban",
    });
    if (!data || !data.Channel) return;
    const channel = interaction.guild.channels.cache.get(data.Channel);
    if (!channel) return;

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Your request has been submitted.",
        ephemeral: true,
      });
      await status.create({
        User: interaction.user.id,
        Type: "unban",
        Status: null,
      });
    } catch (error) {
      console.error("Error submitting modal:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "modalReport") {
    const issue = interaction.fields.getTextInputValue("issueReport");
    const info = interaction.fields.getTextInputValue("infoReport");
    const more = interaction.fields.getTextInputValue("moreReport");

    if (info.length > 500 || more.length > 500) {
      return await interaction.reply({
        content: `You have entered too much text, please shorten it and try again.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("New Report/Suggestion Request")
      .setImage("https://femboy.kz/images/wide.png")
      .setDescription(
        `Requesting member: ${interaction.user.tag} (${interaction.user.id})\nIn Server: ${interaction.guild.name} (${interaction.guild.id})`
      )
      .addFields(
        {
          name: "Reported issue / Suggestion",
          value: `${issue}`,
          inline: false,
        },
        {
          name: "Issue/Suggestion in detail",
          value: `${info}`,
          inline: false,
        },
        {
          name: "More info, such as links.",
          value: `${more}`,
          inline: false,
        }
      )
      .setTimestamp();

    const data = await schema.findOne({
      Guild: interaction.guild.id,
      ID: "report",
    });
    if (!data || !data.Channel) return;
    const channel = interaction.guild.channels.cache.get(data.Channel);
    if (!channel) return;

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Your request has been submitted.",
        ephemeral: true,
      });
      await status.create({
        User: interaction.user.id,
        Type: "report",
        Status: null,
      });
    } catch (error) {
      console.error("Error submitting modal:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});
