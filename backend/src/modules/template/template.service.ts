import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemplateFont, TemplateFontDocument } from './model/templateFont.model';
import { TemplatePost, TemplatePostDocument } from './model/templatePost.model';
import {
  TemplatePostCategory,
  TemplatePostCategoryDocument,
} from './model/templatePostCategories.model';
import { CreateFontTemplatesDto } from './dto/createFontTemplates.dto';
import { CreatePostTemplateDto } from './dto/createPostTemplate.dto';
import { GetPostTemplatesDto } from './dto/getPostTemplates.dto';
import { CreatePostCategoryTemplateDto } from './dto/createPostCategoryTemplate.dto';
import { GetPostCategoryTemplateDto } from './dto/getPostCategoryTemplates.dto';
import { GetFontTemplatesDto } from './dto/getFontTemplates.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(TemplateFont.name)
    private fontModel: Model<TemplateFontDocument>,

    @InjectModel(TemplatePost.name)
    private postTemplateModel: Model<TemplatePostDocument>,

    @InjectModel(TemplatePostCategory.name)
    private postCategoryModel: Model<TemplatePostCategoryDocument>,
  ) {}

  async createFontTemplates(createFontTemplatesDto: CreateFontTemplatesDto) {
    const fontDocs = createFontTemplatesDto.fonts.map((font) => ({
      name: font,
    }));
    return this.fontModel.insertMany(fontDocs);
  }

  async getFontTemplates(getFontTemplatesDto: GetFontTemplatesDto) {
    const { limit, offset } = getFontTemplatesDto;
    const fonts = await this.fontModel
      .find({})
      .skip(offset)
      .limit(limit)
      .lean();

    return fonts.map((font) => font.name);
  }

  async createPostTemplatesDefault(
    createPostTemplateDto: CreatePostTemplateDto,
  ) {
    return this.postTemplateModel.create(createPostTemplateDto);
  }

  async createPostTemplatesCustom(
    createPostTemplateDto: CreatePostTemplateDto,
    userId: string,
  ) {
    return this.postTemplateModel.create({
      ...createPostTemplateDto,
      user: new Types.ObjectId(userId),
    });
  }

  async createPostCategoryTemplates(
    createPostCategoryTemplateDto: CreatePostCategoryTemplateDto,
  ) {
    return this.postCategoryModel.create(createPostCategoryTemplateDto);
  }

  async getPostCategoryTemplates(
    getPostCategoryTemplateDto: GetPostCategoryTemplateDto,
  ) {
    return this.postCategoryModel
      .find({ handle: getPostCategoryTemplateDto.handle })
      .lean();
  }

  async getPostTemplatesDefault(getPostTemplateDto: GetPostTemplatesDto) {
    return this.postTemplateModel
      .find({
        type: 'default',
        postCategory: getPostTemplateDto.postCategory,
      })
      .lean();
  }

  async getPostTemplatesCustom(
    getPostTemplateDto: GetPostTemplatesDto,
    userId: string,
  ) {
    return this.postTemplateModel
      .find({
        type: 'custom',
        postCategory: getPostTemplateDto.postCategory,
        user: new Types.ObjectId(userId),
      })
      .lean();
  }
}
