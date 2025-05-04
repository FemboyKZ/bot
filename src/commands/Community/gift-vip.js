const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const vip = require("../../schemas/base-system.js");
const uses = require("../../schemas/vip/vipUses.js");
const roles = require("../../schemas/vip/vipRoles.js");
const status = require("../../schemas/vip/vipStatus.js");
require("dotenv").config();

const CLAIM_TYPES = ["vip", "vip+", "contributor"];
const PING_ID =
  process.env.PING_ROLE_ID || process.env.PING_USER_ID || "Not set";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gift-vip")
    .setDescription("Gift VIP perks using your existing benefits or a code")
    .addSubcommand((command) =>
      command
        .setName("benefit")
        .setDescription("Gift using your VIP+ or Contributor benefits")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to receive perks")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("steamid")
            .setDescription("Recipient's SteamID")
            .setRequired(true)
            .setMaxLength(50),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName("code")
        .setDescription("Gift using a purchased code")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("Purchased code from TXT file")
            .setRequired(true)
            .setMaxLength(40),
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to receive perks")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("steamid")
            .setDescription("Recipient's SteamID")
            .setRequired(true)
            .setMaxLength(50),
        ),
    ),

  async execute(interaction) {
    try {
      const { guild, options, user } = interaction;
      const subcommand = options.getSubcommand();

      if (!(await this.validateSystem(guild))) {
        return this.replyError(
          interaction,
          "VIP system is currently unavailable",
        );
      }

      if (subcommand === "benefit") {
        return this.handleBenefitGift(interaction);
      }
      if (subcommand === "code") {
        return this.handleCodeGift(interaction);
      }
    } catch (error) {
      console.error("Gift VIP Error:", error);
      return this.replyError(interaction, "An unexpected error occurred");
    }
  },

  async validateSystem(guild) {
    const [system, codeEntries, roleEntries] = await Promise.all([
      vip.findOne({ Guild: guild.id, ID: "vip" }),
      uses.find({ Guild: guild.id, Type: { $in: CLAIM_TYPES } }),
      roles.find({ Guild: guild.id, Type: { $in: CLAIM_TYPES } }),
    ]);
    return system && codeEntries.length === 3 && roleEntries.length === 3;
  },

  replyError(interaction, message) {
    return interaction.reply({
      content: `${message}`,
      ephemeral: true,
    });
  },

  async handleBenefitGift(interaction) {
    const { guild, options, user } = interaction;
    const recipient = options.getUser("user");
    const steamId = options.getString("steamid");

    const senderStatus = await status.findOne({ Claimer: user.id });
    if (
      !senderStatus?.Status ||
      !["vip+", "contributor"].includes(senderStatus.Type)
    ) {
      return this.replyError(interaction, "You don't have giftable benefits");
    }

    if (recipient.id === user.id) {
      return this.replyError(interaction, "Cannot gift yourself");
    }

    const recipientStatus = await status.findOne({ Claimer: recipient.id });
    if (recipientStatus?.Status) {
      return this.replyError(interaction, "Recipient already has VIP perks");
    }

    const [vipRole, senderRole] = await Promise.all([
      this.getRole(guild, "vip"),
      this.getRole(guild, senderStatus.Type),
    ]);

    if (!vipRole || !senderRole) {
      return this.replyError(interaction, "Role configuration error");
    }

    try {
      await Promise.all([
        status.findOneAndUpdate(
          { Claimer: user.id },
          { $set: { Gifted: true } },
          { upsert: true },
        ),
        status.create({
          Claimer: recipient.id,
          Status: true,
          Type: "vip",
          Steam: steamId,
          Date: new Date(),
        }),
        guild.members.addRole({
          user: recipient.id,
          role: vipRole.id,
        }),
        guild.members.removeRole({
          user: user.id,
          role: senderRole.id,
        }),
      ]);

      await this.sendSuccessResponse(interaction, "vip", recipient, steamId);
      await this.sendLog(interaction, user, "vip", recipient, steamId);
    } catch (error) {
      console.error("Benefit Gift Error:", error);
      return this.replyError(interaction, "Failed to process gift");
    }
  },

  async handleCodeGift(interaction) {
    const { guild, options, user } = interaction;
    const code = options.getString("code");
    const recipient = options.getUser("user");
    const steamId = options.getString("steamid");

    const codeEntry = await uses.findOne({
      Guild: guild.id,
      Code: code,
      Uses: 0,
    });

    if (!codeEntry) {
      return this.replyError(interaction, "Invalid or used code");
    }

    const recipientStatus = await status.findOne({ Claimer: recipient.id });
    if (recipientStatus?.Status) {
      return this.replyError(interaction, "Recipient already has VIP perks");
    }

    const role = await this.getRole(guild, codeEntry.Type);
    if (!role) {
      return this.replyError(interaction, "Role configuration error");
    }

    try {
      await Promise.all([
        uses.updateOne({ _id: codeEntry._id }, { $inc: { Uses: 1 } }),
        status.create({
          Claimer: recipient.id,
          Status: true,
          Type: codeEntry.Type,
          Steam: steamId,
          Date: new Date(),
        }),
        guild.members.addRole({
          user: recipient.id,
          role: role.id,
        }),
      ]);

      if (codeEntry.Type !== "vip") {
        const vipRole = await this.getRole(guild, "vip");
        if (vipRole) {
          await guild.members.addRole({
            user: recipient.id,
            role: vipRole.id,
          });
        }
      }

      await this.sendSuccessResponse(
        interaction,
        codeEntry.Type,
        recipient,
        steamId,
      );
      await this.sendLog(
        interaction,
        user,
        codeEntry.Type,
        recipient,
        steamId,
        code,
      );
    } catch (error) {
      console.error("Code Gift Error:", error);
      return this.replyError(interaction, "Failed to process gift code");
    }
  },

  async getRole(guild, type) {
    const roleConfig = await roles.findOne({ Guild: guild.id, Type: type });
    return roleConfig ? guild.roles.fetch(roleConfig.Role) : null;
  },

  async sendSuccessResponse(interaction, type, recipient, steamId) {
    const embed = new EmbedBuilder()
      .setTitle("Gift Successful!")
      .setColor("#00ff9d")
      .setDescription(
        `**${recipient}** has received **${type.toUpperCase()}** perks!\n` +
          `SteamID: \`${steamId}\`\n` +
          `Perks will be applied within 24 hours`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async sendLog(interaction, sender, type, recipient, steamId, code) {
    const system = await vip.findOne({
      Guild: interaction.guild.id,
      ID: "vip",
    });
    if (!system?.Channel) return;

    const logEmbed = new EmbedBuilder()
      .setTitle("VIP Gift Processed")
      .setColor("#00ff9d")
      .addFields(
        { name: "Sender", value: sender.toString(), inline: true },
        { name: "Recipient", value: recipient.toString(), inline: true },
        { name: "Type", value: type.toUpperCase(), inline: true },
        { name: "SteamID", value: `\`${steamId}\``, inline: true },
        { name: "Ping", value: `<@${PING_ID}>`, inline: true },
      )
      .setTimestamp();

    if (code) {
      logEmbed.addFields({ name: "Code", value: `\`${code}\``, inline: true });
    } else {
      logEmbed.addFields({ name: "Code", value: "N/A", inline: true });
    }

    await system.Channel.send({ embeds: [logEmbed] });
  },
};
