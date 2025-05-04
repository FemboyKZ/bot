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
    .setName("claim-vip")
    .setDescription("Claim your VIP, VIP+ or Contributor perks.")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription("SteamID of the account to claim perks for")
        .setRequired(true)
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("Code from TXT file after purchase")
        .setRequired(true)
        .setMaxLength(40),
    ),

  async execute(interaction) {
    try {
      const { guild, options, user } = interaction;
      const steamId = options.getString("steamid");
      const code = options.getString("code");

      if (!(await this.validateSystem(guild))) {
        return this.replyError(
          interaction,
          "System disabled - Please try again later",
        );
      }

      const codeData = await this.getCodeData(guild, code);
      if (!codeData) {
        return this.replyError(interaction, "Invalid code");
      }

      const existingStatus = await status.findOne({ Claimer: user.id });
      if (existingStatus?.Status) {
        return this.handleExistingUser(interaction, existingStatus, codeData);
      }

      return this.processNewClaim(interaction, user, steamId, codeData);
    } catch (error) {
      console.error("Claim VIP Error:", error);
      return this.replyError(interaction, "An error occurred");
    }
  },

  async validateSystem(guild) {
    const [system, codeEntries] = await Promise.all([
      vip.findOne({ Guild: guild.id, ID: "vip" }),
      uses.find({ Guild: guild.id, Type: { $in: CLAIM_TYPES } }),
    ]);

    return system && codeEntries.length === CLAIM_TYPES.length;
  },

  async getCodeData(guild, code) {
    const codeEntry = await uses.findOne({
      Guild: guild.id,
      Code: code,
      Uses: 0,
    });

    if (!codeEntry) return null;
    return {
      type: codeEntry.Type,
      role: await this.getRole(guild, codeEntry.Type),
      codeEntry,
    };
  },

  async getRole(guild, type) {
    const roleConfig = await roles.findOne({ Guild: guild.id, Type: type });
    return roleConfig ? guild.roles.fetch(roleConfig.Role) : null;
  },

  async processNewClaim(interaction, user, steamId, { type, role, codeEntry }) {
    if (!role) {
      return this.replyError(interaction, "Role configuration error");
    }

    await Promise.all([
      status.findOneAndUpdate(
        { Claimer: user.id },
        {
          Status: true,
          Type: type,
          Steam: steamId,
          Date: new Date(),
          Gifted: null,
        },
        { upsert: true },
      ),
      uses.updateOne({ _id: codeEntry._id }, { $inc: { Uses: 1 } }),
    ]);

    await this.assignRoles(user, role, type);

    await this.sendSuccessResponse(interaction, type, steamId, codeEntry.Code);
    await this.sendLog(interaction, user, type, steamId, codeEntry.Code);
  },

  async assignRoles(user, mainRole, type) {
    const rolesToAdd = [mainRole];

    if (["vip+", "contributor"].includes(type)) {
      const vipRole = await roles.findOne({
        Guild: mainRole.guild.id,
        Type: "vip",
      });
      if (vipRole)
        rolesToAdd.push(await mainRole.guild.roles.fetch(vipRole.Role));
    }

    await user.roles.add(rolesToAdd);
  },

  async sendSuccessResponse(interaction, type, steamId, code) {
    const embed = new EmbedBuilder()
      .setTitle("Perks Claimed!")
      .setColor("#ff00b3")
      .setDescription(
        `Thank you for supporting us! You've been upgraded to **${type}**!\n` +
          `Ingame perks for SteamID \`${steamId}\` will be applied within a few hours.` +
          `\nIf you have issues, please contact an admin.`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async sendLog(interaction, user, type, steamId, code) {
    const systemConfig = await vip.findOne({
      Guild: interaction.guild.id,
      ID: "vip",
    });
    if (!systemConfig?.Channel) return;

    const logEmbed = new EmbedBuilder()
      .setTitle("Perks Claimed")
      .setColor("#ff00b3")
      .setDescription(
        `**${user}** claimed **${type}**\n` +
          `SteamID: \`${steamId}\`\n` +
          `Code: \`${code}\`\n` +
          `Ping: <@${PING_ID}>, remember to apply ingame perks!`,
      )
      .setTimestamp();

    await systemConfig.Channel.send({ embeds: [logEmbed] });
  },

  handleExistingUser(interaction, status, codeData) {
    const validUpgrade = this.checkValidUpgrade(status.Type, codeData.type);

    if (!validUpgrade) {
      return this.replyError(
        interaction,
        `You've already claimed ${status.Type} perks. Use \`/gift\` to share it instead.`,
      );
    }

    return this.processUpgrade(interaction, status.Claimer, codeData);
  },

  checkValidUpgrade(currentType, newType) {
    const typeHierarchy = ["vip", "vip+", "contributor"];
    return typeHierarchy.indexOf(newType) > typeHierarchy.indexOf(currentType);
  },

  replyError(interaction, message) {
    return interaction.reply({
      content: `${message}`,
      ephemeral: true,
    });
  },
};
