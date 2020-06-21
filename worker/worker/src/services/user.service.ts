import { HttpErrors } from '@loopback/rest';
import { repository } from '@loopback/repository';
import { UserService } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';

import { UserRepository } from '../repositories/user.repository';
import { UserCredential } from '../types';
import { User } from '../models';

class MyUserService implements UserService<User, UserCredential> {
  constructor(
    @repository(UserRepository) private mongoRepo: UserRepository
  ) {}

  async verifyCredentials(credential: UserCredential): Promise<User> {
    const foundUser = await this.mongoRepo.findOne({ where: { username: credential.username }});
    if (!foundUser)
      throw new HttpErrors.NotFound('Invalid username or password');

    if (foundUser.password !== credential.password)
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
