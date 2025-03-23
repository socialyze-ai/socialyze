module.exports = (sequelize, DataTypes) => {
    const Channel = sequelize.define("Channel", {
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channelName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        accessInfo: {
            type: DataTypes.STRING(5000),
            allowNull: true
        },
    });

    return Channel;
}