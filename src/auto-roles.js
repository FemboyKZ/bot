const { Events } = require("discord.js");
const schema = require("./Schemas/autorole.js");
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
