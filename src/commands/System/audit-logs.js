const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const schema = require("../../schemas/base-system.js");
const settings = require("../../schemas/events/settings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("audit-logs")
    .setDescription("[Admin] Setup the audit log system in your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("[Admin] Setup the audit-logs")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The logging channel")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("config")
        .setDescription("[Admin] Configure the audit-logs settings")
        .addBooleanOption((option) =>
          option
            .setName("store")
            .setDescription("Enable/Disable audit-logs storing in database")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("post")
            .setDescription(
              "Enable/Disable audit-logs posting in audit-logs channel"
            )
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("automod")
            .setDescription(
              "Enable/Disable Automod-Rules logging in audit-logs"
            )
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("bans")
            .setDescription("Enable/Disable Bans logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("channels")
            .setDescription("Enable/Disable Channels logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("emojis")
            .setDescription("Enable/Disable Emojis logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("interactions")
            .setDescription("Enable/Disable Interactions logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("invites")
            .setDescription("Enable/Disable Invites logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("members")
            .setDescription("Enable/Disable Members logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("messages")
            .setDescription(
              "Enable/Disable Deleted/Edited Messages logging in audit-logs"
            )
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("roles")
            .setDescription("Enable/Disable Roles logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("stickers")
            .setDescription("Enable/Disable Stickers logging in audit-logs")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("threads")
            .setDescription("Enable/Disable Threads logging in audit-logs")
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("[Admin] Disable the audit-logs")
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return await interaction.reply({
        content: "You don't have perms to use this command.",
        ephemeral: true,
      });

    const { options, guild } = interaction;
    const channel = options.getChannel("channel");
    const sub = options.getSubcommand();

    const storeOption = options.getBoolean("store");
    const postOption = options.getBoolean("post");

    const automodOption = options.getBoolean("automod");
    const bansOption = options.getBoolean("bans");
    const channelsOption = options.getBoolean("channels");
    const emojisOption = options.getBoolean("emojis");
    const interactionsOption = options.getBoolean("interactions");
    const invitesOption = options.getBoolean("invites");
    const membersOption = options.getBoolean("members");
    const messagesOption = options.getBoolean("messages");
    const rolesOption = options.getBoolean("roles");
    const stickersOption = options.getBoolean("stickers");
    const threadsOption = options.getBoolean("threads");

    const settingsData = await settings.findOne({
      Guild: guild.id,
    });

    const data = await schema.findOne({
      Guild: guild.id,
      ID: "audit-logs",
    });

    const embed = new EmbedBuilder()
      .setTitle("Audit Log Setup")
      .setColor("#ff00b3")
      .setTimestamp();

    switch (sub) {
      case "setup":
        try {
          if (data && settingsData) {
            embed.setDescription(
              "You have already have an audit-log system setup here!\nUse /audit-logs config to change the settings."
            );
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (data && !settingsData) {
            embed.setDescription(
              `You have already have an audit-log system setup here!\nAudit-logs Config not found, setting default values.\nUse /audit-logs config to change the settings.`
            );
            await settings.create({
              Guild: guild.id,
              Post: true,
              Store: true,
              Automod: true,
              Bans: true,
              Channels: true,
              Emojis: true,
              Interactions: true,
              Invites: true,
              Members: true,
              Messages: true,
              Roles: true,
              Stickers: true,
              Threads: true,
            });
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (!data) {
            if (!settingsData) {
              embed.setDescription(
                `Your Audit Log has been Setup to ${channel}.\nAudit-logs Config not found, setting default values.\nUse /audit-logs config to change the settings.`
              );
              await schema.create({
                Guild: guild.id,
                Channel: channel.id,
                ID: "audit-logs",
              });
              await settings.create({
                Guild: guild.id,
                Post: true,
                Store: true,
                Automod: true,
                Bans: true,
                Channels: true,
                Emojis: true,
                Interactions: true,
                Invites: true,
                Members: true,
                Messages: true,
                Roles: true,
                Stickers: true,
                Threads: true,
              });
              return await interaction.reply({
                embeds: [embed],
                ephemeral: true,
              });
            } else {
              embed.setDescription(
                `Your Audit Log has been Setup to ${channel}.\nAudit-logs Config found.\nUse /audit-logs config to change the settings.`
              );
              await schema.create({
                Guild: guild.id,
                Channel: channel.id,
                ID: "audit-logs",
              });
              return await interaction.reply({
                embeds: [embed],
                ephemeral: true,
              });
            }
          }
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
        break;

      case "config":
        if (!settingsData) {
          embed.setDescription(
            "Settings not found! Please use /setup, or restart the bot for default values to be applied."
          );
          return await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
        } else {
          if (!data) {
            embed.setDescription(
              "Audit-logs not Setup! Please use the /setup command first!"
            );
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }

          try {
            if (postOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Post: postOption,
                }
              );
            }

            if (storeOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Post: postOption,
                }
              );
            }

            if (automodOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Automod: automodOption,
                }
              );
            }

            if (bansOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Bans: bansOption,
                }
              );
            }

            if (channelsOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Channels: channelsOption,
                }
              );
            }

            if (emojisOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Emojis: emojisOption,
                }
              );
            }

            if (interactionsOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Interactions: interactionsOption,
                }
              );
            }

            if (invitesOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Invites: invitesOption,
                }
              );
            }

            if (membersOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Members: membersOption,
                }
              );
            }

            if (messagesOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Messages: messagesOption,
                }
              );
            }

            if (rolesOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Roles: rolesOption,
                }
              );
            }

            if (stickersOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Stickers: stickersOption,
                }
              );
            }

            if (threadsOption !== null) {
              await settings.findOneAndUpdate(
                {
                  Guild: guild.id,
                },
                {
                  Threads: threadsOption,
                }
              );
            }

            embed.setDescription("Settings updated!");
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } catch (err) {
            console.error("Error executing command:", err);
            await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
          }
        }
        break;

      case "disable":
        try {
          if (!data) {
            embed.setDescription("You dont have a audit log system here!");
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (data) {
            embed.setDescription(`Your Audit Log has been deleted!`);
            await schema.deleteMany({
              Guild: guild.id,
              ID: "audit-logs",
            });
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        } catch (err) {
          console.error("Error executing command:", err);
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
    }
  },
};
