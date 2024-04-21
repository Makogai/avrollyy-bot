const { google } = require('googleapis');
const { EmbedBuilder } = require('discord.js');
module.exports = function(app, oauth2Client, discordClient) {
    app.get('/auth', (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/youtube.readonly'],
            state: req.query.state // Passing the Discord user ID
        });
        res.redirect(url);
    });

    app.get('/oauth2callback', async (req, res) => {
        try {
            const { tokens } = await oauth2Client.getToken(req.query.code);
            oauth2Client.setCredentials(tokens);
            const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
            const response = await youtube.subscriptions.list({
                part: 'snippet',
                mine: true,
                maxResults: 50
            });

            const state = JSON.parse(decodeURIComponent(req.query.state));
            const guild = discordClient.guilds.cache.get(process.env.GUILD_ID);
            const member = guild.members.cache.get(state.userId);
            const channel = guild.channels.cache.get(state.channelId);

            const isSubscribed = response.data.items.some(item => item.snippet.resourceId.channelId === process.env.YOUTUBE_ID);

            if (isSubscribed) {
                const role = guild.roles.cache.find(role => role.name === "Subscribed");
                if (role) {
                    await member.roles.add(role);
                }

                const embed = new EmbedBuilder()
                    .setColor(0x00AE86)  // Success color
                    .setTitle('Subscription Status: ✅ Subscribed!')
                    .setDescription(`You are subscribed to the channel and have been given the **${role.name}** role.`)
                    .setTimestamp();

                channel.send({
                    content: `<@${state.userId}>`, // Mention the user
                    embeds: [embed]
                });
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)  // Failure color
                    .setTitle('Subscription Status: ❌ Not Subscribed')
                    .setDescription('You are not subscribed to the channel.')
                    .setTimestamp();

                channel.send({
                    content: `<@${state.userId}>`, // Mention the user
                    embeds: [embed]
                });
            }
            res.send("You can now close this window.");
        } catch (error) {
            console.error('Error during OAuth callback:', error);
            res.status(500).send('Authentication failed.');
        }
    });
};
