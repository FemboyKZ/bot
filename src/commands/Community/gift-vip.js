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
    .setName("gift-vip")
    .setDescription(
      "Gift your VIP+ or Contributor extras, or with a purchased code."
    )
    .addSubcommand((command) =>
      command
        .setName("gift")
        .setDescription("Gift your VIP+ or Contributor extras.")
        .addStringOption((option) =>
          option
            .setName("steamid")
            .setDescription(
              "The SteamID of the account you want to gift perks for."
            )
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to gift perks for.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("code")
        .setDescription("Gift VIP, VIP+ or Contributor with a purchased code.")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription(
              "The code you got in a TXT file after purchasing the Upgrade."
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("steamid")
            .setDescription(
              "The SteamID of the account you want to gift perks for."
            )
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to gift perks for.")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction || !interaction.user || !interaction.guild) {
      return;
    }

    const { guild, options, user } = interaction;
    const sub = options.getSubcommand();
    const steamId = options.getString("steamid");
    const code = options.getString("code");
    const target = options.getUser("user");
    const perkStatus = await vipStatus.findOne({ Claimer: user });
    const targetStatus = await vipStatus.findOne({ Claimer: target });
    const perkSystem = await vip.findOne({ Guild: guild });
    const vipCode = await vipUses.findOne({ Guild: guild, Type: "vip" });
    const vipPlusCode = await vipUses.findOne({ Guild: guild, Type: "vip+" });
    const contributorCode = await vipUses.findOne({
      Guild: guild,
      Type: "vip+",
    });
    const member = await guild.members.fetch(target.id);

    const embed = new EmbedBuilder()
      .setTitle("Perks Gifted!")
      .setColor("#ff00b3")
      .setTimestamp();

    const logEmbed = new EmbedBuilder()
      .setTitle("Perks Gifted")
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
            "The perk claim/gift system is currently disabled, please try again later.",
          ephemeral: true,
        });
      }

      switch (sub) {
        case "gift":
          if (!perkStatus) {
            return await interaction.reply({
              content:
                "The perk system is currently disabled, or you don't have any perks to gift.",
              ephemeral: true,
            });
          } else if (perkStatus) {
            if (!target) {
              return await interaction.reply({
                content: "Please mention the user you want to gift perks for.",
                ephemeral: true,
              });
            }
            if (target.id === user.id) {
              return await interaction.reply({
                content: "You can't gift perks for yourself.",
                ephemeral: true,
              });
            }
            if (member.roles.cache.has(vipRole)) {
              return await interaction.reply({
                content: "That user already has VIP perks.",
                ephemeral: true,
              });
            }
            if (perkStatus.Gifted === true) {
              return await interaction.reply({
                content: "You have already used your perk's gifting extras.",
                ephemeral: true,
              });
            }
            const role = await guild.roles.fetch(vipRole);
            return await handleGift(
              interaction,
              perkSystem,
              target,
              user,
              embed,
              logEmbed,
              steamId,
              role
            );
          }
          break;

        case "code":
          if (
            code !== vipCode &&
            code !== vipPlusCode &&
            code !== contributorCode
          ) {
            return await interaction.reply({
              content: "That code is not valid.",
              ephemeral: true,
            });
          }
          if (vipCode.Uses > 0 && code === vipCode) {
            embed.setDescription(`The code you entered has been used already.`);
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
          if (vipPlusCode.Uses > 0 && code === vipPlusCode) {
            embed.setDescription(`The code you entered has been used already.`);
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
          if (contributorCode.Uses > 0 && code === contributorCode) {
            embed.setDescription(`The code you entered has been used already.`);
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
          if (!targetStatus) {
            if (code === vipCode) {
              let role = await guild.roles.fetch(vipRole);
              let perkType = "vip";
              await handleCode(
                interaction,
                perkSystem,
                target,
                user,
                embed,
                logEmbed,
                steamId,
                perkType,
                role
              );
            } else if (code === vipPlusCode) {
              let role = await guild.roles.fetch(vipPlusRole);
              let perkType = "vip+";
              await handleCode(
                interaction,
                perkSystem,
                target,
                user,
                embed,
                logEmbed,
                steamId,
                perkType,
                role
              );
            } else if (code === contributorCode) {
              let role = await guild.roles.fetch(contributorRole);
              let perkType = "contributor";
              await handleCode(
                interaction,
                perkSystem,
                target,
                user,
                embed,
                logEmbed,
                steamId,
                perkType,
                role
              );
            } else {
              embed.setDescription(
                `Something went wrong, please try again later.`
              );
              logEmbed.setDescription(
                `${user} attempted to gift perks, but something went wrong.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
              );
              await perkSystem.Channel.send({ embeds: [logEmbed] });
              await interaction.reply({ embeds: [embed], ephemeral: true });
            }
          } else if (targetStatus) {
            if (targetStatus.Type === "vip" && targetStatus.Status === true) {
              let role = await guild.roles.fetch(vipRole);
              if (code === vipCode || member.roles.cache.has(role)) {
                embed.setDescription(`The user already has VIP perms.`);
                logEmbed.setDescription(
                  `${user} attempted to gift VIP, but ${target} already had VIP perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                await interaction.reply({ embeds: [embed], ephemeral: true });
              } else if (code === vipPlusCode) {
                let role = await guild.roles.fetch(vipPlusRole);
                let perkType = "vip+";
                if (member.roles.cache.has(role)) {
                  embed.setDescription(`The user already has VIP+ perms.`);
                  logEmbed.setDescription(
                    `${user} attempted to gift VIP+ perks, but ${target} already had VIP+ role.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                  );
                  await perkSystem.Channel.send({ embeds: [logEmbed] });
                  return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                  });
                }
                await handleCodeExisting(
                  interaction,
                  perkSystem,
                  target,
                  user,
                  embed,
                  logEmbed,
                  steamId,
                  perkType,
                  role
                );
              } else if (code === contributorCode) {
                let role = await guild.roles.fetch(contributorRole);
                let perkType = "contributor";
                if (member.roles.cache.has(role)) {
                  embed.setDescription(
                    `The user already has Contributor perms.`
                  );
                  logEmbed.setDescription(
                    `${user} attempted to gift Contributor perks, but ${target} already had Contributor role.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                  );
                  await perkSystem.Channel.send({ embeds: [logEmbed] });
                  return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                  });
                }
                await handleCodeExisting(
                  interaction,
                  perkSystem,
                  target,
                  user,
                  embed,
                  logEmbed,
                  steamId,
                  perkType,
                  role
                );
              } else {
                embed.setDescription(
                  `Something went wrong, please try again later.`
                );
                logEmbed.setDescription(
                  `${user} attempted to gift perks, but something went wrong.\nCode: \`${code}\`SteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                await interaction.reply({ embeds: [embed], ephemeral: true });
              }
            } else if (
              perkStatus.Type === "vip+" &&
              perkStatus.Status === true
            ) {
              if (code === vipCode || code === vipPlusCode) {
                embed.setDescription(`${target} already has VIP+ perks.`);
                logEmbed.setDescription(
                  `${user} attempted to gift VIP/VIP+, but ${target} already had VIP+ perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\`\nType: \`${perkType}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                return await interaction.reply({
                  embeds: [embed],
                  ephemeral: true,
                });
              }
              let role = await guild.roles.fetch(vipRole);
              let role2 = await guild.roles.fetch(vipPlusRole);
              if (
                member.roles.cache.has(role) ||
                member.roles.cache.has(role2)
              ) {
                embed.setDescription(`${target} already has VIP+ perks.`);
                logEmbed.setDescription(
                  `${user} attempted to gift VIP+, but ${target} already had VIP+ perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                return await interaction.reply({
                  embeds: [embed],
                  ephemeral: true,
                });
              }
              if (code === contributorCode) {
                let role = await guild.roles.fetch(contributorRole);
                let perkType = "contributor";
                if (member.roles.cache.has(role)) {
                  embed.setDescription(
                    `The user already has Contributor perms.`
                  );
                  logEmbed.setDescription(
                    `${user} attempted to gift Contributor perks, but ${target} already had Contributor perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                  );
                  await perkSystem.Channel.send({ embeds: [logEmbed] });
                  return await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                  });
                }
                await handleCodeExisting(
                  interaction,
                  perkSystem,
                  target,
                  user,
                  embed,
                  logEmbed,
                  steamId,
                  perkType,
                  role
                );
              } else {
                embed.setDescription(
                  `Something went wrong, please try again later.`
                );
                logEmbed.setDescription(
                  `${user} attempted to gift perks to ${target}, but something went wrong.\nCode: \`${code}\`SteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                await interaction.reply({ embeds: [embed], ephemeral: true });
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
                embed.setDescription(
                  `${target} already has Contributor perks.`
                );
                logEmbed.setDescription(
                  `${user} attempted to gift, but ${target} already had Contributor perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                return await interaction.reply({
                  embeds: [embed],
                  ephemeral: true,
                });
              }
              let role = await guild.roles.fetch(vipRole);
              let role2 = await guild.roles.fetch(vipPlusRole);
              let role3 = await guild.roles.fetch(contributorRole);
              if (
                member.roles.cache.has(role) ||
                member.roles.cache.has(role2) ||
                member.roles.cache.has(role3)
              ) {
                embed.setDescription(
                  `${target} already has Contributor perks.`
                );
                logEmbed.setDescription(
                  `${user} attempted to gift, but ${target} already had Contributor perms.\nCode: \`${code}\`\nSteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                return await interaction.reply({
                  embeds: [embed],
                  ephemeral: true,
                });
              } else {
                embed.setDescription(
                  `Something you entered is invalid, please try again.`
                );
                logEmbed.setDescription(
                  `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\``
                );
                await perkSystem.Channel.send({ embeds: [logEmbed] });
                await interaction.reply({ embeds: [embed], ephemeral: true });
              }
            } else {
              embed.setDescription(
                `Something you entered is invalid, please try again.`
              );
              logEmbed.setDescription(
                `${user} has entered an invalid code.\nCode: \`${code}\`SteamID: \`${steamId}\``
              );
              await perkSystem.Channel.send({ embeds: [logEmbed] });
              await interaction.reply({ embeds: [embed], ephemeral: true });
            }
          }
          break;
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

  async handleGift(
    interaction,
    perkSystem,
    target,
    user,
    embed,
    logEmbed,
    steamId,
    role
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have gifted **VIP** to **${target}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`
    );
    logEmbed.setDescription(
      `**${user}** has gifted **${target}** **VIP**, using their VIP+/Contributor perk.\nSteamID: \`${steamId}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`
    );
    try {
      await perkSystem.Channel.send({ embeds: [logEmbed] });
      await vipStatus.create({
        Claimer: target,
        Status: true,
        Type: "vip",
        Gifted: null,
        Steam: steamId,
        Date: new Date(),
      });
      await vipStatus.findOneAndUpdate({ Claimer: user }, { Gifted: true });
      await target.roles.add(role);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },

  async handleCode(
    interaction,
    perkSystem,
    target,
    user,
    embed,
    logEmbed,
    steamId,
    perkType,
    role
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have gifted **${perkType}** to **${target}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`
    );
    logEmbed.setDescription(
      `**${user}** has gifted **${perkType}** to **${target}**, using a code.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`
    );
    await perkSystem.Channel.send({ embeds: [logEmbed] });
    try {
      await vipStatus.create({
        Claimer: target,
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
      await target.roles.add(role);
      if (perkType === "vip+" || perkType === "contributor") {
        let role2 = await guild.roles.fetch(vipRole);
        await target.roles.add(role2);
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

  async handleCodeExisting(
    interaction,
    perkSystem,
    target,
    user,
    embed,
    logEmbed,
    steamId,
    perkType,
    role
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have gifted **${perkType}** to **${target}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`
    );
    logEmbed.setDescription(
      `**${user}** has gifted **${perkType}** to **${target}**, using a code.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`
    );
    try {
      await perkSystem.Channel.send({ embeds: [logEmbed] });
      await vipStatus.findOneAndUpdate(
        {
          Claimer: target,
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
      await target.roles.add(role);
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
