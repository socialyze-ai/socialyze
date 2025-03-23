const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

module.exports = {

    //Facebooks URLs
    FACEBOOK: {
        CLIENT_ID: "279523431530701",
        CLIENT_SECRET: "a90bf18ae967cc3c22cce45953bf2583",
        CALLBACK_URL: `${config.backendUrl}/connect/facebook2/callback`,
    },

    INSTAGRAM: {
        CLIENT_ID: "279523431530701",
        CLIENT_SECRET: "a90bf18ae967cc3c22cce45953bf2583",
        CALLBACK_URL: `${config.backendUrl}/connect/instagram2/callback`,
    },
    CLIENT_ID: "279523431530701",
    CLIENT_SECRET: "a90bf18ae967cc3c22cce45953bf2583",
    LONG_LIVE_TOKEN_URL: "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&fb_exchange_token=SHORT_LIVE_TOKEN",
    GET_USER_ID_URL: "https://graph.facebook.com/v18.0/me?access_token=LONG_LIVE_TOKEN",
    GET_PAGE_LIST_URL: "https://graph.facebook.com/v18.0/USER_ID/accounts?fields=name,access_token,picture&access_token=LONG_LIVE_TOKEN",

    POST_CONTENT: "https://graph.facebook.com/PAGE_ID/feed?message=MESSAGE&access_token=LONG_LIVE_TOKEN",

    //Intagram URLs
    INSTA_GET_PAGE_ID_URL: "https://graph.facebook.com/v18.0/PAGE_ID?fields=instagram_business_account&access_token=LONG_LIVE_TOKEN",
    INSTA_GET_PROFILE_URL: "https://graph.facebook.com/v18.0/INSTA_PAGE_ID?fields=username,profile_picture_url&access_token=LONG_LIVE_TOKEN",

    INSTA_CREATE_CONTAINER: "https://graph.facebook.com/v18.0/INSTA_PAGE_ID/media?image_url=IMAGE_URL",
    INSTA_PUBLISH_CONTAINER: "",

    TWITTER: {
        CONSUMER_KEY: '9ZXcw6ar8vQ4SLE0KJj7qsQEX',
        CONSUMER_SECRET: 'ohlIakrkJrq5FmHAKO849Ss3ycKf7bt9gf51ydHFrwte05CnQd',
        CALLBACK_URL: `${config.backendUrl}/connect/twitter/callback`,
    },

    LINKED_IN: {
        CLIENT_ID: '77uugf94vudepu',
        CLIENT_SECRET: 'yWyEm3vNJDDhekSq',
        CALLBACK_URL: `${config.backendUrl}/connect/linkedin/callback`,
        SCOPE: 'openid profile email w_member_social'
    },


};