const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/invites.js");
const settings = require("../Schemas/logger/settings.js");
const { client } = require("../index.js");

client.on(Events.InviteCreate, async (invite) => {
  const settingsData = await settings.findOne({
    Guild: invite.guild.id,
  });
  if (settingsData.Invites === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: invite.guild?.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: invite.guild.id,
    Invite: invite.code,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ` })
    .setTitle("Invite Created")
    .addFields(
      {
        name: "Creator",
        value: `<@${invite.inviter.id}>` ? `<@${logData?.User}>` : `unknown`,
        inline: false,
      },
      {
        name: "Invite",
        value: `${invite.url}`,
        inline: false,
      }
    );
  if (invite.maxAge === 0) {
    embed.addFields({
      name: "Duration",
      value: "Permanent",
      inline: false,
    });
  } else {
    embed.addFields({
      name: "Duration",
      value: `${invite.maxAge ? logData?.Expires : "Unknown"}`,
      inline: false,
    });
  }

  if (invite.maxUses === 0) {
    embed.addFields({
      name: "Max Uses",
      value: "Infinite",
      inline: false,
    });
  } else {
    embed.addFields({
      name: "Max Uses",
      value: `${invite.maxUses ? logData?.MaxUses : "Unknown"}`,
      inline: false,
    });
  }

  try {
    if (!logData && settingsData.Store === true) {
      if (invite.maxUses === 0) {
        await logs.create({
          Guild: invite.guild.id,
          Invite: invite.code,
          User: invite.inviter.id,
          Uses: invite.uses,
          MaxUses: invite.maxUses,
          Permanent: true,
          Expires: invite.maxAge,
          Created: invite.createdAt,
        });
      } else {
        await logs.create({
          Guild: invite.guild.id,
          Invite: invite.code,
          User: invite.inviter.id,
          Uses: invite.uses,
          MaxUses: invite.maxUses,
          Permanent: false,
          Expires: invite.maxAge,
          Created: invite.createdAt,
        });
      }
    }

    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in InviteCreate event:", error);
  }
});

client.on(Events.InviteDelete, async (invite) => {
  const settingsData = await settings.findOne({
    Guild: invite.guild.id,
  });
  if (settingsData.Invites === false) return;
  if (settingsData.Store === false && settingsData.Post === false) return;

  const data = await schema.findOne({
    Guild: invite.guild.id,
    ID: "audit-logs",
  });
  if (!data || !data.Channel) return;
  const channel = client.channels.cache.get(data.Channel);
  if (!channel) return;

  const logData = await logs.findOne({
    Guild: invite.guild.id,
    Invite: invite.code,
  });

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: `FKZ` })
    .setTitle("Invite Deleted")
    .addFields(
      {
        name: "Author",
        value: `<@${invite.inviter.id}>` ? `<@${logData?.User}>` : `unknown`,
        inline: false,
      },
      {
        name: "Uses / Max Uses",
        value: `${invite.uses ? logData?.Uses : "unknown"} / ${
          invite.maxUses ? logData?.MaxUses : "unknown"
        }`,
        inline: false,
      },
      {
        name: "Invite",
        value: `${invite.url}`,
        inline: false,
      }
    );
  try {
    if (logData && settingsData.Store === true) {
      await logs.deleteMany({
        Guild: invite.guild.id,
        Invite: invite.code,
      });
    }

    if (settingsData.Post === true) {
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in InviteDelete event:", error);
  }
});
