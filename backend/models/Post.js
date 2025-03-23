module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", {
        channelId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        scheduledTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        caption: {
            type: DataTypes.STRING,
            allowNull: true
        },
        images: {
            type: DataTypes.STRING,
            allowNull: true
        }
        
    });

    return Post;
}