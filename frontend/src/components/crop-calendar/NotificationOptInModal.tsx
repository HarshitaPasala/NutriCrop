'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Phone, CheckCircle2, Bell } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface NotificationOptInModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
}

export const NotificationOptInModal: React.FC<NotificationOptInModalProps> = ({
  isOpen,
  onClose,
  cropName,
}) => {
  const { t, language } = useLanguage();
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [phone, setPhone] = useState('9876543210');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch('/api/v1/crop-calendar/subscribe-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          phone,
          language,
          calendar_id: `cal-${cropName.toLowerCase()}`,
        }),
      });
      setIsSubscribed(true);
    } catch (err) {
      setIsSubscribed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-nutri-cardBorder space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Bell className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-nutri-primary">
              {t('cropCalendar.notificationTitle', 'Seasonal Crop Reminders')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-nutri-bg flex items-center justify-center text-nutri-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubscribed ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-nutri-primary">Subscribed Successfully!</h4>
            <p className="text-xs text-nutri-muted font-medium max-w-xs mx-auto">
              You will receive stage-specific irrigation, top-dressing, and weather risk alerts for {cropName} on {channel.toUpperCase()} at {phone}.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 rounded-xl bg-nutri-primary text-white text-xs font-bold hover:bg-nutri-secondary transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <p className="text-xs text-nutri-muted font-medium">
              Get timely notifications on your mobile before each critical crop stage (top-dressing, weed control, pest scouting).
            </p>

            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-bold text-nutri-primary mb-1.5">
                Notification Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition min-h-[48px] ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : 'bg-white border-nutri-cardBorder text-nutri-muted hover:bg-nutri-bg'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition min-h-[48px] ${
                    channel === 'sms'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : 'bg-white border-nutri-cardBorder text-nutri-muted hover:bg-nutri-bg'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>SMS</span>
                </button>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-nutri-primary mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-nutri-cardBorder text-sm font-bold text-nutri-primary focus:outline-none focus:ring-2 focus:ring-nutri-secondary min-h-[48px]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <DemoBadge />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs font-bold transition min-h-[44px]"
              >
                {isLoading ? 'Subscribing...' : t('cropCalendar.subscribeBtn', 'Confirm Subscription')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
