import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = params.email;
        if (typeof email !== "string" || email.length === 0) {
          throw new ConvexError("Missing email for Password auth profile");
        }
        return { email };
      },
    }),
  ],
});