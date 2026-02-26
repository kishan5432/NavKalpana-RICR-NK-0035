import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { forgotPassword, resetPassword } from '@/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email: formData.email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.otp.trim()) newErrors.otp = 'OTP is required';
    if (!formData.newPassword) newErrors.newPassword = 'Password is required';
    if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FFD400] via-[#FFC400] to-[#E6B800] items-center justify-center p-12 relative overflow-hidden">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{height: '80px'}}>
          <path d="M0,0 L0,40 Q300,100 600,40 T1200,40 L1200,0 Z" fill="#f9fafb"></path>
        </svg>
        <img 
          src="https://media.istockphoto.com/id/1397930967/vector/wrong-password-isolated-cartoon-vector-illustrations.jpg?s=612x612&amp;w=0&amp;k=20&amp;c=x8JNYsntSpHYfimxTecNGrzne49rcv-lK56jYKxBYVc="
          alt="Forgot password illustration"
          className="w-full max-w-lg rounded-2xl shadow-2xl object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#111111] mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#FFD400] hover:bg-[#FFC400] text-[#111111] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                      OTP Code
                    </Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                      placeholder="Enter new password"
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                      placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#FFD400] hover:bg-[#FFC400] text-[#111111] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Email
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-[#FFD400] hover:underline font-semibold">
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
