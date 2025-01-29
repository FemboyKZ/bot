const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const vip = require("../../schemas/base-system.js");
const uses = require("../../schemas/vip/vipUses.js");
const roles = require("../../schemas/vip/vipRoles.js");
const status = require("../../schemas/vip/vipStatus.js");
require("dotenv").config();

// TODO: MAKE THIS NOT SO SHITTY

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim-vip")
    .setDescription("Claim your VIP, VIP+ or Contributor perks.")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription(
          "The SteamID of the account you want to claim perks for.",
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription(
          "The code you got in a TXT file after purchasing the Upgrade.",
        )
        .setRequired(true),
    ),
  async execute(interaction) {
    const { guild, options, user } = interaction;

    const steamId = options.getString("steamid");
    const code = options.getString("code");

    const embed = new EmbedBuilder()
      .setTitle("Perks Claimed!")
      .setColor("#ff00b3")
      .setTimestamp();

    const logEmbed = new EmbedBuilder()
      .setTitle("Perks Gifted")
      .setColor("#ff00b3")
      .setTimestamp();

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

    const perkSystem = await vip.findOne({ Guild: guild.id, ID: "vip" });
    if (!perkSystem) {
      return await interaction.reply({
        content:
          "The perk claim system is currently disabled, please try again later.",
        ephemeral: true,
      });
    }

    const vipCode = await uses.findOne({ Guild: guild.id, Type: "vip" });
    const vipPlusCode = await uses.findOne({ Guild: guild.id, Type: "vip+" });
    const contributorCode = await uses.findOne({
      Guild: guild.id,
      Type: "contributor",
    });
    if (!vipCode || !vipPlusCode || !contributorCode) {
      return await interaction.reply({
        content:
          "The perk claim system is currently disabled, please try again later.",
        ephemeral: true,
      });
    }

    const validCodes = [vipCode.Code, vipPlusCode.Code, contributorCode.Code];
    if (!validCodes.includes(code)) {
      embed.setDescription(`The code you entered is invalid.`);

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (code === vipCode.Code && vipCode.Uses > 0) {
      embed.setDescription(`The code you entered has been used already.`);
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    if (code === vipPlusCode.Code && vipPlusCode.Uses > 0) {
      embed.setDescription(`The code you entered has been used already.`);
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    if (code === contributorCode.Code && contributorCode.Uses > 0) {
      embed.setDescription(`The code you entered has been used already.`);
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const perkStatus = await status.findOne({ Claimer: user.id });
    if (!perkStatus) {
      if (code === vipCode.Code) {
        const perkType = "vip";
        const roleType = await roles.findOne({
          Guild: guild.id,
          Type: perkType,
        });
        const role = await guild.roles.fetch(roleType.Role);
        await handleClaim(
          interaction,
          user,
          code,
          perkSystem,
          embed,
          logEmbed,
          steamId,
          perkType,
          role,
        );
      } else if (code === vipPlusCode.Code) {
        const perkType = "vip+";
        const roleType = await roles.findOne({
          Guild: guild.id,
          Type: perkType,
        });
        const role = await guild.roles.fetch(roleType.Role);
        await handleClaim(
          interaction,
          user,
          code,
          perkSystem,
          embed,
          logEmbed,
          steamId,
          perkType,
          role,
        );
      } else if (code === contributorCode.Code) {
        const perkType = "contributor";
        const roleType = await roles.findOne({
          Guild: guild.id,
          Type: perkType,
        });
        const role = await guild.roles.fetch(roleType.Role);
        await handleClaim(
          interaction,
          user,
          code,
          perkSystem,
          embed,
          logEmbed,
          steamId,
          perkType,
          role,
        );
      } else {
        return await interaction.reply({
          content: `Something you entered is invalid, please try again.`,
          ephemeral: true,
        });
      }
    } else if (perkStatus) {
      if (perkStatus.Type === "vip" && perkStatus.Status === true) {
        if (code === vipCode.Code) {
          await interaction.reply({
            content: `You've already claimed those perks. If you want to gift, use the \`/gift\` command.`,
            ephemeral: true,
          });
        } else if (code === vipPlusCode.Code) {
          const perkType = "vip+";
          const roleType = await roles.findOne({
            Guild: guild.id,
            Type: perkType,
          });
          const role = await guild.roles.fetch(roleType.Role);
          await handleExistingClaim(
            interaction,
            user,
            code,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role,
          );
        } else if (code === contributorCode.Code) {
          const perkType = "contributor";
          const roleType = await roles.findOne({
            Guild: guild.id,
            Type: perkType,
          });
          const role = await guild.roles.fetch(roleType.Role);
          await handleExistingClaim(
            interaction,
            user,
            code,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role,
          );
        } else {
          return await interaction.reply({
            content: `Something you entered is invalid, please try again.`,
            ephemeral: true,
          });
        }
      } else if (perkStatus.Type === "vip+" && perkStatus.Status === true) {
        if (code === vipCode.Code || code === vipPlusCode.Code) {
          await interaction.reply({
            content: `You've already claimed those perks. If you want to gift, use the \`/gift\` command.`,
            ephemeral: true,
          });
        } else if (code === contributorCode.Code) {
          const perkType = "contributor";
          const roleType = await roles.findOne({
            Guild: guild.id,
            Type: perkType,
          });
          const role = await guild.roles.fetch(roleType.Role);
          await handleExistingClaim(
            interaction,
            user,
            code,
            perkSystem,
            embed,
            logEmbed,
            steamId,
            perkType,
            role,
          );
        } else {
          return await interaction.reply({
            content: `Something you entered is invalid, please try again.`,
            ephemeral: true,
          });
        }
      } else if (
        perkStatus.Type === "contributor" &&
        perkStatus.Status === true
      ) {
        return await interaction.reply({
          content: `You've already claimed your perks. If you want to gift, use the \`/gift\` command.`,
          ephemeral: true,
        });
      } else {
        return await interaction.reply({
          content: `Something you entered is invalid, please try again.`,
          ephemeral: true,
        });
      }
    }
  },
};

async function handleClaim(
  interaction,
  user,
  code,
  perkSystem,
  embed,
  logEmbed,
  steamId,
  perkType,
  role,
) {
  embed.setDescription(
    `Thank you for supporting us! You have been upgraded to **${perkType}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`,
  );
  logEmbed.setDescription(
    `**${user}** has claimed **${perkType}**.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`,
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
      { Uses: 1 },
    );
    await user.roles.add(role);
    if (perkType === "vip+" || perkType === "contributor") {
      const vipRole = await roles.findOne({
        Guild: interaction.guild.id,
        Type: "vip",
      });
      const vipRoleId = vipRole.Role;
      const role2 = await interaction.guild.roles.fetch(vipRoleId);
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
}

async function handleExistingClaim(
  interaction,
  user,
  code,
  perkSystem,
  embed,
  logEmbed,
  steamId,
  perkType,
  role,
) {
  embed.setDescription(
    `Thank you for supporting us! You have been upgraded to **${perkType}**!\nIngame perks will be applied within a few hours. If you have any issues, please contact an admin.`,
  );
  logEmbed.setDescription(
    `**${user}** has claimed **${perkType}**.\nSteamID: \`${steamId}\`\nCode: \`${code}\`\nPing: <@289767921956290580>, remember to apply ingame perks!`,
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
      },
    );
    await uses.findOneAndUpdate(
      { Guild: perkSystem.Guild, Type: perkType },
      { Uses: 1 },
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
}
