import { IsMongoId } from 'class-validator';

export class GetPostTemplatesDto {
  @IsMongoId()
  postCategory: string;
}
