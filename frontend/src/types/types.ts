export interface Post {
    channelId: string;
    userId: string;
    creationDate: Date;
    scheduledTime: Date;
    type: string;
    caption: string;
    images: string;
  }