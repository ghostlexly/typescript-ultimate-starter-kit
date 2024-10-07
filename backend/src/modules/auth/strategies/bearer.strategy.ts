import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-http-bearer";
import { SessionService } from "../session.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, "bearer") {
  constructor(
    private sessionService: SessionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super();
  }

  async validate(token: string) {
    // -- get token from cache if it's already cached
    const cachedSessionKey = `sessions:${token}`;
    const cachedSession = await this.cacheManager.get(cachedSessionKey);
    if (cachedSession) return cachedSession;

    // -- get session by token
    const session = await this.sessionService.findByToken(token);

    // -- verify if it expired
    const isExpired = await this.sessionService.isExpired(token);

    if (isExpired) {
      throw new HttpException("Session expired.", HttpStatus.FORBIDDEN);
    }

    // -- cache the session
    await this.cacheManager.set(cachedSessionKey, session, 30000);

    return session;
  }
}
