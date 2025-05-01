import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { PostDto } from './dto/post.dto';

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
}
