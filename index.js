const db = require('./db.js');
const game = require('./game.js');

const Discord = require('discord.js');
const client = new Discord.Client();
prefix = "mta!"

function isset(foo) {
    if (typeof foo != 'undefined') {
        return true;
    } else {
        return false;
    }
}

function sleep (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function delayDelete (message, time) {
    if (isset(time)) {
        await sleep(time);
    } else {
        await sleep(5000);
    }
    message.delete();
}

function pad_with_zeroes(number, length) {

    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }

    return my_string;

}

function validateIpAndPort(input) {
    var parts = input.split(":");
    var ip = parts[0].split(".");
    var port = parts[1];
    return validateNum(port, 1, 65535) &&
        ip.length == 4 &&
        ip.every(function (segment) {
            return validateNum(segment, 0, 255);
        });
}

function validateNum(input, min, max) {
    var num = +input;
    return num >= min && num <= max && input === num.toString();
}


client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {
        if (message.channel.type == "dm") {
            message.channel.send(':no_entry_sign: Ezt a parancsot csak szerveren használhatod!');
            return;
        }

        message.channel.send(":question: Segítség\n**Szerverstátusz létrehozása:** `mta!add <ip:port>` (Csak adminisztrátor)")
    }

    if (command === 'add') {
        if (message.channel.type == "dm") {
            message.channel.send(':no_entry_sign: Ezt a parancsot csak szerveren használhatod!');
            return;
        }

        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.channel.send(':no_entry_sign: Ezt a parancsot csak adminisztrátor használhatja!');
            return;
        }

        if (!args[0]) {
            message.channel.send(':no_entry_sign: Hibás adatok! Helyes használat:\n`mta!add <ip:port>`');
            return;
        }

        checkAddServerData(args[0], message).then(checkresult => {
            message.channel.send("Szerver hozzáadva! :white_check_mark:\nInformációk frissítése... (max. 30 másodperc)").then((message) => {
                db.addServer(checkresult[0], checkresult[1], message.guild.id, message.channel.id, message.id)
            })
            message.delete()
        }).catch((err) => {
            message.channel.send(err)
        })
    }
});

client.on('ready', () => {
    client.user.setActivity("mta!help | mtadev.xyz | "+client.guilds.cache.size+" szerveren", {
        type: "WATCHING",
    });
});

setInterval(async function(){ 
    servers = await db.getAllServers();
    servers.forEach(async (s) => {
        chl = client.channels.cache.get(s.cid)
        if (chl) {
            chl.messages.fetch(s.mid)
            .then(async (msg) => {
                const fetchedMsg = msg
                var embed = new Discord.MessageEmbed()
                fetchedMsg.edit("Frissítés...");
                await game.getServerInfo(s.address, s.port).then((state) => {
                    embed.setAuthor(s.address+":"+s.port, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LACMTA_Circle_Green_Line.svg/600px-LACMTA_Circle_Green_Line.svg.png", "http://dcbot.mtadev.xyz/connect.php?address="+state.connect)
                    embed.setColor("#32a83e")
                    embed.setDescription(state.name)
    
                    passwd = ""
                    if (state.password) {
                        passwd = " 🔒"
                    }
    
                    embed.setTitle(state.raw.numplayers +"/"+ state.maxplayers + passwd)
                }).catch((error) => {
                    embed.setAuthor(s.address+":"+s.port, "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LACMTA_Circle_Red_Line.svg/600px-LACMTA_Circle_Red_Line.svg.png")
                    embed.setColor("#a83232")
                    embed.setTitle("Offline")
                });
                var date = new Date();
                embed.setFooter("Frissítve: " + date.getFullYear().toString() +". "+ pad_with_zeroes(date.getMonth(), 2).toString() +". "+ pad_with_zeroes(date.getDate(), 2).toString() +". "+ pad_with_zeroes(date.getHours(), 2).toString() +":"+ pad_with_zeroes(date.getMinutes(), 2).toString() )
                fetchedMsg.edit(embed);
                fetchedMsg.edit("");
            }).catch((error) => {
                db.deleteServer(s.id)
            }); 
        } else {
            db.deleteServer(s.id)
        }               
    });
}, 15000);

function checkAddServerData (ip, message) {
    return new Promise(async (resolve, reject) => {
        if (!validateIpAndPort(ip)) {
            reject(":no_entry_sign: Hibás cím!")
        }

        count = await db.getGuildServerCount(message.guild.id);
        console.log(count)
        if (count >= 5) {
            reject(":no_entry_sign: Maximum 5 szervert monitorozhatsz egy szerveren!")
        }

        addr = ip.split(":")
        resolve(addr);
    })
}

client.login('Njk5NzQyNTk3MTE5MzQ0NzEy.XpY0Ew.m3iXBDQCXHtMh4FkkYTZfz7d2B0');