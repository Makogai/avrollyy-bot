require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const express = require('express');
const { OAuth2Client } = require('google-auth-library');

const app = express();

// Initialize Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Load event handlers
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Start Discord Bot
client.login(process.env.DISCORD_TOKEN);

// Express setup for OAuth
const port = process.env.PORT || 3000;
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `http://localhost:${port}/oauth2callback`
);

// Setup Express routes for OAuth
require('./oauth-routes')(app, oauth2Client, client);

// Start Express Server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
