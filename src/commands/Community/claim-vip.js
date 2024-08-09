const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const vip = require("../../Schemas/base-system.js");
const uses = require("../../Schemas/vip-uses.js");
const status = require("../../Schemas/vip-status.js");
require("dotenv").config();

const vipRole = process.env.VIP_ROLE;
const vipPlusRole = process.env.VIP_PLUS_ROLE;
const contributorRole = process.env.CONTRIBUTOR_ROLE;

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim-vip")
    .setDescription("Claim your VIP, VIP+ or Contributor perks.")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription(
          "The SteamID of the account you want to claim perks for."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription(
          "The code you got in a TXT file after purchasing the Upgrade."
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    const { guild, options, user } = interaction;
    const steamId = options.getString("steamid");
    const code = options.getString("code");
    const perkStatus = await status.findOne({ Claimer: user.id });
    const perkSystem = await vip.findOne({ Guild: guild.id, ID: "vip" });
    const vipCode = await uses.findOne({ Guild: guild.id, Type: "vip" });
    const vipPlusCode = await uses.findOne({
      Guild: guild.id,
      Type: "vip+",
    });
    const contributorCode = await uses.findOne({
      Guild: guild.id,
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

      if (!code || !steamId) {
        return await interaction.reply({
          content: "Please enter both a code and a SteamID.",
          ephemeral: true,
        });
      }

      if (code.length > 40 || steamId.length > 50) {
        return await interaction.reply({
          content: "Please enter a valid code and SteamID.",
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

        if (code === vipCode) {
          let role = await guild.roles.fetch(vipRole);
          let perkType = "vip";
          await handleClaim(
            interaction,
            user,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role
          );
        } else if (code === vipPlusCode) {
          let role = await guild.roles.fetch(vipPlusRole);
          let perkType = "vip+";
          await handleClaim(
            interaction,
            user,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role
          );
        } else if (code === contributorCode) {
          let role = await guild.roles.fetch(contributorRole);
          let perkType = "contributor";
          await handleClaim(
            interaction,
            user,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role
          );
        } else {
          await interaction.reply({
            content: `Something you entered is invalid, please try again.`,
            ephemeral: true,
          });
        }
      } else if (perkStatus) {
        if (
          code !== vipCode &&
          code !== vipPlusCode &&
          code !== contributorCode
        ) {
          return await interaction.reply({
            content: `You've attempted to claim perks with a code that is invalid.`,
            ephemeral: true,
          });
        }
        if (perkStatus.Type === "vip" && perkStatus.Status === true) {
          if (code === vipCode) {
            await interaction.reply({
              content: `You've already claimed those perks. If you want to gift, use the \`/gift\` command.`,
              ephemeral: true,
            });
          } else if (code === vipPlusCode) {
            let role = await guild.roles.fetch(vipPlusRole);
            let perkType = "vip+";
            await handleExistingClaim(
              interaction,
              user,
              perkSystem,
              embed,
              logEmbed,
              steamId,
              perkType,
              role
            );
          } else if (code === contributorCode) {
            let role = await guild.roles.fetch(contributorRole);
            let perkType = "contributor";
            await handleEixistingClaim(
              interaction,
              user,
              perkSystem,
              embed,
              logEmbed,
              steamId,
              perkType,
              role
            );
          } else {
            await interaction.reply({
              content: `Something you entered is invalid, please try again.`,
              ephemeral: true,
            });
          }
        } else if (perkStatus.Type === "vip+" && perkStatus.Status === true) {
          if (code === vipCode || code === vipPlusCode) {
            await interaction.reply({
              content: `You've already claimed those perks. If you want to gift, use the \`/gift\` command.`,
              ephemeral: true,
            });
          } else if (code === contributorCode) {
            let role = await guild.roles.fetch(contributorRole);
            let perkType = "contributor";
            await handleEixistingClaim(
              interaction,
              user,
              perkSystem,
              embed,
              logEmbed,
              steamId,
              perkType,
              role
            );
          } else {
            await interaction.reply({
              content: `Something you entered is invalid, please try again.`,
              ephemeral: true,
            });
          }
        } else if (
          perkStatus.Type === "contributor" &&
          perkStatus.Status === true
        ) {
          if (
            code === vipCode ||
            code === vipPlusCode ||
            code === contributorCode
          ) {
            await interaction.reply({
              content: `You've already claimed your perks. If you want to gift, use the \`/gift\` command.`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `Something you entered is invalid, please try again.`,
              ephemeral: true,
            });
          }
        } else {
          await interaction.reply({
            content: `Something you entered is invalid, please try again.`,
            ephemeral: true,
          });
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
    user,
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
    try {
      await perkSystem.Channel.send({ embeds: [logEmbed] });
      await status.create({
        Claimer: user.id,
        Status: true,
        Type: perkType,
        Gifted: null,
        Steam: steamId,
        Date: new Date(),
      });
      await uses.findOneAndUpdate(
        { Guild: perkSystem.Guild, Type: perkType },
        { Uses: 1 }
      );
      await user.roles.add(role);
      if (perkType === "vip+" || perkType === "contributor") {
        let role2 = await guild.roles.fetch(vipRole);
        await user.roles.add(role2);
      }
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },

  async handleExistingClaim(
    interaction,
    user,
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
    try {
      await perkSystem.Channel.send({ embeds: [logEmbed] });
      await status.findOneAndUpdate(
        {
          Claimer: user.id,
        },
        {
          Status: true,
          Type: perkType,
          Date: new Date(),
        }
      );
      await uses.findOneAndUpdate(
        { Guild: perkSystem.Guild, Type: perkType },
        { Uses: 1 }
      );
      await user.roles.add(role);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
