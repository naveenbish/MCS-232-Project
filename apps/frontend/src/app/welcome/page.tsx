'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const router = useRouter();
  const [emailPhone, setEmailPhone] = useState('');

  const handleSocialLogin = () => {
    router.push('/login');
  };

  const handleContinue = () => {
    if (emailPhone) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section - Logo and Food Collage */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Food Images Collage */}
        <div className="absolute inset-0">
          {/* Top left food */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-10 left-10 w-32 h-32"
            style={{ transform: 'rotate(-15deg)' }}
          >
            <Image
              src="/food-images/biryani.png"
              alt="Biryani"
              width={128}
              height={128}
              className="rounded-2xl shadow-xl object-cover w-full h-full"
            />
          </motion.div>

          {/* Top right food */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-20 right-16 w-36 h-36"
            style={{ transform: 'rotate(10deg)' }}
          >
            <Image
              src="/food-images/butter-chicken.png"
              alt="Butter Chicken"
              width={144}
              height={144}
              className="rounded-2xl shadow-xl object-cover w-full h-full"
            />
          </motion.div>

          {/* Bottom left food */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-20 left-20 w-40 h-40"
            style={{ transform: 'rotate(5deg)' }}
          >
            <Image
              src="/food-images/classic-beef-burger.png"
              alt="Burger"
              width={160}
              height={160}
              className="rounded-2xl shadow-xl object-cover w-full h-full"
            />
          </motion.div>

          {/* Bottom right food */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 right-10 w-32 h-32"
            style={{ transform: 'rotate(-20deg)' }}
          >
            <Image
              src="/food-images/chocolate-lava-cake.png"
              alt="Dessert"
              width={128}
              height={128}
              className="rounded-2xl shadow-xl object-cover w-full h-full"
            />
          </motion.div>

          {/* Middle left food */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-1/2 left-8 w-28 h-28"
            style={{ transform: 'translateY(-50%) rotate(12deg)' }}
          >
            <Image
              src="/food-images/fresh-lime-soda.png"
              alt="Beverage"
              width={112}
              height={112}
              className="rounded-2xl shadow-xl object-cover w-full h-full"
            />
          </motion.div>

          {/* Middle right food */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute top-1/2 right-20 w-32 h-32"
            style={{ transform: 'translateY(-20%) rotate(-8deg)' }}
          >
            <Image
              src="/food-images/garlic-bread.png"
              alt="Garlic Bread"
              width={128}
              height={128}
              className="rounded-2xl shadow-xl object-cover w-full h-full"
            />
          </motion.div>
        </div>

        {/* Central Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 flex flex-col items-center justify-center w-full px-8"
        >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <Image
              src="/logo.jpeg"
              alt="CraveCart Logo"
              width={150}
              height={150}
              className="mx-auto rounded-full shadow-lg mb-6"
            />
            <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-3">
              Welcome to CraveCart
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Your favorite food delivered<br />fast at your door.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Login Options */}
      <div className="flex items-center justify-center bg-white dark:bg-gray-950 p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/logo.jpeg"
              alt="CraveCart Logo"
              width={100}
              height={100}
              className="mx-auto rounded-full shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              CraveCart
            </h1>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign in to continue
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back! Please sign in to access your account
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSocialLogin}
              className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium"
              size="lg"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              FACEBOOK
            </Button>

            <Button
              onClick={handleSocialLogin}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600"
              size="lg"
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
              GOOGLE
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Phone Input */}
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter email or phone number"
              value={emailPhone}
              onChange={(e) => setEmailPhone(e.target.value)}
              className="h-12"
            />
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
              size="lg"
            >
              Continue
            </Button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}