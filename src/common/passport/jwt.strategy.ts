import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../service/auth.service';
import { AuthUser } from '../../dto/auth/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'hui8sdYDGSYGD87td87gYusgduyasg6TS^D&dyggdsuadg23137&^^$2h',
        });
    }

    async validate(payload: AuthUser) {
        if (payload && payload.id) {
            const user = await this.authService.findOneById(payload.id);
            if (!user) throw new UnauthorizedException();
            return payload;
        }
        throw new UnauthorizedException();
    }
}