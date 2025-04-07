// src/hashtagManager/hashtagManager.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { HashtagManagerService } from './hashtagManager.service';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { CreateHashtagManagerDto } from './dto/createHashtagManager.dto';
import { UpdateHashtagManagerDto } from './dto/updateHashtagManager.dto';

@Controller('hashtagManager')
@UseInterceptors(AuthInterceptor)
export class HashtagManagerController {
  constructor(private readonly service: HashtagManagerService) {}

  @Post()
  create(
    @Body() createHashtagManagerDto: CreateHashtagManagerDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.service.create(createHashtagManagerDto, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHashtagManagerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
