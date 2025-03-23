module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    });

    User.associate = function (models) {
        //User.belongsToMany(models.Channel, {through: UserChannel});
        // User.hasMany(models.Post, {
        //     foreignKey: 'clubId'
        // });
    }

    return User;
}