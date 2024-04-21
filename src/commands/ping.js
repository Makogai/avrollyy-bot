const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and bot latency!'),
    async execute(interaction) {
        // Capture the current time just before sending the reply
        const sent = await interaction.reply({ content: 'Calculating latency...', fetchReply: true });
        // Calculate the latency
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        // Edit the original reply with the latency information
        await interaction.editReply(`Pong! Your latency is **${latency}ms**`);
    },
};
