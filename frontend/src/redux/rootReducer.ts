import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import channelsReducer from "./slices/channels.slice";
import imageEditorReducer from "./slices/imageEditor.slice";
import postCreationReducer from "./slices/postCreation.slice";
import postsReducer from "./slices/posts.slice";
import aiAssistantReducer from "./slices/aiAssistant.slice";
import labelManagerReducer from "./slices/labelManager.slice";
import aiTextareaReducer from "./slices/aiTextarea.slice";
import dashboardPostsReducer from "./slices/dashboardPosts.slice";
import authReducer from "./slices/auth.slice";

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  channels: channelsReducer,
  imageEditor: imageEditorReducer,
  postCreation: postCreationReducer,
  posts: postsReducer,
  aiAssistant: aiAssistantReducer,
  labelManager: labelManagerReducer,
  aiTextarea: aiTextareaReducer,
  dashboardPosts: dashboardPostsReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  if (action.type === "auth/logout") {
    state = undefined; // Clear Redux state
  }
  return appReducer(state, action);
};

export default rootReducer;
