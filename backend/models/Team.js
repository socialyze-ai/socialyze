module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define("Team", {
        teamName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        teamDesc: {
            type: DataTypes.STRING,
            allowNull: true
        },
        teamPic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        owner: {
            type: DataTypes.STRING,
            allowNull: false
        },
        memberList: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });

    return Team;
}