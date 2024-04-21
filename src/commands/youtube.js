const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getyoutubeid')
        .setDescription('Returns the YouTube channel ID from a given URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The YouTube channel URL')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        try {
            const channelId = await getYouTubeChannelId(url);
            await interaction.reply(`YouTube Channel ID: ${channelId}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Failed to retrieve the YouTube channel ID. Make sure the URL is correct.');
        }
    },
};

async function getYouTubeChannelId(channelUrl) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const extracted = extractChannelId(channelUrl);
    const params = {
        key: apiKey,
        part: 'snippet', // Changed to snippet to get more details
    };

    if (extracted.type === 'id') {
        params.id = extracted.value;
    } else if (extracted.type === 'forHandle') {
        params.forHandle = extracted.value;
    }else if (extracted.type === 'forUsername') {
        params.forUsername = extracted.value;
    }

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
        params
    });

    console.log(params, response.data)

    if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].id;
    } else {
        throw new Error('No channel found with the given URL.');
    }
}


function extractChannelId(url) {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean); // Removes empty segments

    if (pathSegments[0] === 'channel' && pathSegments[1].startsWith('UC')) {
        return { type: 'id', value: pathSegments[1] }; // Direct channel ID
    } else if (pathSegments[0] === 'user') {
        return { type: 'forUsername', value: pathSegments[1] }; // Username
    } else {
        return { type: 'forHandle', value: pathSegments[0] }; // Assuming custom URL or username
    }
}

