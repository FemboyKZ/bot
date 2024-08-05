
# FemboyKZ Discord bot

Really shitty Discord bot with a random assortment of features.

I don't recommend running this for yourself.

You can contact me and see the bot in action on the [FKZ Discord](https://discord.gg/fkz)

## Info

This repo exists just for me to store this on cloud and manage versions and track issues.
If you wish to help with this feel free to open prs.

## usage

- run `git clone https://github.com/FemboyKZ/bot` to download the files
- run `npm install` to install dependencies
- create and fill out a `.env` file with details shown on the `.example`
- open a terminal and execute `node .` or `npm run run` to start the bot

## Features

### Basic

- Databases using MongoDB
- Slash command handling
- Event handling
- Basic crash/error handling
- Secret variables in .env

### Auditlog (not reliable lol)

- Interactions (commands, buttons, selects)
- Automod (rules, actions, enabled/disabled)
- Bans (bans, unbans)
- Channels (creation/deletion/update)
- Messages (deletion/edit, reactions)
- Emojis (creation/deletion/update)
- Stickers (creation/deletion/update)
- Users (update name/nickname/avatar/banner)
- Members (join/leave)
- Invites (creation/deletion, uses)
- Roles (creation/deletion/update)
- Threads (creation/deletion, update)

### Some moderation tools

- Anti-Link (setup/disable)
- Anti-Ghostping (setup/disable)
- Ban/Unban
- Kick
- Ticket system
- Set bot status

### Roles

- Reaction-roles (add/remove)
- Auto-roles (add/remove/list)
- Role-all
- Role-missing (for auto-role/reaction-roles)

### Embeds

- Create and send embed
- Edit sent embeds
- User avatar embed
- Bot-info embed
- Server-info embed
- FKZ Specific embeds (roles, info, welcome, etc)

### CS2/CS:GO Managment

- Dathost API (restart, start, stop)
- Local commands on dedicated server (start, stop, restart, update, force-update)

### Misc / FKZ Specific

- Log bot joing/leaving guilds
- Whitelist system (setup/disable, requests, status check, responses)
- Vip system (setup/disable, set/update codes, claim/gift codes)
- Unban system (setup/disable, requests)
- Command for fetching members of a Steam Group and writing it in a TXT file
