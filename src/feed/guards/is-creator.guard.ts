import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, map, switchMap } from 'rxjs';
import { FeedService } from '../services/feed.service';
import { User } from '../../auth/models/user.class';
import { FeedPost } from '../models/post.interface';
import { UserService } from '../../auth/services/user.service';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private readonly feedService: FeedService,
    private readonly userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;

    if (!user || !params) return false;

    if (user.role === 'admin') return true; // allows admins to get make request

    const userId = user.id;
    const feedId = params.id;

    // Determine if logged-in user is the same as the user that created the feed post
    return this.userService.findUserById(userId).pipe(
      switchMap((user: User) =>
        this.feedService.findPostById(feedId).pipe(
          map((feedPost: FeedPost) => {
            const isAuthor = user.id === feedPost.author.id;
            return isAuthor;
          }),
        ),
      ),
    );
  }
}
