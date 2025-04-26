import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Label } from './label.model';
import { Model } from 'mongoose';
import { UpdateLabelDto } from './dto/updateLabel.dto';
import { CreateLabelDto } from './dto/createLabel.dto';

@Injectable()
export class LabelService {
  constructor(
    @InjectModel(Label.name)
    private readonly label: Model<Label>,
  ) {}

  create(createTagDto: CreateLabelDto, userId: string) {
    return this.label.create({
      ...createTagDto,
      createdBy: userId,
    });
  }

  findAll(userId: string) {
    return this.label.find({ createdBy: userId });
  }

  findOne(id: string) {
    return this.label.findById(id);
  }

  update(id: string, updateTagDto: UpdateLabelDto) {
    return this.label.findByIdAndUpdate(id, updateTagDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.label.findByIdAndDelete(id);
  }
}
