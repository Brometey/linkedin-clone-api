import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { FriendRequest_Status } from './friend-request.interface';

@Entity('requests')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequests)
  creator: UserEntity;

  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.receivedFriendRequests,
  )
  receiver: UserEntity;

  @Column()
  status: FriendRequest_Status;
}
