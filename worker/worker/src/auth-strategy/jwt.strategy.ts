import { inject } from '@loopback/context';
import { HttpErrors, Request } from '@loopback/rest';
import { AuthenticationStrategy, TokenService } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';

import * as mybindings from '../mybindings';

class JwtStrategy implements AuthenticationStrategy {
  name: string = 'jwt';

  constructor(
    @inject(mybindings.TOKEN_SERVICE) private tokenService: TokenService
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractCredentials(request);
    const profile = this.tokenService.verifyToken(token);
    return profile;
  }

  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example: Bearer xxx.yyy.zzz
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith("Bearer")) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`
      );
    }

    //split the string into 2 parts: 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(" ");
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`
      );
    const token = parts[1];

    return token;
  }
}

export default JwtStrategy;
