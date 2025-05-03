import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import channelsReducer from "./slices/channels.slice";
import imageEditorReducer from "./slices/imageEditor.slice";
import postCreationReducer from "./slices/postCreation.slice";
import postsReducer from "./slices/posts.slice";
import aiAssistantReducer from "./slices/aiAssistant.slice";
import labelManagerReducer from "./slices/labelManager.slice";
import aiTextareaReducer from "./slices/aiTextarea.slice";
import dashboardPostsReducer from "./slices/dashboardPosts.slice";

const store = configureStore({
  reducer: {
    user: userReducer,
    channels: channelsReducer,
    imageEditor: imageEditorReducer,
    postCreation: postCreationReducer,
    posts: postsReducer,
    aiAssistant: aiAssistantReducer,
    labelManager: labelManagerReducer,
    aiTextarea: aiTextareaReducer,
    dashboardPosts: dashboardPostsReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       // Ignore these action types
  //       ignoredActions: ["postCreation/setScheduledDate", "posts/addPost", "posts/updatePost"],
  //       // Ignore these field paths in the state
  //       ignoredPaths: ["posts.posts", "postCreation.scheduledDate"],
  //     },
  //   }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
