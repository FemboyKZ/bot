const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const logs = require("../Schemas/logger/invites.js");
const { client } = require("../index.js");

client.on(Events.InviteCreate, async (invite) => {
  const data = await schema.findOne({
    Guild: invite.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
        value: `<@${invite.inviter.id}>` ? `<@${logData.User}>` : `unknown`,
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
      value: `${invite.maxAge ? logData.Expires : "Unknown"}`,
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
      value: `${invite.maxUses ? logData.MaxUses : "Unknown"}`,
      inline: false,
    });
  }

  try {
    if (!logData) {
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
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in InviteCreate event:", error);
  }
});

client.on(Events.InviteDelete, async (invite) => {
  const data = await schema.findOne({
    Guild: invite.guild.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

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
        value: `<@${invite.inviter.id}>` ? `<@${logData.User}>` : `unknown`,
        inline: false,
      },
      {
        name: "Uses / Max Uses",
        value: `${invite.uses ? logData.Uses : "unknown"} / ${
          invite.maxUses ? logData.MaxUses : "unknown"
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
    if (logData) {
      await logs.deleteMany({
        Guild: invite.guild.id,
        Invite: invite.code,
      });
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in InviteDelete event:", error);
  }
});
