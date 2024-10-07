import { Strategy, VerifyCallback } from "passport-google-oauth20";

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

// -----------------------------------------------------------------------------
// Login with Google
// More informations: https://dev.to/chukwutosin_/implement-google-oauth-in-nestjs-using-passport-1j3k
// and: https://docs.nestjs.com/recipes/passport
//
// You need to:
// - Enable OAuth consent screen in Google Cloud Platform -> APIs & Services -> OAuth consent screen
// - Create a new "OAuth 2.0 Client ID" in Google Cloud Platform -> APIs & Services -> Credentials
// -----------------------------------------------------------------------------

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `https://chatkraken.com/api/customer/auth/google/callback`, // This should match Google Console's Authorized redirect URIs
      scope: ["email"],
      // scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    const { id, emails } = profile;

    const user = {
      id,
      email: emails[0].value,
      // firstName: name.givenName,
      // lastName: name.familyName,
      // picture: photos[0].value,
      accessToken,
    };

    done(null, user);
  }
}
