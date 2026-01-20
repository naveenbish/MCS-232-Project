'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useLoginMutation } from '@/services/auth';
import { setAuthCookies } from '@/features/auth/authSlice';
import { setUserDetails } from '@/features/userDetails/userDetailsSlice';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/menu';

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.userDetails);

  const [login, { isLoading }] = useLoginMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectingTo, setRedirectingTo] = useState('menu');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Note: Redirect for authenticated users is handled by middleware
  // Removed conflicting useEffect to prevent redirect loop

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData).unwrap();

      if (result.success && result.data) {
        // Show processing state
        setIsRedirecting(true);

        const { token, user } = result.data;

        // Store token in cookies (using same token as both access and refresh)
        dispatch(setAuthCookies({
          access_token: token,
          refresh_token: token
        }));

        // Store user details by decoding the token
        dispatch(
          setUserDetails({
            access_token: token
          })
        );

        // Decode token to check user role
        let userRole = 'user';
        try {
          const decodedToken = jwtDecode<JwtPayload>(token);
          userRole = decodedToken.role || 'user';
        } catch (error) {
          console.error('Failed to decode token:', error);
        }

        // Determine redirect path based on role
        const finalRedirectPath = userRole === 'admin' ? '/admin' : redirectTo;
        setRedirectingTo(userRole === 'admin' ? 'dashboard' : 'menu');

        toast.success('Login successful! Redirecting...');

        // Give time for cookies to be set and state to update
        setTimeout(() => {
          router.push(finalRedirectPath);
        }, 500);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
      setIsRedirecting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSocialLogin = () => {
    // For now, just show a toast
    // In production, this would handle OAuth flow
    toast.info('Social login coming soon!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 px-4">
      {/* Processing Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-lg font-medium">Logging you in...</p>
            <p className="text-sm text-muted-foreground">Redirecting to {redirectingTo}</p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo.jpeg"
              alt="CraveCart Logo"
              width={80}
              height={80}
              className="rounded-full shadow-md"
            />
          </div>
          <div>
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to order your favorite food</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              onClick={handleSocialLogin}
              className="w-full h-11 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium"
              disabled={isLoading || isRedirecting}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </Button>

            <Button
              type="button"
              onClick={handleSocialLogin}
              className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading || isRedirecting}
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!errors.password}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Form Error */}
            {errors.form && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {errors.form}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isRedirecting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              {isLoading || isRedirecting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
