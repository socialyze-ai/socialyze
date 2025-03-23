const express = require("express")
const axios = require('axios');
const { Op } = require('sequelize');
const passport = require('passport');
const querystring = require('querystring');

const TwitterStrategy = require('passport-twitter').Strategy;

const connectConstants = require('../constants/connectConstants');
const { updateAccessInfoFacebook, updateAccessInfoInstagram } = require('../service/ConnectService'); // Import the functions
const { getValueFromCookie } = require('../service/CommonService');
const {Channel} = require("../models"); 
const {SessionTable} = require("../models").Session;
const { Session } = require("express-session");
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + './../config/config.json')[env];

const router = express.Router();

// Passport Configuration
passport.use(
  new TwitterStrategy(
    {
      consumerKey:     connectConstants.TWITTER.CONSUMER_KEY,
      consumerSecret:  connectConstants.TWITTER.CONSUMER_SECRET,
      callbackURL:     connectConstants.TWITTER.CALLBACK_URL,
      force_login: true, // Prompt for credentials every time
    },
    (token, tokenSecret, profile, done) => {
      // Store the user's Twitter access token and token secret for future use
      // const userId = req.session.user.id;
      const user = {
        token,
        tokenSecret,
        userId : profile.id,
        username: profile.username,
        displayName: profile.displayName,
        profilePic: profile.photos[0].value
      };
      
      return done(null, user);
    }
  )
);

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// Redirect to Facebook login
router.get('/facebook2', (req, res) => {
  const clientID = connectConstants.FACEBOOK.CLIENT_ID
  const redirectURI = connectConstants.FACEBOOK.CALLBACK_URL
  const authURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientID}&redirect_uri=${redirectURI}&state={"{st=state123abc,ds=123456789}"}`;
  res.redirect(authURL);

});

// Handle the Facebook callback
router.get('/facebook2/callback', async (req, res) => {

  try {
    const { code } = req.query;
    const clientID = connectConstants.FACEBOOK.CLIENT_ID
    const clientSecret = connectConstants.FACEBOOK.CLIENT_SECRET
    const redirectURI = connectConstants.FACEBOOK.CALLBACK_URL
    
    if (!code) {
        res.status(500).send('Error occurred during login');
    } else {
        // Exchange the code for an access token.
        const token = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
          params: {
            client_id: clientID,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
            code,
          },
        });

        // Get the access token from the response.
        const accessToken = token.data.access_token;

        let accessInfo = {}
        accessInfo.shortLivedToken = accessToken
        const userId = req.session.user.id;      

        //Get the long live token
        let longLiveUrl = connectConstants.LONG_LIVE_TOKEN_URL
        longLiveUrl = longLiveUrl.replace("CLIENT_ID",        connectConstants.CLIENT_ID);
        longLiveUrl = longLiveUrl.replace("CLIENT_SECRET",    connectConstants.CLIENT_SECRET);
        longLiveUrl = longLiveUrl.replace("SHORT_LIVE_TOKEN", accessToken);
        const longLivedTokenJson = await axios.get(longLiveUrl); 

        // Set the long Lived Token
        accessInfo.longLivedToken = longLivedTokenJson.data.access_token

        //Get the User Id
        let userIdUrl = connectConstants.GET_USER_ID_URL
        userIdUrl = userIdUrl.replace("LONG_LIVE_TOKEN", accessInfo.longLivedToken);
        const userIdJson = await axios.get(userIdUrl); 

        //Set the User Id and Name
        accessInfo.userId = userIdJson.data.id
        accessInfo.name   = userIdJson.data.name

        //Get page list
        let getPageListUrl = connectConstants.GET_PAGE_LIST_URL
        getPageListUrl = getPageListUrl.replace("USER_ID",         accessInfo.userId);
        getPageListUrl = getPageListUrl.replace("LONG_LIVE_TOKEN", accessInfo.longLivedToken);
        const getPageListJson = await axios.get(getPageListUrl); 

        // Access Page list contains array of list of pages
        // Refer 1 - https://docs.google.com/document/d/16nNg29rItCfFXXZlgHNehawW8SyTmcxig0DEIPG2NcE/edit?addon_store
        //accessInfo.pageList = getPageListJson.data.data
        for (const pages of getPageListJson.data.data) {
          // If Channel already exist for the user
          accessInfo.pageName     = pages.name
          accessInfo.accessToken  = pages.access_token
          accessInfo.picture      = pages.picture
          accessInfo.id           = pages.id

          await Channel.findOne({where: {
            [Op.and]: [ { userId:userId },{ channelName:"facebook" },{ channelId:pages.id }],
          },
          })
          .then((existingChannel) => {
            if (existingChannel) {
                //accessInfo = updateAccessInfoFacebook (accessInfo, JSON.parse(existingChannel.accessInfo))
                Channel.update(
                  { accessInfo:JSON.stringify(accessInfo) },
                  { where: {[Op.and]: [{ userId:userId },{ channelName:"facebook" },{ channelId:pages.id }]}}
                )
                //existingChannel.update({ accessInfo:JSON.stringify(accessInfo) }).then(() => {console.log('Updated');})
            } else {
                Channel.create({userId:userId, channelId:accessInfo.id, channelName:"facebook", accessInfo:JSON.stringify(accessInfo), creationDate: new Date(), modifiedDate: new Date()})
            }
          })
          .catch((error) => {
              console.error('Error checking for user:', error);
          });
        }
        res.redirect(`${config.frontendUrl}/close`);
    }
  }
  catch(error){
    console.error('An error occurred:', error); 
  }
});

// Redirect to Facebook login
router.get('/instagram2', (req, res) => {
  const clientID = connectConstants.INSTAGRAM.CLIENT_ID
  const redirectURI = connectConstants.INSTAGRAM.CALLBACK_URL
  const authURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientID}&redirect_uri=${redirectURI}&state={"{st=state123abc,ds=123456789}"}`;
  res.redirect(authURL);
});

// Handle the Facebook callback
router.get('/instagram2/callback', async (req, res) => {
  const { code } = req.query;
  const clientID = connectConstants.INSTAGRAM.CLIENT_ID
  const clientSecret = connectConstants.INSTAGRAM.CLIENT_SECRET
  const redirectURI = connectConstants.INSTAGRAM.CALLBACK_URL

  if (!code) {
    res.status(500).send('Error occurred during login');
  } 
  else {
    // Exchange the code for an access token.
    const token = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectURI,
        code,
      },
    });

    // Get the access token from the response.
    const accessToken = token.data.access_token;

    let accessInfo = {}
    accessInfo.shortLivedToken = accessToken
    const userId = req.session.user.id;  

    //Get the long live token
    let longLiveUrl = connectConstants.LONG_LIVE_TOKEN_URL
    longLiveUrl = longLiveUrl.replace("CLIENT_ID",        connectConstants.CLIENT_ID);
    longLiveUrl = longLiveUrl.replace("CLIENT_SECRET",    connectConstants.CLIENT_SECRET);
    longLiveUrl = longLiveUrl.replace("SHORT_LIVE_TOKEN", accessToken);
    const longLivedTokenJson = await axios.get(longLiveUrl); 

    // Set the long Lived Token
    accessInfo.longLivedToken = longLivedTokenJson.data.access_token

    //Get the User Id
    let userIdUrl = connectConstants.GET_USER_ID_URL
    userIdUrl = userIdUrl.replace("LONG_LIVE_TOKEN", accessInfo.longLivedToken);
    const userIdJson = await axios.get(userIdUrl); 

    //Set the User Id and Name
    accessInfo.userId = userIdJson.data.id
    accessInfo.name   = userIdJson.data.name

    //Get page list
    let getPageListUrl = connectConstants.GET_PAGE_LIST_URL
    getPageListUrl = getPageListUrl.replace("USER_ID",         accessInfo.userId);
    getPageListUrl = getPageListUrl.replace("LONG_LIVE_TOKEN", accessInfo.longLivedToken);
    const getPageListJson = await axios.get(getPageListUrl); 

    // Access Page list contains array of list of pages
    // Refer 1 - https://docs.google.com/document/d/16nNg29rItCfFXXZlgHNehawW8SyTmcxig0DEIPG2NcE/edit?addon_store
    //accessInfo.pageList = getPageListJson.data.data
    accessInfo.instaPageList = [];
    //Fetch instagram page id for each facebook pages
    for (const pages of getPageListJson.data.data) {
      let instaGetPageIdUrl = connectConstants.INSTA_GET_PAGE_ID_URL
      instaGetPageIdUrl = instaGetPageIdUrl.replace("PAGE_ID",         pages.id);
      instaGetPageIdUrl = instaGetPageIdUrl.replace("LONG_LIVE_TOKEN", accessInfo.longLivedToken);
      const instaGetPageIdJson = await axios.get(instaGetPageIdUrl); 

      //If instagram business account exist then get its details  
      if(instaGetPageIdJson.data.instagram_business_account){
          let instaGetProfileUrl = connectConstants.INSTA_GET_PROFILE_URL
          instaGetProfileUrl = instaGetProfileUrl.replace("INSTA_PAGE_ID",   instaGetPageIdJson.data.instagram_business_account.id);
          instaGetProfileUrl = instaGetProfileUrl.replace("LONG_LIVE_TOKEN", accessInfo.longLivedToken);
          const instaGetProfileJson = await axios.get(instaGetProfileUrl); 

          accessInfo.pageName        = instaGetProfileJson.data.username
          accessInfo.picture         = instaGetProfileJson.data.profile_picture_url
          accessInfo.id              = instaGetProfileJson.data.id
          accessInfo.fbPageRefId     = pages.id
          accessInfo.fbPageRefName   = pages.name
          accessInfo.fbPageRefToken  = pages.access_token

          // If Channel already exist for the user
          await Channel.findOne({where: {
              [Op.and]: [ { userId:userId },{ channelName:"instagram" },{ channelId:accessInfo.id  }],
            },
          })
          .then((existingChannel) => {
            if (existingChannel) {
              //accessInfo = updateAccessInfoInstagram (accessInfo, JSON.parse(existingChannel.accessInfo))
              Channel.update(
                { accessInfo:JSON.stringify(accessInfo) },
                { where: {[Op.and]: [{ userId:userId },{ channelName:"instagram" },{ channelId:accessInfo.id }]}}
              )
            } else {
              Channel.create({userId:userId, channelId:accessInfo.id, channelName:"instagram", accessInfo:JSON.stringify(accessInfo), creationDate: new Date(), modifiedDate: new Date()})
            }
          })
          .catch((error) => {
            console.error('Error checking for user:', error);
          });
      }
    }
    res.redirect(`${config.frontendUrl}/close`);
  }
});

// Twitter authentication starts here
router.get('/twitter', (req, res, next) => {
  passport.authenticate('twitter')(req, res, next);
});

// Twitter callback route
router.get('/twitter/callback',
  passport.authenticate('twitter', { session: false } ),
  async (req, res) => {
    // If Channel already exist for the user
    if(req.user && req.session.user) {
      const userId = req.session.user.id;
      const accessInfo = req.user;

      await Channel.findOne({where: {
          [Op.and]: [ { userId:userId },{ channelName:"x" },{ channelId:accessInfo.userId }],
      },})
      .then((existingChannel) => {
          if (existingChannel) {
              Channel.update(
                  { accessInfo:JSON.stringify(accessInfo) },
                  { where: {[Op.and]: [{ userId:userId },{ channelName:"x" },{ channelId:accessInfo.userId }]}}
                )
              //existingChannel.update({ accessInfo:JSON.stringify(accessInfo) }).then(() => {console.log('Updated');})
          } else {
              Channel.create({userId:userId, channelId:accessInfo.userId, channelName:"x", accessInfo:JSON.stringify(accessInfo), creationDate: new Date(), modifiedDate: new Date()})
          }
      })
      .catch((error) => {
          console.error('Error checking for user:', error);
      });
    }

    res.redirect(`${config.frontendUrl}/close`);
  }
);

// Step 1: Redirect the user to the LinkedIn authorization page
router.get('/linkedin', (req, res) => {
  const authorizeUrl = 'https://www.linkedin.com/oauth/v2/authorization?' +
    querystring.stringify({
      response_type: 'code',
      client_id: connectConstants.LINKED_IN.CLIENT_ID,
      redirect_uri: connectConstants.LINKED_IN.CALLBACK_URL,
      scope: connectConstants.LINKED_IN.SCOPE,
      state: 'YOUR_STATE', // Add a unique state value for security
    });

  res.redirect(authorizeUrl);
});

// Step 2: Handle the LinkedIn callback and exchange the code for an access token
router.get('/linkedin/callback', async (req, res) => {
  const { code, state } = req.query;

  // Validate the state parameter for security
  if (!state || state !== 'YOUR_STATE') {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: connectConstants.LINKED_IN.CALLBACK_URL,
        client_id: connectConstants.LINKED_IN.CLIENT_ID,
        client_secret: connectConstants.LINKED_IN.CLIENT_SECRET,
      },
    });
    const accessToken = tokenResponse.data.access_token;

    // now use the accessToken to make API requests to LinkedIn on behalf of the user

    // Example: Get the user's profile data
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const profileData = profileResponse.data;
    console.log(profileData)

    if(profileData && req.session.user) {
      const userId = req.session.user.id;
      const accessInfo = profileData;

      await Channel.findOne({where: {
          [Op.and]: [ { userId:userId },{ channelName:"linkedin" }, {channelId:accessInfo.sub}],
      },})
      .then((existingChannel) => {
          if (existingChannel) {
              Channel.update(
                  { accessInfo:JSON.stringify(accessInfo) },
                  { where: {[Op.and]: [{ userId:userId },{ channelName:"linkedin" }, {channelId:accessInfo.sub}]}}
                )
              //existingChannel.update({ accessInfo:JSON.stringify(accessInfo) }).then(() => {console.log('Updated');})
          } else {
              Channel.create({userId:userId, channelId:accessInfo.sub, channelName:"linkedin", accessInfo:JSON.stringify(accessInfo), creationDate: new Date(), modifiedDate: new Date()})
          }
      })
      .catch((error) => {
          console.error('Error checking for user:', error);
      });
    }

    res.redirect(`${config.frontendUrl}/close`);
    
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    res.status(500).send('LinkedIn authentication failed');
  }
});





module.exports = router