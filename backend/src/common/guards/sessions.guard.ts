import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_METADATA_KEY } from "src/common/decorators/is-public.decorator";

@Injectable()
export class SessionsGuard extends AuthGuard("bearer") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // --------------------------------------------------
    // check if route is public (on Public decorator)
    // if it's public, we don't need to check if user is authenticated
    // --------------------------------------------------
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isPublic) {
      return true;
    }

    // -- call parent canActivate method to check if user is authenticated (on AuthGuard('bearer'))
    return super.canActivate(context);
  }
}
