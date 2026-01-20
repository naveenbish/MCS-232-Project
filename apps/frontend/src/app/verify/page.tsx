'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mock email - in real app this would come from previous step
  const email = 'pratikakshuhc@gmail.com';

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }

      // If all digits are filled, could auto-submit
      if (value && index === 3) {
        const fullCode = [...newCode];
        if (fullCode.every(digit => digit !== '')) {
          // Could trigger verification here
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleResend = () => {
    // Just for show - would trigger resend in real app
    console.log('Resending code...');
  };

  const handleVerify = () => {
    if (code.every(digit => digit !== '')) {
      // In real app, would verify the code
      router.push('/menu');
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 px-4">
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
            <CardTitle className="text-3xl">Verification Code</CardTitle>
            <CardDescription className="mt-2">
              Please type the verification code sent to
              <br />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {email}
              </span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Code Input Boxes */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setFocusedIndex(index)}
                  className={`w-[60px] h-[60px] text-2xl font-bold text-center border-2 rounded-xl
                    ${code[index]
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : focusedIndex === index
                        ? 'border-orange-400 bg-white dark:bg-gray-800'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }
                    focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
                    transition-all duration-200`}
                  placeholder="○"
                />
              </motion.div>
            ))}
          </div>

          {/* Resend Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              I don't receive a code!{' '}
              <button
                onClick={handleResend}
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Please resend
              </button>
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isCodeComplete}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-lg disabled:opacity-50"
            size="lg"
          >
            Verify Code
          </Button>

          {/* Back to Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <button
                onClick={() => router.push('/login')}
                className="text-primary hover:underline"
              >
                Back to login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}