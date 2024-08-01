const { Events } = require("discord.js");
const autorole = require("./Schemas/autorole");
const processedMembers = require("./Schemas/processedMembers");
const { client } = require("./index.js");

client.on(Events.GuildMemberAdd, async (member) => {
  const data = await autorole.findOne({ Guild: member.guild.id });
  if (!data || !data.Roles.length) return;

  const processed = await processedMembers.findOne({
    Guild: member.guild.id,
    Member: member.id,
  });
  if (processed) return;

  try {
    for (const roleId of data.Roles) {
      const role = await member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
      }
    }

    await new processedMembers({
      Guild: member.guild.id,
      Member: member.id,
    }).save();
  } catch (e) {
    return console.log(e);
  }
});

client.on("ready", async () => {
  await checkUnprocessedMembers();
});

async function checkUnprocessedMembers() {
  const guilds = await client.guilds.fetch();

  for (const guild of guilds.values()) {
    const members = await guild.members.fetch();

    for (const member of members.values()) {
      if (member.user.bot) continue;

      const processed = await processedMembers.findOne({
        Guild: guild.id,
        Member: member.id,
      });
      if (processed) continue;

      const data = await autorole.findOne({ Guild: guild.id });
      if (!data || !data.Roles.length) continue;

      try {
        for (const roleId of data.Roles) {
          const role = await guild.roles.cache.get(roleId);
          if (role) {
            await member.roles.add(role);
          }
        }

        await new processedMembers({
          Guild: guild.id,
          Member: member.id,
        }).save();
      } catch (e) {
        console.log(e);
      }
    }
  }
  setTimeout(checkUnprocessedMembers, 60000);
}
