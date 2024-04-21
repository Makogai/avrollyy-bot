const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Check your YouTube subscription status'),
    async execute(interaction) {
        const state = JSON.stringify({
            userId: interaction.user.id,
            channelId: interaction.channelId
        });
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const link = `${appUrl}/auth?state=${encodeURIComponent(state)}`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(link)
                .setLabel('Authenticate with YouTube')
                .setEmoji('🔗')
        );

        await interaction.user.send({
            content: 'Please authenticate using the button below:',
            components: [row]
        });

        await interaction.reply({ content: 'I have sent you a private message with the authentication link!', ephemeral: true });
    },
};
