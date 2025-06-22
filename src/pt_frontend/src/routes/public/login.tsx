import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';

import type { _SERVICE } from '@/declarations/tenant_canister/tenant_canister.did';

const loginSearchSchema = z
  .object({
    error: z.boolean().optional(),
    redirect: z.string().optional(),
  })
  .optional();

export const Route = createFileRoute('/_initialized/login')({
  validateSearch: zodSearchValidator(loginSearchSchema),
  loaderDeps: ({ search }) => ({
    error: search?.error,
    redirect: search?.redirect,
  }),
  beforeLoad: ({ context, location }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Login',
    location,
  }),
  component: Login,
});

function Login() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authActor } = Route.useRouteContext();
  const search = Route.useSearch();

  function handleLogin() {
    setIsAuthenticating(true);
    authActor.send({ type: 'LOGIN' });
  }

  useEffect(() => {
    if (search?.error) {
      setIsAuthenticating(false);
    }
  }, [search?.error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Mobile dotted background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 lg:hidden"
        style={{
          backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.3) 60%, black 65%, black 95%, rgba(0,0,0,0.3) 98%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.3) 60%, black 65%, black 95%, rgba(0,0,0,0.3) 98%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Desktop dotted background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 hidden lg:block"
        style={{
          backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage:
            'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.3) 50%, black 55%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.3) 50%, black 55%, black 100%)',
        }}
        aria-hidden="true"
      />

      <header className="container mx-auto py-6 flex justify-between items-center relative z-10">
        <div className="font-bold text-2xl text-slate-800">Permatrust</div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-800">
                    Welcome back
                  </h1>
                  <p className="text-slate-600">
                    Login to access Permatrust, your secure Quality Management
                    System
                  </p>
                </div>

                {search?.error && (
                  <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="text-sm text-red-800">
                      Login interrupted. Please try again.
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {isAuthenticating ? (
                    <Button
                      disabled={true}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                      aria-describedby={
                        search?.error ? 'error-message' : undefined
                      }
                    >
                      <Loading text="Signing in..." />
                    </Button>
                  ) : (
                    <Button
                      disabled={isAuthenticating}
                      onClick={handleLogin}
                      type="button"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      aria-describedby={
                        search?.error ? 'error-message' : undefined
                      }
                    >
                      Login
                    </Button>
                  )}
                </div>

                <div className="text-xs text-slate-500 space-y-2">
                  <p>
                    By signing in, you agree to our secure authentication
                    process
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      End-to-end encrypted
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      GDPR compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
