import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/createTags.dto';
import { UpdateTagDto } from './dto/updateTag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tags } from './tags.model';
import { Model } from 'mongoose';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tags.name)
    private readonly tags: Model<Tags>,
  ) {}

  create(createTagDto: CreateTagDto, userId: string) {
    return this.tags.create({
      ...createTagDto,
      createdBy: userId,
    });
  }

  findAll(userId: string) {
    return this.tags.find({ createdBy: userId });
  }

  findOne(id: string) {
    return this.tags.findById(id);
  }

  update(id: string, updateTagDto: UpdateTagDto) {
    return this.tags.findByIdAndUpdate(id, updateTagDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.tags.findByIdAndDelete(id);
  }
}
