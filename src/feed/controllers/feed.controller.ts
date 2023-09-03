import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { Role } from '../../auth/models/role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { IsCreatorGuard } from '../guards/is-creator.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  findSelected(
    @Query('take') take: number = 1,
    @Query('skip') skip: number = 1,
  ): Observable<FeedPost[]> {
    take = take > 2 ? 2 : take;
    return this.feedService.findPosts(take, skip);
  }

  @Roles(Role.ADMIN)
  // @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() post: FeedPost, @Request() req) {
    return this.feedService.createPost(req.user, post);
  }

  // @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() feedPost: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  // @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }
}
