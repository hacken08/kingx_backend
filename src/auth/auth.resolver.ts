/* eslint-disable no-unused-vars */
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/dbrepo/user.repository';
import { SignUpCredential } from './dto/signup.input';
import { UserTokenType } from './entities/signin.entity';
import { SignInCredential } from './dto/signin.input';
import { TokenType } from './entities/token.entity';
import { ResetPasswordDto } from './dto/reset_password.dto';
import { GuestTokenType } from './entities/guest.entity';
import { ChangePasswordDto } from './dto/change_password.dto';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JWTService,
  ) {}

  @Mutation(() => User)
  async adminSignUp(
    @Args('signUpCredential') signUpCredential: SignUpCredential,
  ) {
    return this.authService.AdminSignUp(signUpCredential);
  }

  @Mutation(() => User)
  async userSignUp(
    @Args('signUpCredential') signUpCredential: SignUpCredential,
  ) {
    return this.authService.UserSignUp(signUpCredential);
  }

  @Query(() => GuestTokenType)
  async GuestSignIn() {
    return this.authService.GuestSignIn();
  }

  @Query(() => UserTokenType)
  async signIn(@Args('signInCredential') signInCredential: SignInCredential) {
    return this.authService.SignIn(signInCredential);
  }

  @Query(() => UserTokenType)
  async signInAdmin(
    @Args('signInCredential') signInCredential: SignInCredential,
  ): Promise<UserTokenType> {
    return this.authService.SignInAdmin(signInCredential);
  }

  @Mutation(() => TokenType)
  async refreshAccessToken(
    @Args('refreshToken') refreshToken: string,
    @Args('token') token: string,
  ) {
    if (!refreshToken || !token) {
      throw new UnauthorizedException('Refresh token and token are required');
    }

    return this.authService.refreshToken(refreshToken, token);
  }

  @Mutation(() => String)
  async resetPassword(
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Mutation(() => String)
  async changePassword(
    @Args('changePassword') changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    return await this.authService.changePassword(changePasswordDto);
  }

  @Mutation(() => String)
  async verifyOtp(
    @Args('mobile') mobile: string,
    @Args('otp') otp: string,
  ): Promise<string> {
    return await this.authService.verifyOtp(mobile, otp);
  }

  @Mutation(() => String)
  async sendOtp(@Args('mobile') mobile: string): Promise<string> {
    return await this.authService.sendOtp(mobile);
  }
}
