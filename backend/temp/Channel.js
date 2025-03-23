module.exports = (sequelize, DataTypes) => {
    const Channel = sequelize.define("Channel", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userCount: {
            type: DataTypes.NUMBER,
            allowNull: false
        },
        createdDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });

    // Channel.associate = function (models) {
    //     Channel.belongsToMany(models.User, {through: UserChannel});
    // }

    return Channel;
}