//This bot is custom made for a server. Figure out the variables yourself
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');

bot.login(config.BOT_TOKEN);

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

function _calculateage(birthday){
    var agedifMs = Date.now() - birthday;
    var ageDate = new Date(agedifMs);
    return Math.abs(ageDate.getUTCFullYear() -1970);
}

async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}  

bot.on('voiceStateUpdate', async (oldState, newState) => {

    var movedLog = await newState.guild.fetchAuditLogs({type: 'MEMBER_MOVE', user: newState.user}).then(audit => audit.entries.first());
    var discLog = await newState.guild.fetchAuditLogs({type: 'MEMBER_DISCONNECT', user: newState.user}).then(audit => audit.entries.first());

    if (newState.channel != null) {
        if (newState.channel.parent === newState.guild.channels.cache.find(c => c.name == "Temp ✪ ════════════════" && c.type == "category")) {
            await newState.member.roles.add(newState.guild.roles.cache.find(role => role.name === "vc"));
        }
    }

    if(newState.channel === null) {
        await newState.member.roles.remove(newState.guild.roles.cache.find(role => role.name === "vc"));
    }

    if (oldState.channel != null) {
        if (oldState.channel.parent === oldState.guild.channels.cache.find(c => c.name == "Temp ✪ ════════════════" && c.type == "category")) {
            if(oldState.channel.members.size === 0) {
                await oldState.channel.delete();
            }           
        }
    }

    var member = newState.member;
    var oldChannel = oldState.channel;
    var newChannel = newState.channel;
    var date = new Date();
    var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    if (newChannel != null && oldChannel != null && newChannel != oldChannel) {
        if(Date.now() - movedLog.createdTimestamp < 1000) {
            var exec = movedLog.executor;
            if (member.user != exec){
                var logEmbed = new Discord.MessageEmbed().setColor("#00e584").setTitle("Member Moved")
                                    .setDescription(":microphone2: Member: <@" + member.user + ">" + " was moved to **"+ newChannel.name +"** from **" + oldChannel.name + "** by " + "<@" + exec + "> \n Today at " + time);
            await bot.channels.cache.find(ch => ch.id === "788812823471718410").send(logEmbed);
            }
        }
    }


    if (newChannel === null && oldChannel != null) {
        if (Date.now() - discLog.createdTimestamp < 1000) {
            var exec = discLog.executor;
            if (member.user != exec){
                var logEmbed = new Discord.MessageEmbed().setColor("#00e584").setTitle("Member Disconnected")
                                    .setDescription(":microphone2: Member: <@" + member.user + ">" + " was disconnected from **" + oldChannel.name + "** by " + "<@" + exec + "> \n Today at " + time);
            await bot.channels.cache.find(ch => ch.id === "788812823471718410").send(logEmbed);
            }
        }
    }
     
});


bot.on('message', async msg => {

    var text = msg.content;
    text = text.toLowerCase();

    if(msg.channel.name === 'bots') {
        if(text.substring(0,1) === '.') {
            var split = text.split(" ");
            if(split[0] === '.cv') {
                var vcName = text.substring(split[0].length + 1);
                var muted = msg.guild.roles.cache.find(role => role.name === 'muted');
                var admin = msg.guild.roles.cache.find(role => role.name === 'admin');               
                var kmem = msg.member;
                var category = msg.guild.channels.cache.find(c => c.name == "Temp ✪ ════════════════" && c.type == "category");
                try {
                    msg.guild.channels.create(vcName, {type: 'voice',
                    permissionOverwrites: [
                        {
                          id: muted.id,
                          deny: ['VIEW_CHANNEL']
                        }, {
                          id: admin.id,
                          allow: ['MANAGE_CHANNELS']
                        }, {
                            id: msg.member.id,
                            allow: ['MANAGE_CHANNELS']
                        },
                      ], parent: category.id})
                      .then(vc => {msg.member.voice.setChannel(vc)});
                }
                    catch(err) {
                }
            }
        }
    }

    if(msg.channel.name==='core') {
        if(text.substring(0,1) === '.') {
            const Role = msg.guild.roles.cache.find(role => role.name === 'unverified');

            if(text === '.kickunverified') {                             
                const unvfMembers = msg.guild.roles.cache.get(Role.id).members.map(m=>m.user);
                var yeeted = 0;
                for (i = 0; i < unvfMembers.length; i++) {
                    try {
                        const kmem = msg.guild.members.resolve(unvfMembers[i]);
                        var timediff = Date.now() - kmem.joinedAt.getTime();
                        var daydiff = timediff/(1000*60*60*24);

                        if(daydiff >= 14) {
                            await msg.client.users.cache.get(unvfMembers[i].id).send("Hello! We're glad you decided to give Noir 18+ a try,"+
                                    " though it seems you were unable to verify within 14 days. \n"+
                                    "We like to ensure that all of our members are active and partaking in the community, so that what you see, is what you get.\n\n"+

                                    "We hope you'll come back when you're ready to verify that you are over 18!\n\nhttps://discord.gg/noir18" );
                            await kmem.kick('unverified for 14 days');
                            yeeted += 1;
                        }                       
                    } catch (error) {
                        console.log(error);
                    }                    
                    await sleep(1000);            
                }           
                await msg.reply(new Discord.MessageEmbed().setColor("#00e584").setDescription("Kicked members: " + yeeted));
            }

            if(text === '.unvfkickcheck') {
                const unvfMembers = msg.guild.roles.cache.get(Role.id).members.map(m=>m.user);
                var yeeted = 0;
                for (i = 0; i < unvfMembers.length; i++) {
                    const kmem = msg.guild.members.resolve(unvfMembers[i]);
                    var timediff = Date.now() - kmem.joinedAt.getTime();
                    var daydiff = timediff/(1000*60*60*24);

                    if(daydiff >= 14) {
                        yeeted += 1;                        
                    }
                }
                await msg.reply(new Discord.MessageEmbed().setColor("#00e584").setDescription("14 day old unverified member count: " + yeeted));
            }
            if(text === '.pruneunvfcheck') {                
               var pruned = await msg.guild.members.prune({dry: true, days: 14, roles: [Role.id] });
               msg.reply(new Discord.MessageEmbed().setColor("#00e584").setDescription('This will prune ' + pruned + ' users.'));
            }
            if(text === '.pruneunvf') {                
                var pruned = msg.guild.members.prune({ days: 14, roles: [Role.id] });
                msg.reply(new Discord.MessageEmbed().setColor("#00e584").setDescription(pruned + ' users pruned.'));
            }
        }
    }


    if(msg.channel.name === 'cmd' || 'op' || 'core' || 'casshole') {
    	if(text.substring(0,1) === '.') {
    		var split = text.split(" ");

            if(split[0] === ".rp") {
                var rolename = text.substring(split[0].length + 1);
                var role = msg.guild.roles.cache.find(role => role.name === rolename);            
                var nr = await role.setMentionable(!role.mentionable);
                if(nr.mentionable) {
                    msg.channel.send(role.name + " is now mentionable");
                } else {
                    msg.channel.send(role.name + " is no longer mentionable");
                }
            }

    		if(split.length < 3) return;
            if(split[0] === ".vm" || split[0] === ".vf") {
                msg.guild.members.fetch(split[1])
                    .then(async member => {
                        var age = _calculateage(Date.parse(split[2]));
                        if(split[0] === ".vm") {
                            if(split[2].length != 10) msg.reply("invalid date of birth given. Please try again");
                            else {
                                if (age >= 21){
                                    await member.roles.add(msg.guild.roles.cache.find(role => role.name === "21+"));
                                }
                                await member.roles.add(msg.guild.roles.cache.find(role => role.name === "verified"));
                                await member.roles.remove(msg.guild.roles.cache.find(role => role.name === "unverified"));
                                await msg.reply(new Discord.MessageEmbed().setColor("#00e584").setDescription("Member: <@" + member + "> has been verified"));

                                var verificationEmbed = new Discord.MessageEmbed().setColor("#00e584").setTitle("Member Verified")
                                .setDescription("Member: <@" + member + ">" + "\nDate of Birth: " + split[2].substring(0,2) + "/" + split[2].substring(3,5) + "/" +split[2].substring(6,10) + "\nVerified By: <@" + msg.author +">");
                                await bot.channels.cache.find(ch => ch.name === "verified").send(verificationEmbed);
                                await bot.channels.cache.find(ch => ch.id === "788732743953285142").send("Welcome <@" + member + "> to Noir! Please read our <#788794595878240297> and grab some <#788794622633181245>! Feel free to join our voice chats to get to know us!");
                            }
                        }
                        if(split[0] === ".vf") {
                            if(split[2].length != 10) msg.reply("invalid date of birth given. Please try again");
                            else {
                                if (age >= 21){
                                   await member.roles.add(msg.guild.roles.cache.find(role => role.name === "21+"));
                                }
                                await member.roles.add(msg.guild.roles.cache.find(role => role.name === "verified"));
                                await member.roles.add(msg.guild.roles.cache.find(role => role.name === "associate"));
                                await member.roles.remove(msg.guild.roles.cache.find(role => role.name === "unverified"));
                                await msg.reply(new Discord.MessageEmbed().setColor("#00e584").setDescription("Member: <@" + member + "> has been verified"));

                                var verificationEmbed = new Discord.MessageEmbed().setColor("#00e584").setTitle("Member Verified")
                                .setDescription("Member: <@" + member + ">" + "\nDate of Birth: " + split[2].substring(0,2) + "/" + split[2].substring(3,5) + "/" +split[2].substring(6,10) + "\nVerified By: <@" + msg.author +">");
                                await bot.channels.cache.find(ch => ch.name === "verified").send(verificationEmbed);
                                await bot.channels.cache.find(ch => ch.id === "788732743953285142").send("Welcome <@" + member + "> to Noir! Please read our <#788794595878240297> and grab some <#788794622633181245>! Feel free to join our voice chats to get to know us!");
                            }
                        }                       
                    })
                    .catch(async error => {
                        await msg.reply("invalid user ID. Please try again");
                        console.error;
                    });
            }
    	}
    }
});