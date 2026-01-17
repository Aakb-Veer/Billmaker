'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, Sadhak } from '@/lib/supabase';

interface SadhakComboboxProps {
    onSelect: (sadhak: Sadhak) => void;
    selectedSadhak: Sadhak | null;
    onClear: () => void;
}

export default function SadhakCombobox({ onSelect, selectedSadhak, onClear }: SadhakComboboxProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Sadhak[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddNew, setShowAddNew] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Search sadhaks in database
    const searchSadhaks = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setShowAddNew(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('sadhaks')
                .select('*')
                .ilike('name', `%${searchQuery}%`)
                .limit(10);

            if (error) {
                console.error('Search error:', error);
                setResults([]);
                return;
            }

            setResults(data || []);
            setShowAddNew((data?.length || 0) === 0);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query || selectedSadhak) {
            return;
        }

        const timer = setTimeout(() => {
            searchSadhaks(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, selectedSadhak, searchSadhaks]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Add new sadhak with duplicate check
    const handleAddNew = async () => {
        if (!query.trim()) return;

        setIsAdding(true);
        try {
            // First check if sadhak already exists (case insensitive)
            const { data: existing, error: checkError } = await supabase
                .from('sadhaks')
                .select('*')
                .ilike('name', query.trim())
                .maybeSingle();

            if (checkError) {
                console.error('Check error:', checkError);
                alert('Error checking for existing Sadhak');
                return;
            }

            if (existing) {
                // Sadhak already exists - ask user to select instead
                const confirmSelect = confirm(
                    `"${existing.name}" નામનો સાધક પહેલેથી અસ્તિત્વમાં છે.\n(Sadhak already exists)\n\nઆ સાધક પસંદ કરવા OK દબાવો.`
                );
                if (confirmSelect) {
                    onSelect(existing);
                    setQuery('');
                    setIsOpen(false);
                    setResults([]);
                }
                return;
            }

            // Insert new sadhak
            const { data, error } = await supabase
                .from('sadhaks')
                .insert({ name: query.trim() })
                .select()
                .single();

            if (error) {
                console.error('Insert error:', error);
                alert('સાધક ઉમેરવામાં નિષ્ફળ. ફરી પ્રયાસ કરો.\n(Failed to add Sadhak)');
                return;
            }

            if (data) {
                onSelect(data);
                setQuery('');
                setIsOpen(false);
                setResults([]);
            }
        } catch (err) {
            console.error('Add error:', err);
            alert('સાધક ઉમેરવામાં નિષ્ફળ. ફરી પ્રયાસ કરો.\n(Failed to add Sadhak)');
        } finally {
            setIsAdding(false);
        }
    };

    // Handle selection
    const handleSelect = (sadhak: Sadhak) => {
        onSelect(sadhak);
        setQuery('');
        setIsOpen(false);
        setResults([]);
    };

    // Handle clear
    const handleClear = () => {
        onClear();
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
    };

    if (selectedSadhak) {
        return (
            <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-300 rounded-xl">
                <div className="flex-1">
                    <p className="text-xs text-green-600 font-medium">પસંદ કરેલ સાધક (Selected)</p>
                    <p className="font-bold text-green-800 text-lg">{selectedSadhak.name}</p>
                </div>
                <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                    ✕
                </button>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="સાધકનું નામ લાખો... (Type Sadhak name)"
                    className="w-full p-4 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (query.length >= 2 || results.length > 0) && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {results.length > 0 ? (
                        <>
                            {results.map((sadhak) => (
                                <button
                                    key={sadhak.id}
                                    type="button"
                                    onClick={() => handleSelect(sadhak)}
                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <span className="font-medium">{sadhak.name}</span>
                                </button>
                            ))}
                        </>
                    ) : showAddNew && query.length >= 2 ? (
                        <button
                            type="button"
                            onClick={handleAddNew}
                            disabled={isAdding}
                            className="w-full px-4 py-4 text-left hover:bg-green-50 transition-colors flex items-center gap-3"
                        >
                            {isAdding ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    <span>ઉમેરી રહ્યા છીએ...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl text-green-500">+</span>
                                    <span>
                                        <strong>&quot;{query}&quot;</strong> ઉમેરો
                                        <span className="text-gray-500 text-sm ml-2">(Add new)</span>
                                    </span>
                                </>
                            )}
                        </button>
                    ) : isLoading ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                            શોધી રહ્યા છીએ... (Searching...)
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
