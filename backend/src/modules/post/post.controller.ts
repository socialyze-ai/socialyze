import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { PostDto } from './dto/post.dto';
import { PublishDto } from './dto/publish.dto';
import { GetPostsRequestDto } from './dto/getPostsRequest.dto';

@UseInterceptors(AuthInterceptor)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseInterceptors(AuthInterceptor)
  @Post()
  async post(@Body() postDtos: PostDto[], @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.createPosts(postDtos, userId);
  }

  @UseInterceptors(AuthInterceptor)
  @Post('publish')
  async publish(@Body() publishDto: PublishDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.publish(publishDto, userId);
  }

  @UseInterceptors(AuthInterceptor)
  @Post('getPosts')
  async getPosts(
    @Body() getPostsRequestDto: GetPostsRequestDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.postService.getPosts(getPostsRequestDto);
  }
}
