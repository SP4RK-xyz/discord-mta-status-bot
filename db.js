const { Sequelize, Op, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('admin_mtabot', 'admin_mtabot', 'WTVcG3Rxyh', {
    dialect: 'mysql',
    host: '127.0.0.1'
});

const Server = sequelize.define('Server', {
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gid: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    cid: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    mid: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'Server'
});

/* sequelize.sync({force: true}); */

exports.addServer = async function (ip, port, guildid, channelid, messageid) {
    const row = await Server.create({
        address: ip,
        port: port,
        gid: guildid,
        cid: channelid,
        mid: messageid,
    });
}

exports.deleteServer = async function (id) {
    Server.destroy({
        where: {
            id: id
        }
    })
}

exports.getAllServers = async function () {
    const servers = await Server.findAll();
    return servers;
}

exports.getGuildServerCount = async function (gid) {
    const servers = await Server.findAll({
        where: {
          gid: gid
        }
      });
    return servers.length;
}