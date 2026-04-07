const { EmbedBuilder } = require('discord.js');
const { getSettings } = require('../models/Settings');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const settings = getSettings(member.guild.id);
        
        // AUTO-DETECT channels by name (no IDs needed!)
        const welcomeChannel = settings?.welcomeChannel 
            ? member.guild.channels.cache.get(settings.welcomeChannel)
            : member.guild.channels.cache.find(ch => ch.name === 'welcome');
        
        const verifyChannel = settings?.verifyChannel
            ? member.guild.channels.cache.get(settings.verifyChannel)
            : member.guild.channels.cache.find(ch => ch.name === 'verify');
        
        const rulesChannel = settings?.rulesChannel
            ? member.guild.channels.cache.get(settings.rulesChannel)
            : member.guild.channels.cache.find(ch => ch.name === 'rules');
        
        const setupChannel = member.guild.channels.cache.find(ch => ch.name === 'setup');
        const foodChannel = member.guild.channels.cache.find(ch => ch.name === 'food-drinks');
        const mediaChannel = member.guild.channels.cache.find(ch => ch.name === 'media');
        
        // AUTO-DETECT roles by name
        const unverifiedRole = settings?.unverifiedRole
            ? member.guild.roles.cache.get(settings.unverifiedRole)
            : member.guild.roles.cache.find(role => role.name === 'Unverified');
        
        const memberRole = settings?.memberRole
            ? member.guild.roles.cache.get(settings.memberRole)
            : member.guild.roles.cache.find(role => role.name === 'Member');
        
        // Assign unverified role
        if (unverifiedRole) {
            await member.roles.add(unverifiedRole);
        }

        // Send welcome message (uses auto-detected channels)
        if (welcomeChannel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0xFF69B4)
                .setTitle(`✨ Welcome ${member.user.username}! ✨`)
                .setDescription(`Hey ${member.user}! Welcome to **${member.guild.name}**! We're so happy to have you in our growing community! 🎉
                
If you enjoy the streams as much as we do, this is the perfect place to hang out and have fun!`)
                .addFields(
                    { 
                        name: '📋 Get Started', 
                        value: 'Here are some things to get you started:',
                        inline: false
                    },
                    { 
                        name: '📜 Read the Rules', 
                        value: rulesChannel ? `${rulesChannel} - Read and accept the rules to unlock more channels!` : '📜 Please read the rules channel',
                        inline: false
                    },
                    { 
                        name: '📱 Follow Jinuu69', 
                        value: '[Twitter](https://twitter.com/jinuu69) | [Twitch](https://twitch.tv/jinuu69) | [YouTube](https://youtube.com/jinuu69)',
                        inline: false
                    },
                    { 
                        name: '💻 Share Your Setup', 
                        value: setupChannel ? `${setupChannel} - Post pictures of your gaming setup!` : '💻 Share your setup in #setup',
                        inline: false
                    },
                    { 
                        name: '🍕 Food & Drinks', 
                        value: foodChannel ? `${foodChannel} - Share photos of all the tasty things you eat!` : '🍕 Share food pics in #food-drinks',
                        inline: false
                    },
                    { 
                        name: '🎬 Media & Clips', 
                        value: mediaChannel ? `${mediaChannel} - Share funny clips and photos here!` : '🎬 Share media in #media',
                        inline: false
                    },
                    { 
                        name: '✅ Verify', 
                        value: verifyChannel ? `${verifyChannel} - Click the verify button to get full access!` : '✅ Please verify yourself',
                        inline: false
                    },
                    { 
                        name: '🎮 Start Exploring', 
                        value: 'Now you can explore the server on your own! Check out all the channels and join the fun! 🚀',
                        inline: false
                    }
                )
                .setThumbnail(member.guild.iconURL())
                .setFooter({ text: 'Welcome to the community! 🎉' })
                .setTimestamp();

            await welcomeChannel.send({ 
                content: `${member.user}`,
                embeds: [welcomeEmbed] 
            });
        }

        // Send verification DM
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`✅ Welcome to ${member.guild.name}!`)
                .setDescription(`Please verify yourself to access the server!`)
                .addFields(
                    { name: 'How to Verify', value: verifyChannel ? `Go to ${verifyChannel} and click the verify button` : 'Go to #verify channel' },
                    { name: 'Rules', value: rulesChannel ? `Please read ${rulesChannel}` : 'Please read the rules' }
                );
            
            await member.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`Could not send DM to ${member.user.tag}`);
        }
    }
};