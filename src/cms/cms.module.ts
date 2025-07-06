import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [
    CategoriesController,
    PostsController,
    TagsController,
    AttachmentsController,
  ],
  providers: [
    CategoriesService,
    PostsService,
    TagsService,
    AttachmentsService,
    PrismaService,
  ],
  exports: [CategoriesService, PostsService, TagsService, AttachmentsService],
})
export class CmsModule {}
