import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './post.model';
import { Model, Types } from 'mongoose';
import { PostDto } from './dto/post.dto';
import { PublishDto } from './dto/publish.dto';
import { FacebookService } from '../service/facebook.service';
import { InstagramService } from '../service/instagram.service';
import { XService } from '../service/x.service';
import { GetPostsRequestDto } from './dto/getPostsRequest.dto';
import { GetPostResponseDto } from './dto/getPostsResponse.dto';
import axios from 'axios';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
    private readonly xService: XService,
  ) {}

  async createPosts(postDtos: PostDto[], userId: string) {
    try {
      const postsToCreate = postDtos.map((postDto) => ({
        ...postDto,
        createdBy: new Types.ObjectId(userId),
        channelId: new Types.ObjectId(postDto.channelId),
        label: postDto.label.map((labelId) => new Types.ObjectId(labelId)),
      }));

      const createdPosts = await this.postModel.create(postsToCreate);

      for (const post of createdPosts) {
        if (post.postType === 'postnow') {
          post.scheduledTime = new Date();
        }

        const scheduled = await axios.post(
          `${process.env.SCHEDULER_URL}/schedule`,
          {
            accessToken: process.env.SCHEDULER_ACCESS_TOKEN,
            backendUrl: `${process.env.BACKEND_URL}/post/publish`,
            timestamp: post.scheduledTime,
            postId: post._id,
          },
        );

        console.log('scheduled', scheduled.data);
        if (scheduled.data.success) {
          post.postStatus = 'queued';
        } else {
          post.postStatus = 'failed';
          post.failedReason = 'Failed to queue post';
        }
        post.jobId = scheduled.data.jobId;
        await post.save();
        // await this.publish({ postId: post._id }, userId);
      }

      return createdPosts;
    } catch (error) {
      let message;
      if (error?.response?.data?.message) {
        message = error.response.data.message;
        console.error('Error message:', message);
      } else {
        message = error.message;
        console.error('Unexpected error:', message);
      }
      throw new InternalServerErrorException({
        success: false,
        message,
      });
    }
  }

  async publish(publishDto: PublishDto) {
    try {
      const { postId, accessToken } = publishDto;

      if (accessToken !== process.env.SCHEDULER_ACCESS_TOKEN) {
        throw new UnauthorizedException('Invalid publish token');
      }

      const post = await this.postModel.findById(postId).exec();
      if (!post) {
        throw new InternalServerErrorException({
          success: false,
          message: `Channel with ID ${post} not found`,
        });
      }

      const handle = post.handle;

      let response: { success?: boolean; postId?: string; postUrl?: string } =
        {};
      if (handle === 'facebook') {
        response = await this.facebookService.publish(post);
      } else if (handle === 'instagram') {
        response = await this.instagramService.publish(post);
      } else if (handle === 'x') {
        response = await this.xService.publish(post);
      }

      if (response.success) {
        post.postStatus = 'published';
        post.postId = response.postId;
        post.postUrl = response.postUrl;
      } else {
        post.postStatus = 'queued';
        post.failedReason = 'Some error';
      }

      await post.save();
    } catch (error) {
      console.error('Publish error:', error);
      throw new InternalServerErrorException({
        success: false,
        message: error.message,
      });
    }
  }

  async getPosts(getPostsRequestDto: GetPostsRequestDto) {
    const { channel, handle, postStatus, label, limit, offset } =
      getPostsRequestDto;

    if (
      limit === undefined ||
      limit < 0 ||
      offset === undefined ||
      offset < 0
    ) {
      throw new BadRequestException(
        'Limit and offset must be non-negative integers',
      );
    }

    const filter: any = {};

    if (channel && channel.length > 0) {
      filter.channelId = {
        $in: channel.map((channel) => new Types.ObjectId(channel)),
      };
    }

    if (handle && handle.length > 0) {
      filter.handle = { $in: handle };
    }

    if (postStatus && postStatus.length > 0) {
      filter.postStatus = { $in: postStatus };
    }

    if (label && label.length > 0) {
      filter.label = { $in: label.map((label) => new Types.ObjectId(label)) };
    }

    const posts = await this.postModel
      .find(filter)
      .skip(offset || 0)
      .limit(limit || 10)
      .exec();

    return posts;
  }
}
