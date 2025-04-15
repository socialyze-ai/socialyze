import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import channelsReducer from "./slices/channels.slice";
import imageEditorReducer from "./slices/imageEditor.slice";
import postCreationReducer from "./slices/postCreation.slice";
import postsReducer from "./slices/posts.slice";
import aiAssistantReducer from "./slices/aiAssistant.slice";
import tagManagerReducer from "./slices/tagManager.slice";

const store = configureStore({
  reducer: {
    user: userReducer,
    channels: channelsReducer,
    imageEditor: imageEditorReducer,
    postCreation: postCreationReducer,
    posts: postsReducer,
    aiAssistant: aiAssistantReducer,
    tagManager: tagManagerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["postCreation/setScheduledDate", "posts/addPost", "posts/updatePost"],
        // Ignore these field paths in the state
        ignoredPaths: ["posts.posts", "postCreation.scheduledDate"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
