import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { UpdateLabelDto } from './dto/updateLabel.dto';
import { CreateLabelDto } from './dto/createLabel.dto';
import { LabelService } from './label.service';

@Controller('label')
@UseInterceptors(AuthInterceptor)
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  create(@Body() createLabelDto: CreateLabelDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.labelService.create(createLabelDto, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.labelService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labelService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
    return this.labelService.update(id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labelService.remove(id);
  }
}
