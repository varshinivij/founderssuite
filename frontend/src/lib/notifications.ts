import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

export async function notifyCallStarted(opts: {
  testerId: string;
  matchId: string;
  founderName: string;
  formTitle: string;
}): Promise<void> {
  // Avoid duplicate call notifications within 60s for the same match
  const { data: recent } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', opts.testerId)
    .eq('type', 'call_started')
    .eq('match_id', opts.matchId)
    .gte('created_at', new Date(Date.now() - 60_000).toISOString())
    .maybeSingle();
  if (recent) return;

  await supabase.from('notifications').insert({
    user_id: opts.testerId,
    type: 'call_started',
    title: `${opts.founderName} is calling`,
    body: opts.formTitle,
    match_id: opts.matchId,
  });
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  matchId: string | null;
  read: boolean;
  createdAt: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, match_id, read, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      setNotifications(data.map(row => ({
        id: String(row.id),
        type: String(row.type),
        title: String(row.title),
        body: row.body ? String(row.body) : null,
        matchId: row.match_id ? String(row.match_id) : null,
        read: Boolean(row.read),
        createdAt: String(row.created_at),
      })));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    load(userId);

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        const row = payload.new as Record<string, unknown>;
        setNotifications(prev => [{
          id: String(row.id),
          type: String(row.type),
          title: String(row.title),
          body: row.body ? String(row.body) : null,
          matchId: row.match_id ? String(row.match_id) : null,
          read: Boolean(row.read),
          createdAt: String(row.created_at),
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, load]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(async (uid: string) => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead };
}
