import type { JwtUser } from '../../common/auth/current-user.decorator';
import { CreateSupportMessageDto } from './dto/create-message.dto';
import { SupportMessageDto } from './dto/message.dto';
import { SupportService } from './support.service';
export declare class SupportController {
    private readonly support;
    constructor(support: SupportService);
    myMessages(user: JwtUser): Promise<SupportMessageDto[]>;
    send(user: JwtUser, dto: CreateSupportMessageDto): Promise<SupportMessageDto>;
}
