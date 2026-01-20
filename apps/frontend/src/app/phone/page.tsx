'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function PhoneRegistrationPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available country codes (simplified list)
  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
  ];

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  const formatPhoneNumber = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Format as XXX-XXX-XXXX for US numbers
    if (countryCode === '+1' && numbers.length <= 10) {
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
      }
    }

    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);

    // Clear error when user starts typing
    if (errors.phone) {
      setErrors({});
    }
  };

  const validatePhone = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!cleanPhone) {
      setErrors({ phone: 'Phone number is required' });
      return false;
    }

    if (countryCode === '+1' && cleanPhone.length !== 10) {
      setErrors({ phone: 'Please enter a valid 10-digit phone number' });
      return false;
    }

    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call to send verification code
    setTimeout(() => {
      toast.success('Verification code sent!');
      setIsLoading(false);
      // Navigate to verification page
      router.push('/verify');
    }, 1500);
  };

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
            <CardTitle className="text-3xl">Registration</CardTitle>
            <CardDescription className="mt-2">
              Enter your phone number to verify<br />your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input with Country Code */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="h-12 px-3 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium">{selectedCountry.code}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code);
                            setShowCountryDropdown(false);
                            setPhoneNumber('');
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm">{country.code}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Phone Number Input */}
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder={countryCode === '+1' ? '230-333-0181' : 'Enter phone number'}
                  className="flex-1 h-12 text-base"
                  aria-invalid={!!errors.phone}
                  autoComplete="tel"
                />
              </div>

              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base uppercase tracking-wide disabled:opacity-50"
              size="lg"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
            <p className="text-sm text-muted-foreground">
              Want to use email instead?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-primary hover:underline font-medium"
              >
                Register with email
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}