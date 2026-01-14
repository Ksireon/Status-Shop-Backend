import type { JwtUser } from '../../common/auth/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(user: JwtUser): Promise<UserDto>;
    updateMe(user: JwtUser, dto: UpdateMeDto): Promise<UserDto>;
}
