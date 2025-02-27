"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: _error,
        } = await supabase.auth.getSession();
        if (session) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 pt-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-3">
            WebBuilder
          </h1>
          <p className="text-base text-gray-400 mb-6 leading-relaxed">
            Create stunning web interfaces with our intuitive drag-and-drop
            builder. Design, customize, and deploy your website in minutes
            without writing any code.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                <span className="material-icons text-blue-400 text-lg">
                  drag_indicator
                </span>
              </div>
              <h3 className="text-gray-200 font-semibold mb-1 text-sm">
                Drag & Drop
              </h3>
              <p className="text-gray-400 text-xs">
                Intuitive drag-and-drop interface for effortless design
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mb-2">
                <span className="material-icons text-purple-400 text-lg">
                  widgets
                </span>
              </div>
              <h3 className="text-gray-200 font-semibold mb-1 text-sm">
                Components
              </h3>
              <p className="text-gray-400 text-xs">
                Pre-built components to speed up your development
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center mb-2">
                <span className="material-icons text-green-400 text-lg">
                  code
                </span>
              </div>
              <h3 className="text-gray-200 font-semibold mb-1 text-sm">
                No Code
              </h3>
              <p className="text-gray-400 text-xs">
                Build websites without writing a single line of code
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-2">
                <span className="material-icons text-yellow-400 text-lg">
                  bolt
                </span>
              </div>
              <h3 className="text-gray-200 font-semibold mb-1 text-sm">
                Fast & Easy
              </h3>
              <p className="text-gray-400 text-xs">
                Build and deploy your website in minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full max-w-md xl:max-w-lg flex flex-col justify-center p-8 lg:p-16 bg-[#1f1f1f] border-l border-gray-800">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-2">
            Get Started
          </h2>
          <p className="text-gray-400">
            Sign in to start building your website
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
            <div className="absolute inset-0 border border-gray-200 rounded-lg" />
          </button>

          {/* GitHub Login Button */}
          <button
            onClick={handleGithubLogin}
            className="group relative w-full flex items-center gap-3 bg-[#333] hover:bg-[#444] text-white py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
            <div className="absolute inset-0 border border-white/20 rounded-lg" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
