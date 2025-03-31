import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel } from "../../types/channel.type";

interface ChannelState {
  channels: Channel[];
}

const initialState: ChannelState = {
  channels: [],
};

const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    addChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    updateChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload.map((channel) => ({ ...channel, updatedAt: new Date() }));
    },
    removeChannel: (state, action: PayloadAction<string>) => {
      state.channels = state.channels.filter((channel) => channel.channelId !== action.payload);
    },
    clearChannels: (state) => {
      state.channels = [];
    },
  },
});

export const { addChannels, updateChannels, removeChannel, clearChannels } = channelsSlice.actions;
export default channelsSlice.reducer;
