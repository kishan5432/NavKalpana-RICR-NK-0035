import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendOTP, verifyOTP } from '@/api';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpSentRef = useRef(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    
    // Send OTP only once on component mount
    if (!otpSentRef.current) {
      otpSentRef.current = true;
      sendOTPToEmail();
    }
  }, [email, navigate]);

  const sendOTPToEmail = async () => {
    try {
      await sendOTP({ email });
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error('Failed to send verification code');
    }
  };

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
    try {
      await sendOTP({ email });
      toast.success('New verification code sent');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3A2A5A] to-[#2d1f47] px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3A2A5A] mb-2">
            Verify Your Email
          </CardTitle>
          <p className="text-gray-600">
            Enter the 6-digit code sent to {email}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="mt-1 text-center text-lg tracking-widest"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#EC3399] hover:bg-[#d62d88]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-[#EC3399] hover:underline font-medium disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}