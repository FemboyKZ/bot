const schema = require("./Schemas/auditlog.js");
const { client } = require("./index.js");

client.on("ready", async () => {
  const guild = await client.guilds.cache.get(`${process.env.GUILD_ID}`); // fkz
  const members = await guild.members.fetch();
  const channels = await guild.channels.fetch();
  const invites = await guild.invites.fetch();
  const bans = await guild.bans.fetch();
  const emojis = await guild.emojis.fetch();
  const stickers = await guild.stickers.fetch();
  const roles = await guild.roles.fetch();

  members.forEach(async (member) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Member: member.id,
    });

    if (data) {
      await data.updateOne({ Member: member.id });
    } else {
      await schema.create({ Guild: guild.id, Member: member.id });
    }
  });

  channels.forEach(async (channel) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Channel: channel.id,
    });

    if (data) {
      await data.updateOne({ Channel: channel.id });
    } else {
      await schema.create({ Guild: guild.id, Channel: channel.id });
    }
  });

  invites.forEach(async (invite) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Invite: invite.code,
    });

    if (data) {
      await data.updateOne({ Invite: invite.code });
    } else {
      await schema.create({ Guild: guild.id, Invite: invite.code });
    }
  });

  bans.forEach(async (ban) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Ban: ban.user.id,
    });

    if (data) {
      await data.updateOne({ Ban: ban.user.id });
    } else {
      await schema.create({ Guild: guild.id, Ban: ban.user.id });
    }
  });

  emojis.forEach(async (emoji) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Emoji: emoji.id,
    });

    if (data) {
      await data.updateOne({ Emoji: emoji.id });
    } else {
      await schema.create({ Guild: guild.id, Emoji: emoji.id });
    }
  });

  stickers.forEach(async (sticker) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Sticker: sticker.id,
    });

    if (data) {
      await data.updateOne({ Sticker: sticker.id });
    } else {
      await schema.create({ Guild: guild.id, Sticker: sticker.id });
    }
  });

  roles.forEach(async (role) => {
    const data = await schema.findOne({
      Guild: guild.id,
      Role: role.id,
    });

    if (data) {
      await data.updateOne({ Role: role.id });
    } else {
      await schema.create({ Guild: guild.id, Role: role.id });
    }
  });
});
