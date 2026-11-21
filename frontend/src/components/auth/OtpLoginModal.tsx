'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, KeyRound, ArrowRight, ShieldCheck, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const OtpLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, sendOtp, verifyOtp } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = phoneNumber.trim();
    if (clean.length < 10) {
      setErrorMsg(t('auth.invalidPhoneError', 'Please enter a valid 10-digit Indian mobile number.'));
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(clean);
    setIsLoading(false);

    if (res.success) {
      setSessionId(res.sessionId);
      setStep('otp');
      setTimer(45);
      if (res.hint) {
        setSuccessMsg(t('auth.otpSentDemoHint', 'OTP sent! For demo mode, enter {hint}', { hint: res.hint }));
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (otpCode.length < 4) {
      setErrorMsg(t('auth.enterOtpError', 'Please enter the OTP sent to your phone.'));
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(phoneNumber, otpCode, sessionId);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(t('auth.success', 'Login successful! Welcome to NutriCrop.'));
      setTimeout(() => {
        closeLoginModal();
        setStep('phone');
        setOtpCode('');
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleFillDemoCredentials = () => {
    setPhoneNumber('9876543210');
    setOtpCode('123456');
    setErrorMsg(null);
    setSuccessMsg(t('auth.demoCredentialsFilled', 'Filled demo credentials! Now click Send OTP or Verify.'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={closeLoginModal}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-nutri-cardBorder p-5 sm:p-7 overflow-hidden z-10">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
          aria-label={t('auth.closeModal', 'Close Modal')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('auth.secureFirebaseOtp', 'Secure Firebase Phone OTP')}</span>
          </div>
          <h3 className="text-xl font-black text-nutri-primary">
            {t('auth.title', 'Farmer Mobile Login')}
          </h3>
          <p className="text-xs text-nutri-muted mt-1 leading-relaxed">
            {t('auth.subtitle', 'Login with your phone number to save soil reports and receive SMS advisories.')}
          </p>
        </div>

        {/* Demo Mode Quick Fill Helper Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-900">
              {t('auth.demoBypassText', 'Demo bypass: Mobile 9876543210, OTP 123456')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold shrink-0 transition"
          >
            {t('auth.autoFillBtn', 'Auto-fill')}
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {t('auth.mobileNumber', 'Mobile Number')}
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-nutri-primary bg-nutri-bg px-3.5 py-1">
                <span className="text-sm font-bold text-gray-600 pr-2 border-r border-gray-300">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('auth.placeholderPhone', 'Enter 10-digit mobile number')}
                  className="w-full px-3 py-3 bg-transparent text-sm font-bold text-gray-900 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phoneNumber.length < 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-nutri-primary hover:bg-nutri-primaryHover disabled:opacity-50 text-white font-bold text-sm min-h-touch transition shadow-md active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('auth.sendingOtp', 'Sending OTP...')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.sendOtp', 'Send OTP Code')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  {t('auth.enterOtp', 'Enter 6-Digit OTP')}
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-nutri-secondary font-bold hover:underline"
                >
                  {t('auth.changePhone', 'Change phone')}
                </button>
              </div>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-nutri-primary bg-nutri-bg px-3.5 py-1">
                <KeyRound className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('auth.placeholderOtp', 'Enter OTP (e.g. 123456)')}
                  className="w-full px-2 py-3 bg-transparent text-center tracking-widest text-lg font-black text-gray-900 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-nutri-muted">
              {timer > 0 ? (
                <span>
                  {t('auth.resendIn', 'Resend OTP in')} <strong className="text-nutri-primary font-mono">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-nutri-primary font-bold hover:underline"
                >
                  {t('auth.resendNow', 'Resend OTP')}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 4}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-nutri-secondary hover:bg-nutri-primary disabled:opacity-50 text-white font-bold text-sm min-h-touch transition shadow-md active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('auth.verifying', 'Verifying...')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.verifyOtp', 'Verify & Continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
