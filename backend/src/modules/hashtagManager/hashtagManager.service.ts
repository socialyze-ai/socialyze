// src/hashtagManager/hashtagManager.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { HashtagManager } from './hashtagManager.model';
import { CreateHashtagManagerDto } from './dto/createHashtagManager.dto';
import { UpdateHashtagManagerDto } from './dto/updateHashtagManager.dto';

@Injectable()
export class HashtagManagerService {
  constructor(
    @InjectModel(HashtagManager.name)
    private readonly hashtagModel: Model<HashtagManager>,
  ) {}

  create(createHashtagManagerDto: CreateHashtagManagerDto, userId: string) {
    return this.hashtagModel.create({
      ...createHashtagManagerDto,
      createdBy: userId,
    });
  }

  findAll(userId: string) {
    return this.hashtagModel.find({ createdBy: userId });
  }

  findOne(id: string) {
    return this.hashtagModel.findById(id);
  }

  update(id: string, updateHashtagManagerDto: UpdateHashtagManagerDto) {
    return this.hashtagModel.findByIdAndUpdate(id, updateHashtagManagerDto, {
      new: true,
    });
  }

  delete(id: string) {
    return this.hashtagModel.findByIdAndDelete(id);
  }
}
