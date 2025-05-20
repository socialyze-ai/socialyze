import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {},
  reducers: {
    logout: () => ({}), // only used to trigger reset in rootReducer
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
