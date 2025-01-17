import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import {
    RegisterDto,
} from "./dto";
import * as argon from "argon2";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/auth.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config"
import { RegisterResponse } from "./types";
import { LoginDto, LoginWithCaptchaDto } from "./dto/login.dto";
import { RuCaptchaService } from "src/rucaptcha/rucaptcha.service";
import { LoginResponse } from "./types/login-response";


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        private readonly logger: Logger = new Logger(AuthService.name),
        private readonly ruCaptchaService: RuCaptchaService,

    ) { }


    //! registering user
    async register(dto: RegisterDto): Promise<RegisterResponse> {
        this.logger.log("register --> Start");
        // generate the password hash
        const hashedPassword: string = await argon.hash(dto.password);

        const existingUser = await this.userRepository.findOneBy({ email: dto.email });
        if (existingUser) {
            throw new HttpException("Email already exists", HttpStatus.CONFLICT);

        }




        // save the new user in db
        try {
            const user: User = await this.userRepository.save({
                email: dto.email,
                password: hashedPassword,
            });
            delete user.password;

            const jwt: { token: string } = await this.generateToken(user.id);

            this.logger.log("register --> Success");
            return {
                success: true,
                user,
                jwt: jwt.token,
            };
        } catch (error) {
            this.logger.error("register --> Error", error.message);
        }
    }


    //! logging user
    async login(dto: LoginWithCaptchaDto): Promise<LoginResponse> {
        this.logger.log("login --> Start");

        const user: User = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            this.logger.error("login --> User not found");
            throw new BadRequestException('invalid credentials.');
        }

        if (user.firstLogin) {
            console.log(dto,"First login");
            if (!dto.captchaId || !dto.captchaSolution) {
                throw new BadRequestException('Captcha required for first login.');
            }

            try {
                const solution = await this.ruCaptchaService.getCaptchaSolution(dto.captchaId);
                console.log(solution)
                if (solution !== dto.captchaSolution) {
                    throw new BadRequestException('Invalid captcha solution.');
                }
            } catch (error) {
                throw new BadRequestException('Captcha verification failed.');
            }
        }

        const isPasswordValid = await argon.verify(user.password, dto.password);
        if (!isPasswordValid) {
            this.logger.error("login --> Invalid password");
            throw new BadRequestException('invalid credentials.');
        }

        if (user.firstLogin) {
            user.firstLogin = false;
            await this.userRepository.save(user);
        }

        delete user.password;

        const jwt: { token: string } = await this.generateToken(user.id);

        this.logger.log("login --> Success");
        return {
            success: true,
            user,
            jwt: jwt.token,
        };
    }
    

    async isCaptchaRequired(email: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['firstLogin']
        });

        return user ? user.firstLogin : true; // Require captcha if user not found
    }   

    async generateToken(userId: number): Promise<{ token: string }> {
        this.logger.log("generateToken --> Start");
        const payload = {
            sub: userId,
        };

        const token = await this.jwt.signAsync(payload, {
            expiresIn: this.config.get("JWT_EXPIRES"),
            secret: this.config.get("JWT_SECRET"),
        });
        this.logger.log("generateToken --> Success");
        return {
            token,
        };
    }
}
