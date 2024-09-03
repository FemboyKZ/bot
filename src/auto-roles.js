const { Events } = require("discord.js");
const schema = require("./Schemas/autorole.js");
const mutes = require("./Schemas/moderation/mute.js");
const muteRole = require("./Schemas/moderation/mute-role.js");
const { client } = require("./index.js");

client.on(Events.GuildMemberAdd, async (member) => {
  const data = await schema.findOne({ Guild: member.guild.id });
  if (!data || !data.Roles.length) return;

  try {
    for (const roleId of data.Roles) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
      }
    }
  } catch (e) {
    return console.log(e);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  const data = await mutes.findOne({
    Guild: member.guild.id,
    User: member.user.id,
  });
  const role = await muteRole.findOne({
    Guild: member.guild.id,
  });
  if (!data || !role) return;

  try {
    const roles = member.guild.roles.cache.get(role.Role);
    if (roles) {
      await member.roles.add(roles);
    }
  } catch (e) {
    return console.log(e);
  }
});
