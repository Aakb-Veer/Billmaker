'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW registered:', registration.scope);
                })
                .catch((error) => {
                    console.log('SW registration failed:', error);
                });
        }
    }, []);
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useServiceWorker();
    return <>{children}</>;
}
