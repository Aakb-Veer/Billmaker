'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, User } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    supabaseUser: SupabaseUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get cached user from localStorage
const getCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem('aakb_user');
        if (cached) return JSON.parse(cached);
    } catch { }
    return null;
};

// Helper to cache user to localStorage
const setCachedUser = (user: User | null) => {
    if (typeof window === 'undefined') return;
    try {
        if (user) {
            localStorage.setItem('aakb_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('aakb_user');
        }
    } catch { }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize with cached user for instant loading
    const [user, setUser] = useState<User | null>(() => getCachedUser());
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    // If we have cached user, don't show loading initially
    const [isLoading, setIsLoading] = useState(() => !getCachedUser());

    // Check for existing session on mount
    useEffect(() => {
        let isMounted = true;

        // Quick timeout - stop loading after 3 seconds max
        const loadingTimeout = setTimeout(() => {
            if (isMounted) {
                setIsLoading(false);
            }
        }, 3000);

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                if (session?.user) {
                    setSupabaseUser(session.user);
                    await fetchUserProfile(session.user.email!);
                } else {
                    // No session - clear cached user
                    setUser(null);
                    setCachedUser(null);
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                console.error('Auth init error:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (session?.user) {
                setSupabaseUser(session.user);
                await fetchUserProfile(session.user.email!);
            } else {
                setSupabaseUser(null);
                setUser(null);
                setCachedUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            clearTimeout(loadingTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setUser(null);
                setCachedUser(null);
            } else {
                setUser(data);
                setCachedUser(data);
            }
        } catch {
            setUser(null);
            setCachedUser(null);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!email.endsWith('@aakb.org.in')) {
            return { success: false, error: 'Only @aakb.org.in emails are allowed' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                await fetchUserProfile(data.user.email!);
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!email.endsWith('@aakb.org.in')) {
            return { success: false, error: 'Only @aakb.org.in emails are allowed' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                return { success: true };
            }

            return { success: false, error: 'Signup failed' };
        } catch {
            return { success: false, error: 'Signup failed. Please try again.' };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSupabaseUser(null);
        setCachedUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, supabaseUser, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
