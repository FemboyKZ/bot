# FemboyKZ Discord bot

Really shitty Discord bot with csgo/cs2 server management commands.

I don't recommend running this for yourself.

You can contact me and see the bot in action on the [FKZ Discord](https://discord.gg/fkz)

## Info

This repo exists just for me to store this on cloud and manage versions and track issues.
If you wish to help with this feel free to open prs.

## Usage

- run `git clone -b misc/csgo-bot https://github.com/FemboyKZ/bot` to download the files
- run `npm install` to install dependencies
- create and fill out a `.env` file with details shown on the `.example`
- create and fill out a `csgo-server-config.json` file with details shown on the `.example`. This can be found in `src/commands/csgo/`
- open a terminal and execute `node src/index.js` or `npm start` to start the bot

## Usage (Docker)

- run `git clone -b misc/csgo-bot https://github.com/FemboyKZ/bot` to download the files
- run `docker build -t csgo-bot .` to build the image.
- create and fill out a `.env` file with details shown on the `.example`
- create and fill out a `csgo-server-config.json` file with details shown on the `.example`. This can be found in `src/commands/csgo/`
- create and fill out a `docker-compose.yml` file with details shown on the `.example`.
- open a terminal and execute `docker compose up -d` to start the bot.

## Features

- /csgo-server `start/stop/restart` `Server/All Servers` `(optional)force true/false`
