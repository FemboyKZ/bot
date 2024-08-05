const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const vip = require("../../Schemas/vip");
const vipUses = require("../../Schemas/vipUses");
const vipStatus = require("../../Schemas/vipStatus");
require("dotenv").config();

const vipRole = process.env.VIP_ROLE;
const vipPlusRole = process.env.VIP_PLUS_ROLE;
const contributorRole = process.env.CONTRIBUTOR_ROLE;

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim-vip")
    .setDescription("Claim your Vip, Vip+ or Contributor perms.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of Vip perms you want to claim.")
        .setRequired(true)
        .addChoices(
          { name: "Vip", value: "vip" },
          { name: "Vip+", value: "vip+" },
          { name: "Contributor", value: "contributor" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription(
          "The SteamID of the account you want to claim Vip perms for."
        )
        .setRequired(true)
        .setAutocomplete(false)
    )
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription(
          "The code you got in a TXT file after purchasing the Upgrade."
        )
        .setRequired(true)
        .setAutocomplete(false)
    ),
  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    const { guild, options, user } = interaction;
    const perkType = options.getString("type");
    const steamId = options.getString("steamid");
    const code = options.getString("code");
    const perkStatus = await vipStatus.findOne({ Claimer: user });
    const perkSystem = await vip.findOne({ Guild: guild });
    const vipCode = await vipUses.findOne({ Guild: guild, Type: "vip" });
    const vipPlusCode = await vipUses.findOne({ Guild: guild, Type: "vip+" });
    const contributorCode = await vipUses.findOne({
      Guild: guild,
      Type: "vip+",
    });

    const embed = new EmbedBuilder()
      .setTitle("Perks Claimed!")
      .setColor("#ff00b3")
      .setTimestamp();

    const logEmbed = new EmbedBuilder()
      .setTitle("Perks Claimed")
      .setColor("#ff00b3")
      .setTimestamp();

    try {
      if (timeout.includes(user)) {
        return await interaction.reply({
          content: `You are on a cooldown! Try again in a few seconds.`,
          ephemeral: true,
        });
      }

      if (!perkSystem) {
        return await interaction.reply({
          content:
            "The perk claim system is currently disabled, please try again later.",
          ephemeral: true,
        });
      }

      if (!vipCode || !vipPlusCode || !contributorCode) {
        return await interaction.reply({
          content:
            "The perk claim system is currently disabled, please try again later.",
          ephemeral: true,
        });
      }

      if (!perkStatus) {
        if (
          code !== vipCode &&
          code !== vipPlusCode &&
          code !== contributorCode
        ) {
          embed.setDescription(`The code you entered is invalid.`);
          logEmbed.setDescription(
            `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\`\n\nType: \`${perkType}\``
          );
          await perkSystem.Channel.send({ embeds: [logEmbed] });
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (vipCode.Uses > 0 && code === vipCode) {
          embed.setDescription(`The code you entered has been used already.`);
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (vipPlusCode.Uses > 0 && code === vipPlusCode) {
          embed.setDescription(`The code you entered has been used already.`);
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (contributorCode.Uses > 0 && code === contributorCode) {
          embed.setDescription(`The code you entered has been used already.`);
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (code === vipCode && perkType === "vip") {
          let role = await guild.roles.fetch(vipRole);
          vipCodeUses + 1;
          await handleClaim(
            interaction,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role
          );
        } else if (code === vipPlusCode && perkType === "vip+") {
          let role = await guild.roles.fetch(vipPlusRole);
          await handleClaim(
            interaction,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role
          );
        } else if (code === contributorCode && perkType === "contributor") {
          let role = await guild.roles.fetch(contributorRole);
          await handleClaim(
            interaction,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role
          );
        } else if (
          code === vipCode ||
          code === vipPlusCode ||
          code === contributorCode
        ) {
          embed.setDescription(
            `The code you entered is valid, but the type you entered is invalid.`
          );
          logEmbed.setDescription(
            `${user} has entered a valid code, but entered an invalid type.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
          );
          await perkSystem.Channel.send({ embeds: [logEmbed] });
          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          embed.setDescription(
            `Something you entered is invalid, please try again.`
          );
          logEmbed.setDescription(
            `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\`\n\nType: \`${perkType}\``
          );
          await perkSystem.Channel.send({ embeds: [logEmbed] });
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } else if (perkStatus) {
        if (
          code !== vipCode &&
          code !== vipPlusCode &&
          code !== contributorCode
        ) {
          embed.setDescription(
            `You've attempted to claim perks with a code that is invalid.`
          );
          logEmbed.setDescription(
            `${user} attempted to claim VIP, but they already had VIP perms and they entered an invalid code.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
          );
          await perkSystem.Channel.send({ embeds: [logEmbed] });
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (perkStatus.Type === "vip" && perkStatus.Status === true) {
          if (code === vipCode && perkType === "vip") {
            embed.setDescription(`You've already claimed your VIP perks.`);
            logEmbed.setDescription(
              `${user} attempted to claim VIP, but they already had VIP perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else if (code === vipPlusCode && perkType === "vip+") {
            let role = await guild.roles.fetch(vipPlusRole);
            await handleExistingClaim(
              interaction,
              perkSystem,
              embed,
              logEmbed,
              steamId,
              perkType,
              role
            );
          } else if (code === contributorCode && perkType === "contributor") {
            let role = await guild.roles.fetch(contributorRole);
            await handleEixistingClaim(
              interaction,
              perkSystem,
              embed,
              logEmbed,
              steamId,
              perkType,
              role
            );
          } else if (
            code === vipCode ||
            code === vipPlusCode ||
            code === contributorCode
          ) {
            embed.setDescription(
              `The code you entered is valid, but the type you entered is invalid.`
            );
            logEmbed.setDescription(
              `${user} has entered a valid code, but entered an invalid type.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            embed.setDescription(
              `Something you entered is invalid, please try again.`
            );
            logEmbed.setDescription(
              `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\`\n\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } else if (perkStatus.Type === "vip+" && perkStatus.Status === true) {
          if (code === vipCode && perkType === "vip") {
            embed.setDescription(
              `You've already claimed your VIP+ perks. If you want to gift, use the \`/gift\` command.`
            );
            logEmbed.setDescription(
              `${user} attempted to claim VIP, but they already had VIP+ perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else if (code === vipPlusCode && perkType === "vip+") {
            embed.setDescription(
              `You've already claimed your VIP+ perks. If you want to gift, use the \`/gift\` command.`
            );
            logEmbed.setDescription(
              `${user} attempted to claim VIP+, but they already had VIP+ perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else if (code === contributorCode && perkType === "contributor") {
            let role = await guild.roles.fetch(contributorRole);
            await handleEixistingClaim(
              interaction,
              perkSystem,
              embed,
              logEmbed,
              steamId,
              perkType,
              role
            );
          } else if (
            code === vipCode ||
            code === vipPlusCode ||
            code === contributorCode
          ) {
            embed.setDescription(
              `The code you entered is valid, but the type you entered is invalid.`
            );
            logEmbed.setDescription(
              `${user} has entered a valid code, but entered an invalid type.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            embed.setDescription(
              `Something you entered is invalid, please try again.`
            );
            logEmbed.setDescription(
              `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\`\n\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } else if (
          perkStatus.Type === "contributor" &&
          perkStatus.Status === true
        ) {
          if (code === vipCode && perkType === "vip") {
            embed.setDescription(
              `You've already claimed your Contributor perks. If you want to gift, use the \`/gift\` command.`
            );
            logEmbed.setDescription(
              `${user} attempted to claim VIP, but they already had Contributor perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else if (code === vipPlusCode && perkType === "vip+") {
            embed.setDescription(
              `You've already claimed your Contributor perks. If you want to gift, use the \`/gift\` command.`
            );
            logEmbed.setDescription(
              `${user} attempted to claim VIP+, but they already had Contributor perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else if (code === contributorCode && perkType === "contributor") {
            embed.setDescription(
              `You've already claimed your Contributor perks. If you want to gift, use the \`/gift\` command.`
            );
            logEmbed.setDescription(
              `${user} attempted to claim Contributor, but they already had Contributor perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else if (
            code === vipCode ||
            code === vipPlusCode ||
            code === contributorCode
          ) {
            embed.setDescription(
              `The code you entered is valid, but the type you entered is invalid.`
            );
            logEmbed.setDescription(
              `${user} has entered a valid code, but entered an invalid type.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            embed.setDescription(
              `Something you entered is invalid, please try again.`
            );
            logEmbed.setDescription(
              `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\`\n\nType: \`${perkType}\``
            );
            await perkSystem.Channel.send({ embeds: [logEmbed] });
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } else {
          embed.setDescription(
            `Something you entered is invalid, please try again.`
          );
          logEmbed.setDescription(
            `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\`\n\nType: \`${perkType}\``
          );
          await perkSystem.Channel.send({ embeds: [logEmbed] });
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    } finally {
      timeout.push(user);
      setTimeout(() => {
        timeout.shift();
      }, 10000);
    }
  },

  async handleClaim(
    interaction,
    perkSystem,
    embed,
    logEmbed,
    steamId,
    perkType,
    role
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have been upgraded to **${perkType}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`
    );
    logEmbed.setDescription(
      `**${user}** has claimed **${perkType}**.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`
    );
    await perkSystem.Channel.send({ embeds: [logEmbed] });
    await vipStatus.create({
      Claimer: user,
      Status: true,
      Type: perkType,
      Gifted: null,
      Steam: steamId,
      Date: new Date(),
    });
    await vipUses.findOneAndUpdate(
      { Guild: perkSystem.Guild, Type: perkType },
      { Uses: 1 }
    );
    await user.roles.add(role);
    if (perkType === "vip+" || perkType === "contributor") {
      let role2 = await guild.roles.fetch(vipRole);
      await user.roles.add(role2);
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async handleExistingClaim(
    interaction,
    perkSystem,
    embed,
    logEmbed,
    steamId,
    perkType,
    role
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have been upgraded to **${perkType}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`
    );
    logEmbed.setDescription(
      `**${user}** has claimed **${perkType}**.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`
    );
    await perkSystem.Channel.send({ embeds: [logEmbed] });
    await vipStatus.findOneAndUpdate(
      {
        Claimer: user,
      },
      {
        Status: true,
        Type: perkType,
        Date: new Date(),
      }
    );
    await vipUses.findOneAndUpdate(
      { Guild: perkSystem.Guild, Type: perkType },
      { Uses: 1 }
    );
    await user.roles.add(role);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
