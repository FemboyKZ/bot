const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { spawn } = require("child_process");
const path = require("path");

const config = require("./csgo-server-config.json")[0];
require("dotenv").config();

const MANAGER_ROLE = process.env.CSGO_MANAGER_ROLE;
const MANAGER_USERS = process.env.CSGO_MANAGER_USERS
  ? process.env.CSGO_MANAGER_USERS.split(",")
  : [];
const EMBED_COLOR = "#ff00b3";
const STATUS_SCRIPT = path.join(
  __dirname,
  "..",
  "..",
  "scripts",
  "query_server.py",
);

function createEmbed(description, color = EMBED_COLOR) {
  return new EmbedBuilder()
    .setColor(color)
    .setTimestamp()
    .setTitle("FKZ CSGO Server Commands")
    .setFooter({ text: "FKZ" })
    .setDescription(description);
}

const resolveServerConfig = (serverId) => {
  if (serverId === "all") {
    return Object.values(config).map((server) => ({
      ip: server.ip,
      port: server.port,
      name: server.name,
      type: server.type,
      user: server.user,
      id: server.id,
      ssh_user: server.ssh_user,
      ssh_pass: server.ssh_pass,
    }));
  }

  if (serverId) {
    const server = config[serverId];
    if (!server) throw new Error("Invalid server selection");
    return [
      {
        ip: server.ip,
        port: server.port,
        name: server.name,
        type: server.type,
        user: server.user,
        id: server.id,
        ssh_user: server.ssh_user,
        ssh_pass: server.ssh_pass,
      },
    ];
  }

  return [];
};

const queryServerStatus = async (ip, port) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [STATUS_SCRIPT, ip, port]);
    let dataBuffer = "";

    pythonProcess.stdout.on("data", (data) => (dataBuffer += data));
    pythonProcess.stderr.on("data", reject);
    pythonProcess.on("close", (code) => {
      if (code !== 0) reject(`Python script exited with code ${code}`);
      try {
        resolve(JSON.parse(dataBuffer).status);
      } catch (_err) {
        reject("Invalid JSON response");
      }
    });
  });
};

function spawnAsync(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (data) => (stderr += data));
    proc.on("close", (code) => {
      if (
        code !== 0 &&
        stderr &&
        !stderr.includes("Warning: Permanently added")
      ) {
        reject(new Error(`Command failed: ${stderr}`));
      } else {
        resolve({ stderr });
      }
    });
    proc.on("error", reject);
  });
}

function dathostRequest(url, method = "POST") {
  const username = process.env.DATHOST_USERNAME || "";
  const password = process.env.DATHOST_PASSWORD || "";
  return spawnAsync("curl", [
    "-s",
    "-u",
    `${username}:${password}`,
    "-X",
    method,
    url,
  ]);
}

const commandHandlers = {
  remote_lgsm: async (action, { ip, ssh_user, ssh_pass }) => {
    await spawnAsync("sshpass", [
      "-p",
      ssh_pass,
      "ssh",
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "UserKnownHostsFile=/dev/null",
      `${ssh_user}@${ip}`,
      `./csgoserver ${action}`,
    ]);
  },

  remote_docker: async (action, { user, ip, ssh_user, ssh_pass }) => {
    await spawnAsync("sshpass", [
      "-p",
      ssh_pass,
      "ssh",
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "UserKnownHostsFile=/dev/null",
      `${ssh_user}@${ip}`,
      `docker ${action} csgo-${user}`,
    ]);
  },

  dathost: async (action, { id }) => {
    const url = `https://dathost.net/api/0.1/game-servers/${encodeURIComponent(id)}`;

    if (action === "restart") {
      await dathostRequest(`${url}/stop`);
      await dathostRequest(`${url}/start`);
    } else {
      await dathostRequest(`${url}/${encodeURIComponent(action)}`);
    }
  },
};

const serverChoices = Object.entries(config).map(([id, { name }]) => ({
  name,
  value: id,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csgo-server")
    .setDescription("[ADMIN] Manage CSGO servers")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Server action")
        .setRequired(true)
        .addChoices(
          { name: "Start", value: "start" },
          { name: "Restart", value: "restart" },
          { name: "Stop", value: "stop" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Select configured server")
        .setRequired(true)
        .addChoices(...serverChoices, { name: "All Servers", value: "all" }),
    )
    .addBooleanOption((option) =>
      option
        .setName("force")
        .setRequired(false)
        .setDescription("Force action regardless of status"),
    ),

  async execute(interaction) {
    try {
      if (interaction.guild) {
        const role = await interaction.guild.roles.fetch(MANAGER_ROLE);
        if (!role) {
          console.log("Manager role not found in guild", MANAGER_ROLE);
        }
        if (
          !MANAGER_USERS.includes(interaction.user.id) &&
          !interaction.member.permissions.has(
            PermissionFlagsBits.Administrator,
          ) &&
          !interaction.member.roles.cache.has(MANAGER_ROLE)
        ) {
          return await interaction.reply({
            content: "You don't have perms to use this command.",
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        if (!MANAGER_USERS.includes(interaction.user.id)) {
          return await interaction.reply({
            content: "You don't have perms to use this command.",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } catch (e) {
      console.error(e);
      return await interaction.reply({
        content: "Error checking permissions.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      if (!config || Object.keys(config).length === 0) {
        return interaction.editReply({
          embeds: [createEmbed("No servers configured", EMBED_COLOR)],
          flags: MessageFlags.Ephemeral,
        });
      }

      const options = {
        action: interaction.options.getString("action"),
        serverId: interaction.options.getString("server"),
        force: interaction.options.getBoolean("force") || false,
      };

      const servers = resolveServerConfig(options.serverId);

      const allowedActions = {
        start: ["OFFLINE"],
        restart: ["ACTIVE", "EMPTY"],
        stop: ["ACTIVE", "EMPTY"],
      };

      const results = [];
      for (const server of servers) {
        try {
          let status;
          if (!options.force) {
            status = await queryServerStatus(server.ip, server.port);
            if (!allowedActions[options.action].includes(status)) {
              results.push({
                server,
                success: false,
                error: `Cannot ${options.action} (Status: ${status})`,
              });
              continue;
            }
          }

          if (commandHandlers[server.type]) {
            await commandHandlers[server.type](options.action, server);
            results.push({ server, success: true });
          } else {
            throw new Error(`Unsupported server type: ${server.type}`);
          }
        } catch (error) {
          results.push({ server, success: false, error: error.message });
        }
      }

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      let description = `Action **${options.action}** executed on **${successful.length}** server${successful.length !== 1 ? "s" : ""}.`;
      if (successful.length > 0) {
        description += `\n\nSuccessful:`;
        successful.forEach((s) => {
          description += `\n\`${s.server.name} (${s.server.ip}:${s.server.port})\``;
        });
      }
      if (failed.length > 0) {
        description += `\n\nFailed:`;
        failed.forEach((f) => {
          description += `\n\`${f.server.name}\``;
          console.log(`Failed on server ${f.server.name}: ${f.error}`);
        });
      }

      await interaction.editReply({
        embeds: [createEmbed(description, EMBED_COLOR)],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createEmbed(`Command failed: ${error.message}`, EMBED_COLOR)],
        flags: MessageFlags.Ephemeral,
      });
      console.error("CSGO Server Command Error:", error);
    }
  },
};
