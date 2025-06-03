import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { TemplateService } from './template.service';

import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { CreateFontTemplatesDto } from './dto/createFontTemplates.dto';
import { CreatePostTemplateDto } from './dto/createPostTemplate.dto';
import { GetPostTemplatesDto } from './dto/getPostTemplates.dto';
import { CreatePostCategoryTemplateDto } from './dto/createPostCategoryTemplate.dto';
import { GetPostCategoryTemplateDto } from './dto/getPostCategoryTemplates.dto';
import { GetFontTemplatesDto } from './dto/getFontTemplates.dto';

@Controller('template')
@UseInterceptors(AuthInterceptor)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('createFontTemplates')
  createFontTemplates(@Body() createFontTemplatesDto: CreateFontTemplatesDto) {
    return this.templateService.createFontTemplates(createFontTemplatesDto);
  }

  @Post('getFontTemplates')
  getFonts(@Body() getFontTemplatesDto: GetFontTemplatesDto) {
    return this.templateService.getFontTemplates(getFontTemplatesDto);
  }

  @Post('createPostCategoryTemplates')
  createPostCategoryTemplates(
    @Body() createPostCategoryTemplateDto: CreatePostCategoryTemplateDto,
  ) {
    return this.templateService.createPostCategoryTemplates(
      createPostCategoryTemplateDto,
    );
  }

  @Post('getPostCategoryTemplates')
  getPostCategoryTemplates(
    @Body() getPostCategoryTemplateDto: GetPostCategoryTemplateDto,
  ) {
    return this.templateService.getPostCategoryTemplates(
      getPostCategoryTemplateDto,
    );
  }

  @Post('createPostTemplatesDefault')
  createPostTemplatesDefault(
    @Body() createPostTemplateDto: CreatePostTemplateDto,
  ) {
    return this.templateService.createPostTemplatesDefault(
      createPostTemplateDto,
    );
  }

  @Post('createPostTemplatesCustom')
  createPostTemplates(
    @Body() createPostTemplateDto: CreatePostTemplateDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.templateService.createPostTemplatesCustom(
      createPostTemplateDto,
      userId,
    );
  }

  @Post('getPostTemplatesDefault')
  getPostTemplatesDefault(@Body() getPostTemplatesDto: GetPostTemplatesDto) {
    return this.templateService.getPostTemplatesDefault(getPostTemplatesDto);
  }

  @Post('getPostTemplatesCustom')
  getPostTemplatesCustom(
    @Body() getPostTemplatesDto: GetPostTemplatesDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.templateService.getPostTemplatesCustom(
      getPostTemplatesDto,
      userId,
    );
  }
}
