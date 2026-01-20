'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useRegisterMutation } from '@/services/auth';
import { setAuthCookies } from '@/features/auth/authSlice';
import { setUserDetails } from '@/features/userDetails/userDetailsSlice';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.userDetails);

  const [register, { isLoading }] = useRegisterMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user.id) {
      router.push('/menu');
    }
  }, [user.id, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, fullName, phone, ...rest } = formData;
      const registerData = {
        ...rest,
        name: fullName,
        contact: phone,
      };
      const result = await register(registerData).unwrap();

      if (result.success && result.data) {
        // Show processing state
        setIsRedirecting(true);

        const { token } = result.data;
        // Use the same token as refresh token if not provided separately
        const refresh_token = result.data.refresh_token || token;

        // Store tokens in cookies
        dispatch(setAuthCookies({ access_token: token, refresh_token }));

        // Decode and store user details
        const decodedToken = jwtDecode<JwtPayload>(token);
        dispatch(
          setUserDetails({
            id: decodedToken.id,
            email: decodedToken.email,
            role: decodedToken.role,
          })
        );

        toast.success('Registration successful! Welcome to CraveCart!');

        // Give time for state to update
        setTimeout(() => {
          router.push('/menu');
        }, 500);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
      setIsRedirecting(false);
    }
  };

  const handleSocialSignup = () => {
    // For now, just redirect to login page
    // In production, this would handle OAuth flow
    router.push('/login');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      {/* Processing Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-lg font-medium">Creating your account...</p>
            <p className="text-sm text-muted-foreground">Redirecting to menu</p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-lg">
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
            <CardTitle className="text-3xl">Join CraveCart</CardTitle>
            <CardDescription>Create an account to start ordering delicious food</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Social Signup Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              onClick={handleSocialSignup}
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
              Sign up with Facebook
            </Button>

            <Button
              type="button"
              onClick={handleSocialSignup}
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
              Sign up with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                aria-invalid={!!errors.fullName}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

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

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                aria-invalid={!!errors.phone}
                placeholder="1234567890"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!errors.password}
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={!!errors.confirmPassword}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
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
              {isLoading || isRedirecting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
