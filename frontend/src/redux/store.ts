import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import channelsReducer from "./slices/channels.slice";
import imageEditorReducer from "./slices/imageEditor.slice";
import postCreationReducer from "./slices/postCreation.slice";
import postsReducer from "./slices/posts.slice";
import aiAssistantReducer from "./slices/aiAssistant.slice";
const store = configureStore({
  reducer: {
    user: userReducer,
    channels: channelsReducer,
    imageEditor: imageEditorReducer,
    postCreation: postCreationReducer,
    posts: postsReducer,
    aiAssistant: aiAssistantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
