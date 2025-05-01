import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './post.model';
import { Model, Types } from 'mongoose';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  async createPosts(postDtos: PostDto[], userId: string) {
    const postsToCreate = postDtos.map((postDto) => ({
      ...postDto,
      createdBy: new Types.ObjectId(userId),
    }));

    return this.postModel.create(postsToCreate);
  }
}
