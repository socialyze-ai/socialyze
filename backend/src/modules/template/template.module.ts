import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateFont, TemplateFontSchema } from './model/templateFont.model';
import { TemplatePost, TemplatePostSchema } from './model/templatePost.model';
import {
  TemplatePostCategory,
  TemplatePostCategorySchema,
} from './model/templatePostCategories.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TemplateFont.name, schema: TemplateFontSchema },
      { name: TemplatePost.name, schema: TemplatePostSchema },
      { name: TemplatePostCategory.name, schema: TemplatePostCategorySchema },
    ]),
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
