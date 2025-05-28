import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { User } from '../../models/user.model';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) { }

  async signup(email: string, password: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new RpcException('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.createUser({
      email,
      password: hashed,
      role: 'user',
    });

    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new RpcException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new RpcException('Invalid credentials');

    return user;
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new RpcException('Invalid or expired token');
    }
  }

  generateToken(payload: { id: number }): string {
    return this.jwtService.sign(
      { userId: payload.id },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      },
    );
  }
}

