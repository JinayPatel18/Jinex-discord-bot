require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`Found command files: ${commandFiles.join(', ')}`);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);
        console.log(`Checking file: ${file}`);
        console.log(`Command object keys:`, Object.keys(command));
        
        if (command.data && command.data.name) {
            commands.push(command.data.toJSON());
            console.log(`✅ Prepared command: ${command.data.name}`);
        } else {
            console.log(`⚠️ Skipped ${file}: Missing data property or command name`);
            console.log(`   What I found:`, command);
        }
    } catch (error) {
        console.log(`❌ Error loading ${file}:`, error.message);
    }
}

console.log(`Total commands prepared: ${commands.length}`);

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`🔄 Registering ${commands.length} slash commands...`);
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(`✅ Successfully registered ${data.length} slash commands!`);
        console.log('Commands registered:', data.map(cmd => cmd.name).join(', '));
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();