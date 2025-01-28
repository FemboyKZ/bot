const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const vip = require("../../schemas/base-system.js");
const uses = require("../../schemas/vip/vip-uses.js");
const roles = require("../../schemas/vip/vip-roles.js");
const status = require("../../schemas/vip/vip-status.js");
require("dotenv").config();

var timeout = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gift-vip")
    .setDescription(
      "Gift your VIP+ or Contributor extras, or with a purchased code.",
    )
    .addSubcommand((command) =>
      command
        .setName("gift")
        .setDescription("Gift your VIP+ or Contributor extras.")
        .addStringOption((option) =>
          option
            .setName("steamid")
            .setDescription(
              "The SteamID of the account you want to gift perks for.",
            )
            .setRequired(true),
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to gift perks for.")
            .setRequired(true),
        ),
    )
    .addSubcommand((command) =>
      command
        .setName("code")
        .setDescription("Gift VIP, VIP+ or Contributor with a purchased code.")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription(
              "The code you got in a TXT file after purchasing the Upgrade.",
            )
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("steamid")
            .setDescription(
              "The SteamID of the account you want to gift perks for.",
            )
            .setRequired(true),
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to gift perks for.")
            .setRequired(true),
        ),
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

    const perkStatus = await status.findOne({ Claimer: user.id });
    const targetStatus = await status.findOne({ Claimer: target.id });
    const perkSystem = await vip.findOne({ Guild: guild.id, ID: "vip" });

    const vipCode = await uses.findOne({ Guild: guild.id, Type: "vip" });
    const vipPlusCode = await uses.findOne({
      Guild: guild.id,
      Type: "vip+",
    });
    const contributorCode = await uses.findOne({
      Guild: guild.id,
      Type: "contributor",
    });

    const vipRole = await roles.findOne({ Guild: guild.id, Type: "vip" });
    const vipPlusRole = await roles.findOne({
      Guild: guild.id,
      Type: "vip+",
    });
    const contributorRole = await roles.findOne({
      Guild: guild.id,
      Type: "contributor",
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
              role,
            );
          }
          break;

        case "code":
          if (!vipCode || !vipPlusCode || !contributorCode) {
            return await interaction.reply({
              content:
                "The perk claim system is currently disabled, please try again later.",
              ephemeral: true,
            });
          }
          if (
            code !== vipCode &&
            code !== vipPlusCode &&
            code !== contributorCode
          ) {
            return await interaction.reply({
              content: "You've entered an invalid code.",
              ephemeral: true,
            });
          }
          if (vipCode.Uses > 0 && code === vipCode) {
            return await interaction.reply({
              content: `The code you entered has been used already.`,
              ephemeral: true,
            });
          }
          if (vipPlusCode.Uses > 0 && code === vipPlusCode) {
            return await interaction.reply({
              content: `The code you entered has been used already.`,
              ephemeral: true,
            });
          }
          if (contributorCode.Uses > 0 && code === contributorCode) {
            return await interaction.reply({
              content: `The code you entered has been used already.`,
              ephemeral: true,
            });
          }
          if (!targetStatus) {
            if (code === vipCode) {
              let role = await guild.roles.fetch(vipRole.Role);
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
                role,
              );
            } else if (code === vipPlusCode) {
              let role = await guild.roles.fetch(vipPlusRole.Role);
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
                role,
              );
            } else if (code === contributorCode) {
              let role = await guild.roles.fetch(contributorRole.Role);
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
                role,
              );
            } else {
              await interaction.reply({
                content: `Something went wrong, please try again later.`,
                ephemeral: true,
              });
            }
          } else if (targetStatus) {
            if (targetStatus.Type === "vip" && targetStatus.Status === true) {
              let role = await guild.roles.fetch(vipRole.Role);
              if (code === vipCode || member.roles.cache.has(role)) {
                return await interaction.reply({
                  content: `${target} already has VIP perms.`,
                  ephemeral: true,
                });
              } else if (code === vipPlusCode) {
                let role = await guild.roles.fetch(vipPlusRole.Role);
                let perkType = "vip+";
                if (member.roles.cache.has(role)) {
                  return await interaction.reply({
                    content: `${target} already has VIP+ perms.`,
                    ephemeral: true,
                  });
                } else {
                  await handleCodeExisting(
                    interaction,
                    perkSystem,
                    target,
                    user,
                    embed,
                    logEmbed,
                    steamId,
                    perkType,
                    role,
                  );
                }
              } else if (code === contributorCode) {
                let role = await guild.roles.fetch(contributorRole.Role);
                let perkType = "contributor";
                if (member.roles.cache.has(role)) {
                  return await interaction.reply({
                    content: `${target} already has Contributor perms.`,
                    ephemeral: true,
                  });
                } else {
                  await handleCodeExisting(
                    interaction,
                    perkSystem,
                    target,
                    user,
                    embed,
                    logEmbed,
                    steamId,
                    perkType,
                    role,
                  );
                }
              } else {
                await interaction.reply({
                  content: `Something went wrong, please try again later.`,
                  ephemeral: true,
                });
              }
            } else if (
              perkStatus.Type === "vip+" &&
              perkStatus.Status === true
            ) {
              let role = await guild.roles.fetch(vipRole.Role);
              let role2 = await guild.roles.fetch(vipPlusRole.Role);
              if (
                code === vipCode ||
                code === vipPlusCode ||
                member.roles.cache.has(role) ||
                member.roles.cache.has(role2)
              ) {
                return await interaction.reply({
                  content: `${target} already has VIP+ perks.`,
                  ephemeral: true,
                });
              }
              if (code === contributorCode) {
                let role = await guild.roles.fetch(contributorRole);
                let perkType = "contributor";
                if (member.roles.cache.has(role)) {
                  return await interaction.reply({
                    content: `${target} already has Contributor perks.`,
                    ephemeral: true,
                  });
                } else {
                  await handleCodeExisting(
                    interaction,
                    perkSystem,
                    target,
                    user,
                    embed,
                    logEmbed,
                    steamId,
                    perkType,
                    role,
                  );
                }
              } else {
                await interaction.reply({
                  content: `Something went wrong, please try again later.`,
                  ephemeral: true,
                });
              }
            } else if (
              perkStatus.Type === "contributor" &&
              perkStatus.Status === true
            ) {
              let role = await guild.roles.fetch(vipRole.Role);
              let role2 = await guild.roles.fetch(vipPlusRole.Role);
              let role3 = await guild.roles.fetch(contributorRole.Role);
              if (
                code === vipCode ||
                code === vipPlusCode ||
                code === contributorCode ||
                member.roles.cache.has(role) ||
                member.roles.cache.has(role2) ||
                member.roles.cache.has(role3)
              ) {
                return await interaction.reply({
                  content: `${target} already has Contributor perks.`,
                  ephemeral: true,
                });
              } else {
                await interaction.reply({
                  content: `Something went wrong, please try again later.`,
                  ephemeral: true,
                });
              }
            } else {
              await interaction.reply({
                content: `Something went wrong, please try again later.`,
                ephemeral: true,
              });
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
    role,
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have gifted **VIP** to **${target}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`,
    );
    logEmbed.setDescription(
      `**${user}** has gifted **${target}** **VIP**, using their VIP+/Contributor perk.\nSteamID: \`${steamId}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`,
    );
    try {
      await perkSystem.Channel.send({ embeds: [logEmbed] });
      await status.create({
        Claimer: target.id,
        Status: true,
        Type: "vip",
        Gifted: null,
        Steam: steamId,
        Date: new Date(),
      });
      await status.findOneAndUpdate({ Claimer: user }, { Gifted: true });
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
    role,
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have gifted **${perkType}** to **${target}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`,
    );
    logEmbed.setDescription(
      `**${user}** has gifted **${perkType}** to **${target}**, using a code.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`,
    );
    await perkSystem.Channel.send({ embeds: [logEmbed] });
    try {
      await status.create({
        Claimer: target.id,
        Status: true,
        Type: perkType,
        Gifted: null,
        Steam: steamId,
        Date: new Date(),
      });
      await uses.findOneAndUpdate(
        { Guild: perkSystem.Guild, Type: perkType },
        { Uses: 1 },
      );
      await target.roles.add(role);
      if (perkType === "vip+" || perkType === "contributor") {
        let role2 = await guild.roles.fetch(vipRole.Role);
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
    role,
  ) {
    embed.setDescription(
      `Thank you for supporting us! You have gifted **${perkType}** to **${target}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`,
    );
    logEmbed.setDescription(
      `**${user}** has gifted **${perkType}** to **${target}**, using a code.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`,
    );
    try {
      await perkSystem.Channel.send({ embeds: [logEmbed] });
      await status.findOneAndUpdate(
        {
          Claimer: target.id,
        },
        {
          Status: true,
          Type: perkType,
          Date: new Date(),
        },
      );
      await uses.findOneAndUpdate(
        { Guild: perkSystem.Guild, Type: perkType },
        { Uses: 1 },
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
