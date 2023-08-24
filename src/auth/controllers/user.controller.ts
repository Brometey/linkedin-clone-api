import {
  Controller,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  Post,
  Request,
  Res,
  Get,
  Param,
  Put,
  Body,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import {
  isFileExtensionSafe,
  removeFile,
  saveImageToStorage,
} from '../helpers/image-storage';
import { Observable, of, switchMap } from 'rxjs';
import { join } from 'path';
import { UpdateResult } from 'typeorm';
import { User } from '../models/user.interface';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from '../models/friend-request.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Observable<UpdateResult | { error: string }> {
    const fileName = file?.filename;

    if (!fileName) return of({ error: 'File must be a png, jpg, jpeg' });

    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imagesFolderPath + '/' + file.filename);

    return isFileExtensionSafe(fullImagePath).pipe(
      switchMap((isFileLegit: boolean) => {
        if (isFileLegit) {
          const userId = req.user.id;
          return this.userService.updateUserImageById(userId, fileName);
        }
        removeFile(fullImagePath);
        return of({ error: 'File content does not match extension' });
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get('image')
  findImage(@Request() req, @Res() res): Observable<Object> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: './images' }));
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userStringId: string): Observable<User> {
    const userId = parseInt(userStringId);
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  sendConnectionRequest(
    @Param('receiverId') receiverStringId: string,
    @Request() req,
  ): Observable<FriendRequest | { error: string }> {
    const receiverId = parseInt(receiverStringId);
    return this.userService.sendFriendRequest(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId') receiverStringId: string,
    @Request() req,
  ): Observable<FriendRequestStatus> {
    const receiverId = parseInt(receiverStringId);
    return this.userService.getFriendRequestStatus(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/response/:friendRequestId')
  respondToFriendRequest(
    @Param() friendRequestStringId: string,
    @Body() statusReponse: FriendRequestStatus,
  ): Observable<FriendRequestStatus> {
    const friendRequestId = parseInt(friendRequestStringId);
    return this.userService.respondToFriendRequest(
      statusReponse.status,
      friendRequestId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/:receiverId')
  getFriendRequestsFromRecipients(
    @Request() req,
  ): Observable<FriendRequestStatus[]> {
    return this.userService.getFriendRequestsFromRecipients(req.user);
  }
}
