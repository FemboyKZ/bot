const { EmbedBuilder, Events } = require("discord.js");
const schema = require("../Schemas/base-system.js");
const { client } = require("../index.js");

client.on(Events.InviteCreate, async (invite) => {
  const data = await schema.findOne({
    Guild: invite.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Invite Created")
    .addFields(
      {
        name: "Creator:",
        value: `<@${invite.inviter?.id}>` || `unknown`,
        inline: false,
      },
      {
        name: "Url:",
        value: `${invite.url}`,
        inline: false,
      }
    );
  await channel.send({ embeds: [embed] });
});

client.on(Events.InviteDelete, async (invite) => {
  const data = await schema.findOne({
    Guild: invite.guild?.id,
    ID: "audit-logs",
  });
  const channel = client.channels.cache.get(data.Channel);
  if (!data || !data.Channel || !channel) return;

  const embed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Invite Deleted")
    .addFields(
      {
        name: "Author:",
        value: `<@${invite.inviter?.id}>` || `unknown`,
        inline: false,
      },
      {
        name: "Uses / Max Uses:",
        value: `${invite.uses || "unknown"} / ${invite.maxUses || "unknown"}`,
        inline: false,
      },
      {
        name: "Channel:",
        value: `${invite.channel?.id || "unknown"}`,
        inline: false,
      },
      {
        name: "Invite:",
        value: `${invite.code}`,
        inline: false,
      },
      {
        name: "Url:",
        value: `${invite.url}`,
        inline: false,
      }
    );
  await channel.send({ embeds: [embed] });
});
