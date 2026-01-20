'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);

  useEffect(() => {
    // Redirect to welcome page after 4.5 seconds
    const timer = setTimeout(() => {
      router.push('/welcome');
    }, 4500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <Image
            src="/logo.jpeg"
            alt="CraveCart Logo"
            width={200}
            height={200}
            className="mx-auto rounded-full shadow-lg"
            priority
          />
        </motion.div>

        {/* Text */}
        <motion.h1
          className="text-4xl font-bold text-orange-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          CraveCart
        </motion.h1>
      </motion.div>
    </div>
  );
}
