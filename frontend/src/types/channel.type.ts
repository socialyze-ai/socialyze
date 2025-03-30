import { SocialMediaHandle } from "./socialMediaHandle.enum";

export interface Channel {
  handle: SocialMediaHandle;
  user: string;
  workspace: string;
  accesstoken: string;
  refreshtoken: string;
  channelId: string;
  channelName: string;
  channelPicture?: string;
  expireIn?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
