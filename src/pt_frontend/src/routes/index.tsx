import { useState, useLayoutEffect } from "react";
import {
  createFileRoute,
  Navigate,
  redirect,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: LoginComponent,
  beforeLoad: ({ context }) => {
    if (context.auth.loggedIn) {
      throw redirect({
        to: "/authenticate",
      });
    }
    if (context.auth.authenticated) {
      throw redirect({
        to: "/projects/projects",
      });
    }
  },
});

function LoginComponent() {
  const [password, setPassword] = useState<string>("");
  const search = Route.useSearch<{ redirect?: string }>();
  const router = useRouter();
  const auth = useRouteContext({
    from: "/",
    select: (state) => state.auth,
  });

  // Ah, the subtle nuances of client side auth. 🙄
  useLayoutEffect(() => {
    if (auth.loggedIn && search.redirect) {
      router.history.push(search.redirect);
    }
  }, [auth.loggedIn, search.redirect, router.history.push]);

  const deobfuscatePassword = (obfuscated: string) => {
    const shift = 7331;
    let password = "";
    for (let i = 0; i < obfuscated.length; i++) {
      password += String.fromCharCode(obfuscated.charCodeAt(i) - shift);
    }
    return password;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const expected = "ᴐᴒᴏᴗᴒᴖᴜᴐᴓᴄᴗᴌᴆᴒᴋᴒᴚᴇᴌᴇᴜᴒᴘᴎᴑᴒᴚᴋᴒᴚᴗᴒᴊᴈᴗᴌᴑ᳢";
    auth.loggedIn = password === deobfuscatePassword(expected);
    if (auth.loggedIn) {
      router.history.push("/authenticate");
    }
  };

  return auth.loggedIn ? (
    <Navigate to="/authenticate" />
  ) : (
    <div className="grid place-items-center">
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <Input
            id="password"
            alt="Password"
            type="password"
            className="input input-bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
