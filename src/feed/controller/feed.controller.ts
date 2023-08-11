import { Body, Controller, Post } from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  async create(@Body() post: FeedPost) {
    return this.feedService.createPost(post);
  }
}
