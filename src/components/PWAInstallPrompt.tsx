'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also check if installed via app
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for this session
        sessionStorage.setItem('pwa-dismissed', 'true');
    };

    // Don't show if already dismissed this session
    useEffect(() => {
        if (sessionStorage.getItem('pwa-dismissed')) {
            setShowPrompt(false);
        }
    }, []);

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-2xl border border-orange-200 p-4 z-50 animate-slide-up">
            <div className="flex items-start gap-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl object-contain" />
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">એપ ઇન્સ્ટોલ કરો!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        ઝડપથી એક્સેસ માટે આ એપ ઇન્સ્ટોલ કરો
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Install for quick access</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleDismiss}
                    className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
                >
                    પછીથી
                </button>
                <button
                    onClick={handleInstall}
                    className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:from-orange-600 hover:to-orange-700"
                >
                    ઇન્સ્ટોલ કરો
                </button>
            </div>
        </div>
    );
}
