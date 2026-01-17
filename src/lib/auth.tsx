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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setSupabaseUser(session.user);
                    await fetchUserProfile(session.user.email!);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setSupabaseUser(session.user);
                await fetchUserProfile(session.user.email!);
            } else {
                setSupabaseUser(null);
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
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
            } else {
                setUser(data);
            }
        } catch {
            setUser(null);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Check if email ends with @aakb.org.in
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
        } catch (error) {
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
