'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase, User, Settings } from '@/lib/supabase';

export default function SettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

    // New user form
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'bill_maker'>('bill_maker');
    const [isAdding, setIsAdding] = useState(false);

    // Settings form
    const [whatsappLink, setWhatsappLink] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        } else if (user && user.role !== 'admin') {
            router.replace('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const [usersRes, settingsRes] = await Promise.all([
                supabase.from('users').select('*').order('created_at', { ascending: false }),
                supabase.from('settings').select('*').eq('id', 1).single(),
            ]);

            if (usersRes.data) setUsers(usersRes.data);
            if (settingsRes.data) {
                setSettings(settingsRes.data);
                setWhatsappLink(settingsRes.data.whatsapp_group_link || '');
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const addUser = async () => {
        if (!newEmail || !newName || !newPassword) {
            alert('Please fill all fields including password');
            return;
        }

        if (!newEmail.endsWith('@aakb.org.in')) {
            alert('Email must end with @aakb.org.in');
            return;
        }

        if (newPassword.length < 4) {
            alert('Password must be at least 4 characters');
            return;
        }

        setIsAdding(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .insert({
                    email: newEmail.toLowerCase(),
                    name: newName,
                    role: newRole,
                    password_hash: newPassword
                })
                .select()
                .single();

            if (error) throw error;

            setUsers([data, ...users]);
            setNewEmail('');
            setNewName('');
            setNewPassword('');
            setNewRole('bill_maker');
            alert('User added successfully!');
        } catch (error) {
            console.error('Add user error:', error);
            alert('Failed to add user. Email might already exist.');
        } finally {
            setIsAdding(false);
        }
    };

    const resetPassword = async (userId: string, userName: string) => {
        const newPass = prompt(`Enter new password for ${userName}:`);
        if (!newPass || newPass.length < 4) {
            alert('Password must be at least 4 characters');
            return;
        }

        try {
            await supabase
                .from('users')
                .update({ password_hash: newPass })
                .eq('id', userId);

            alert('Password updated!');
        } catch (error) {
            console.error('Reset error:', error);
            alert('Failed to reset password');
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await supabase
                .from('users')
                .update({ is_active: !currentStatus })
                .eq('id', userId);

            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            await supabase
                .from('settings')
                .update({ whatsapp_group_link: whatsappLink, updated_at: new Date().toISOString() })
                .eq('id', 1);

            alert('Settings saved!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !user || user.role !== 'admin') {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-6">
            {/* Header */}
            <header className="max-w-4xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="text-lg font-bold text-orange-800">Admin Settings</h1>
                        </div>
                    </Link>
                    <Link href="/" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        ← Back
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        👥 Manage Users
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        ⚙️ App Settings
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Add User Form */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New User</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Staff Name"
                                        className="w-full p-2 border rounded-lg focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="name@aakb.org.in"
                                        className="w-full p-2 border rounded-lg focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 4 chars"
                                        className="w-full p-2 border rounded-lg focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Role</label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as 'admin' | 'bill_maker')}
                                        className="w-full p-2 border rounded-lg focus:border-purple-500"
                                    >
                                        <option value="bill_maker">Bill Maker</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={addUser}
                                        disabled={isAdding}
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                                    >
                                        {isAdding ? 'Adding...' : '+ Add'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b">
                                <h3 className="font-semibold text-gray-700">All Users ({users.length})</h3>
                            </div>
                            {isLoadingData ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {users.map((u) => (
                                        <div key={u.id} className={`p-4 flex items-center justify-between ${!u.is_active ? 'bg-gray-50' : ''}`}>
                                            <div>
                                                <p className={`font-medium ${!u.is_active ? 'text-gray-400' : 'text-gray-800'}`}>
                                                    {u.name}
                                                    {u.id === user.id && <span className="ml-2 text-xs text-purple-600">(You)</span>}
                                                </p>
                                                <p className="text-sm text-gray-500">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                                {u.id !== user.id && (
                                                    <>
                                                        <button
                                                            onClick={() => resetPassword(u.id, u.name)}
                                                            className="text-xs px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                        >
                                                            🔑
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                            className={`text-xs px-2 py-1 rounded-lg ${u.is_active
                                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                }`}
                                                        >
                                                            {u.is_active ? '❌' : '✓'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">WhatsApp Settings</h2>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">WhatsApp Group Link</label>
                                <input
                                    type="url"
                                    value={whatsappLink}
                                    onChange={(e) => setWhatsappLink(e.target.value)}
                                    placeholder="https://chat.whatsapp.com/..."
                                    className="w-full p-3 border rounded-lg focus:border-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This link will be used for direct sharing to the ashram group
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : '💾 Save Settings'}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
