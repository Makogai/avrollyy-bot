const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checksubscribe')
        .setDescription('Validates if the user is subscribed to the YouTube channel')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Your YouTube channel URL')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        try {
            const channelId = await getYouTubeChannelId(url);
            // Youtube id of channel to check in .env YOUTUBE_ID
            const userId = process.env.YOUTUBE_ID; // The channel ID the user must be subscribed to
            const isSubscribed = await isSubscribedToChannel(channelId, userId);

            if (isSubscribed) {
                const role = interaction.guild.roles.cache.find(role => role.name === "sub"); // Change "Subscribed" to your role name
                if (role) {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: "✅ You are subscribed! You've been granted a special role.", ephemeral: true });
                } else {
                    await interaction.reply({ content: "✅ You are subscribed, but no special role found to assign.", ephemeral: true });
                }
            } else {
                await interaction.reply({ content: "❌ You are not subscribed to the channel.", ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to retrieve the YouTube channel ID. Make sure the URL is correct.', ephemeral: true });
        }
    },
};



async function isSubscribedToChannel(channelId, userId) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const params = {
        key: apiKey,
        part: 'string',
        channelId,
        forChannelId: userId,
    };

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/subscriptions`, {
        params
    });

    console.log(params, response.data)

    return response.data.items && response.data.items.length > 0;

}
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

