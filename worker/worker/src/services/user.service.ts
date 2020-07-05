import { HttpErrors } from '@loopback/rest';
import { repository } from '@loopback/repository';
import { UserService } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';
import { inject } from '@loopback/context';

import { UserRepository } from '../repositories/user.repository';
import { UserCredential } from '../types';
import { User } from '../models';
import { PasswordHasherService } from './password-hasher.service';
import * as Mybindings from '../mybindings';

class MyUserService implements UserService<User, UserCredential> {
  constructor(
    @repository(UserRepository) private mongoRepo: UserRepository,
    @inject(Mybindings.PASSWORD_HASHER_SERVICE)
    private passwordHasher: PasswordHasherService,
  ) {}

  async verifyCredentials(credential: UserCredential): Promise<User> {
    const foundUser = await this.mongoRepo.findOne({ where: { username: credential.username }});
    if (!foundUser)
      throw new HttpErrors.NotFound('Invalid username or password');

    const passwordVerified = await this.passwordHasher.verifyPassword(
      credential.password, foundUser.password
    );
    if (!passwordVerified)
      throw new HttpErrors.NotFound('Invalid username or password');

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: '',
      username: user.username,
      id: user.id
    };
  }
}

export default MyUserService;
