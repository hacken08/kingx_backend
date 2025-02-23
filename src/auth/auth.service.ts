import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTService } from 'src/common/helper/jwt.service';
import { User } from 'src/user/dbrepo/user.repository';
import { Repository } from 'typeorm';
import { SignUpCredential } from './dto/signup.input';
import { PasswordHashService } from 'src/common/helper/password.service';
import { SignInCredential } from './dto/signin.input';
import { UserTokenType } from './entities/signin.entity';
import { TokenType } from './entities/token.entity';
import { ResetPasswordDto } from './dto/reset_password.dto';
import { Role } from 'src/common/constants';
import axios from 'axios';
import { GuestTokenType } from './entities/guest.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    private jwtService: JWTService,
  ) {}
  async AdminSignUp(signUpCredential: SignUpCredential) {
    const { username, email, password, role, city, phone_number } =
      signUpCredential;
    const hashedPassword = await PasswordHashService.hashPassword(password);

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = this.userRepository.create({
      username,
      email,
      city,
      password: hashedPassword,
      phone_number: phone_number,
      role: role,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }

    return user;
  }

  async UserSignUp(signUpCredential: SignUpCredential) {
    const { username, email, password, city, phone_number } = signUpCredential;
    const hashedPassword: string = PasswordHashService.hashPassword(password);
    try {
      const existingUser = await this.userRepository.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new ConflictException('Username already exists');
        }
        if (existingUser.email === email) {
          throw new ConflictException('Email already exists');
        }
      }

      const user = this.userRepository.create({
        username,
        email,
        city,
        phone_number,
        password: hashedPassword,
        role: Role.USER,
      });

      await this.userRepository.save(user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        error.message || 'Error creating user',
      );
    }
  }

  async GuestSignIn() {
    const access_token = await this.jwtService.generateGuestAccessToken(
      Role.GUEST,
    );
    const refresh_token = await this.jwtService.generateGuestRefreshToken(
      Role.GUEST,
    );
    const data: GuestTokenType = {
      role: Role.GUEST,
      access_token: access_token,
      refresh_token: refresh_token,
    };
    return data;
  }

  async SignIn(signInCredential: SignInCredential) {
    const { username, password } = signInCredential;

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid: boolean = PasswordHashService.verifyPassword(
      password,
      user.password,
    );
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    const access_token = await this.jwtService.generateAccessToken(
      user.id,
      user.role,
    );
    const refresh_token = await this.jwtService.generateRefreshToken(
      user.id,
      user.role,
    );
    const data: UserTokenType = {
      user: user,
      access_token: access_token,
      refresh_token: refresh_token,
    };
    return data;
  }

  async refreshToken(refreshToken: string, token: string): Promise<TokenType> {
    const tokenData = await this.jwtService.decodeToken(token);
    if (!tokenData) {
      throw new UnauthorizedException('Invalid access token');
    }

    const validRefreshToken =
      await this.jwtService.verifyRefreshToken(refreshToken);
    if (!validRefreshToken) {
      throw new UnauthorizedException(
        'Refresh token expired or invalid. Please login again.',
      );
    }

    const expiryDate = new Date(0).setUTCSeconds(tokenData.exp);
    if (expiryDate > Date.now()) {
      const tokens: TokenType = {
        refresh_token: refreshToken,
        access_token: token,
      };
      console.log('old token -> ', tokens);
      return tokens;
    }

    const user = await this.userRepository.findOne({
      where: { id: validRefreshToken.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found. Please login again.');
    }

    const newAccessToken = await this.jwtService.generateAccessToken(
      user.id,
      user.role,
    );
    console.log('new token -> ', newAccessToken);

    const tokens: TokenType = {
      access_token: newAccessToken,
      refresh_token: refreshToken,
    };

    return tokens;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { id, currentPassword, newPassword, confirmPassword } =  resetPasswordDto;
    console.log(resetPasswordDto);
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }
    try {
      const user = await this.userRepository.findOne({
        where: { id, deletedAt: null, deletedBy: null },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not exist`);
      }
      console.log(
        'current: ',
        currentPassword,
        'password fromdata base: ',
        user.password,
      );
      const isCurrentPasswordValid = PasswordHashService.verifyPassword(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      const hashedPassword = PasswordHashService.hashPassword(newPassword);
      user.password = hashedPassword;
      user.first_time_password_reset = true;
      await this.userRepository.save(user);
      return 'Password reset successful';
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async sendOtp(mobile: string): Promise<string> {
    try {
      // step 1: check if user exist in database
      const user = await this.userRepository.findOne({
        where: { phone_number: mobile },
      });
      if (!user) {
        throw new NotFoundException(
          `User with mobile number :${mobile} not found`,
        );
      }

      // step 2: generate a 6 digit reandom otp
      const otp = Math.floor(100000 + Math.random() * 900000);

      const TOKEN: string = 'AAHuDAAANl6yPAdt6ax8JuYjzoHhWiA5FWeIVLp-MFYqTg';
      const BASE_URL: string = 'https://gatewayapi.telegram.org/';
      const PHONE = `+91${mobile}`;
      const HEADERS = {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      };

      // step 3: check if user can send otp
      const issend = await axios.post(
        `${BASE_URL}checkSendAbility`,
        {
          phone_number: PHONE,
        },
        {
          headers: HEADERS,
        },
      );

      if (issend.data.ok != true) {
        throw new BadRequestException('Unable to send otp');
      }

      await this.delay(5000);

      const json_body = {
        phone_number: PHONE,
        code: otp,
        ttl: 60,
      };

      // step 4: send otp to user
      const response = await axios.post(
        `${BASE_URL}sendVerificationMessage`,
        json_body,
        { headers: HEADERS },
      );

      if (response.data.ok != true) {
        throw new BadRequestException('Unable to send otp');
      }

      //  save the otp in table
      user.otp = otp.toString();
      await this.userRepository.save(user);
      return 'OTP sent successfully';
    } catch (error) {
      throw new InternalServerErrorException('Unable to send otp');
    }
  }

  async verifyOtp(mobile: string, otp: string): Promise<string> {
    try {
      const user = await this.userRepository.findOne({
        where: { phone_number: mobile },
      });
      if (!user) {
        throw new NotFoundException(
          `User with mobile number :${mobile} not found`,
        );
      }
      if (user.otp !== otp) {
        throw new BadRequestException('Invalid otp');
      }
      return 'OTP verified successfully';
    } catch (error) {
      throw new InternalServerErrorException('Unable to verify otp');
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
