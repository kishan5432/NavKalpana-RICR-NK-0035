import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendOTP, verifyOTP } from '@/api';

const otpSentEmails = new Set();

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    console.log('Verify component mounted, email:', email, 'already sent:', otpSentEmails.has(email));
    if (!email) {
      navigate('/register');
      return;
    }
    
    // Check if this is a fresh registration
    const isPendingVerification = sessionStorage.getItem('pendingVerification') === email;
    if (isPendingVerification) {
      sessionStorage.removeItem('pendingVerification');
      otpSentEmails.delete(email); // Allow fresh OTP for new registration
    }
    
    if (otpSentEmails.has(email)) {
      console.log('OTP already sent to this email, skipping');
      return;
    }
    
    otpSentEmails.add(email);
    console.log('Sending OTP to:', email);
    
    sendOTP({ email })
      .then(() => {
        console.log('OTP sent successfully');
        toast.success('Verification code sent to your email');
      })
      .catch(() => {
        console.log('OTP send failed');
        otpSentEmails.delete(email);
        toast.error('Failed to send verification code');
      });
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP({ otp, type: 'email', email });
      toast.success('Profile created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    otpSentEmails.delete(email);
    try {
      await sendOTP({ email });
      otpSentEmails.add(email);
      toast.success('New verification code sent');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3A2A5A] via-[#4A3A6A] to-[#EC3399] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-white/80 text-sm">We've sent a 6-digit code to</p>
          <p className="text-white font-medium mt-1">{email}</p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardContent className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  className="h-14 text-center text-2xl tracking-[0.5em] font-bold border-2 focus:border-[#EC3399] focus:ring-[#EC3399] rounded-xl"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code from your email</p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#3A2A5A] hover:bg-[#2d1f47] text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="text-[#EC3399] border-[#EC3399] hover:bg-[#EC3399] hover:text-white font-medium"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <button
            onClick={() => navigate('/register')}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors block mx-auto"
          >
            ← Back to Registration
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors block mx-auto"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}