import { inject } from '@loopback/context';
import { HttpErrors } from '@loopback/rest';
import { TokenService } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';

import jwt from 'jsonwebtoken';

import * as mybindings from '../mybindings';

class JwtService implements TokenService {
  constructor(
    @inject(mybindings.TOKEN_SECRET) private secret: string,
    @inject(mybindings.TOKEN_EXPIRES_IN) private expresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    try {
      const decoded = jwt.verify(token, this.secret) as UserProfile;
      const profile = Object.assign(
        { [securityId]: '', },
        { username: decoded.username }
      );
      return profile;
    }
    catch (error) {
      throw new HttpErrors.Unauthorized(`Failed to authenticate: ${error}`);
    }
  }

  async generateToken(profile: UserProfile): Promise<string> {
    const { username, } = profile;
    return  jwt.sign({ username }, this.secret, { expiresIn: this.expresIn });
  }
}

export default JwtService;