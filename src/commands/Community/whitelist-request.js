const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder }= require('discord.js');
const whitelistSchema = require('../../Schemas.js/whitelistSchema');

var timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('whitelist-request')
    .setDescription('Request to join the whitelist.'),
    async execute (interaction) {

        if (timeout.includes(interaction.user.id)) return await interaction.reply({ content: `You are on a cooldown! Try again in a few seconds.`, ephemeral: true });

        whitelistSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
            if (!data) {
                return await interaction.reply({ content: "The whitelist requests are currently disabled.", ephemeral: true });
            }

            if (data) {
                const modal1 = new ModalBuilder()
                .setTitle("Whitelist Request form")
                .setCustomId('modal1')

                const steam1 = new TextInputBuilder()
                .setCustomId('steam1')
                .setRequired(true)
                .setLabel('What is your SteamID, or Steam Profile URL')
                .setPlaceholder("STEAM_1:0:XXX, replace X with your ID")
                .setStyle(TextInputStyle.Short)

                const reason1 = new TextInputBuilder()
                .setCustomId('reason1')
                .setRequired(true)
                .setLabel('Why should you get whitelisted')
                .setPlaceholder("Do the owners know you? Were you whitelisted before? Are you a femboy? Etc.")
                .setStyle(TextInputStyle.Paragraph)

                const request1 = new TextInputBuilder()
                .setCustomId('request1')
                .setRequired(true)
                .setLabel('Have you requested to join the WL SteamGroup?')
                .setPlaceholder("Yes/No")
                .setStyle(TextInputStyle.Short)

                const firstActionRow = new ActionRowBuilder().addComponents(steam1)
                const secondActionRow = new ActionRowBuilder().addComponents(reason1)
                const thirdActionRow = new ActionRowBuilder().addComponents(request1)

                modal1.addComponents(firstActionRow, secondActionRow, thirdActionRow)

                interaction.showModal(modal1)
            }
        })

        timeout.push(interaction.user.id);
        setTimeout(() => {
            timeout.shift();
        }, 10000)
    }
}