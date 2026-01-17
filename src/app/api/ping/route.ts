import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Keep-alive ping endpoint - call this from external cron to prevent Supabase sleep
export async function GET() {
    try {
        // Simple query to keep database awake
        const { data, error } = await supabase
            .from('keep_alive')
            .update({ last_ping: new Date().toISOString() })
            .eq('id', 1)
            .select()
            .single();

        if (error) {
            // If keep_alive table doesn't exist, just do a simple query
            const { data: pingData } = await supabase
                .from('sadhaks')
                .select('id')
                .limit(1);

            return NextResponse.json({
                success: true,
                message: 'Database pinged (fallback)',
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Database pinged successfully',
            last_ping: data?.last_ping,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
