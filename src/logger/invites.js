const { EmbedBuilder, Events } = require("discord.js");
const Audit_Log = require("./Schemas/auditlog");
const { client } = require("./index.js");

client.on(Events.InviteCreate, async (invite) => {
  const data = await Audit_Log.findOne({
    Guild: invite.guild?.id,
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Invite Created")
    .addFields(
      {
        name: "Creator:",
        value: `${invite.inviterId || "unknown"}`,
        inline: false,
      },
      {
        name: "Url:",
        value: `${invite.url}`,
        inline: false,
      }
    );
  await auditChannel.send({ embeds: [auditEmbed] });
});

client.on(Events.InviteDelete, async (invite) => {
  const data = await Audit_Log.findOne({
    Guild: invite.guild?.id,
  });
  if (!data) return;
  const logID = data.Channel;
  const auditChannel = client.channels.cache.get(logID);
  if (!auditChannel) return;

  const auditEmbed = new EmbedBuilder()
    .setColor("#ff00b3")
    .setTimestamp()
    .setFooter({ text: "FKZ Log System" })
    .setTitle("Invite Deleted")
    .addFields(
      {
        name: "Author:",
        value: `${invite.inviter?.id || "unknown"}`,
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
  await auditChannel.send({ embeds: [auditEmbed] });
});
