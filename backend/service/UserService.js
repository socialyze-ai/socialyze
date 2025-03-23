function getChannelToShow (channelName, channelInfo) {

    channelInfo = JSON.parse(channelInfo);
    let channelInfoToShow = {}
    if (channelName == "facebook") {
        channelInfoToShow.channelId   = channelInfo.id
        channelInfoToShow.channelName = channelName
        channelInfoToShow.userName    = channelInfo.pageName
        channelInfoToShow.profilePic  = channelInfo.picture.data.url
    }

    if (channelName == "instagram") {
        channelInfoToShow.channelId   = channelInfo.id
        channelInfoToShow.channelName = channelName
        channelInfoToShow.userName    = channelInfo.pageName
        channelInfoToShow.profilePic  = channelInfo.picture
    }

    if (channelName == "x") {
        channelInfoToShow.channelId   = channelInfo.userId
        channelInfoToShow.channelName = channelName
        channelInfoToShow.userName    = channelInfo.displayName
        channelInfoToShow.profilePic  = channelInfo.profilePic
    }

    if (channelName == "linkedin") {
        channelInfoToShow.channelId   = channelInfo.sub
        channelInfoToShow.channelName = channelName
        channelInfoToShow.userName    = channelInfo.name
        channelInfoToShow.profilePic  = channelInfo.picture
    }

  return channelInfoToShow;
}

module.exports = {
    getChannelToShow
};