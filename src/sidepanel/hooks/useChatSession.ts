import { useCallback, useEffect, useState } from 'react';

import { type ChatSubmode, DEFAULT_CHAT_SUBMODE } from '@/shared/constants/settings';
import { loadSettings } from '@/shared/storage/settings-store';
import { type ChatTurn } from '@/shared/types/chat';
import { type RuntimeRequest, type RuntimeResponse } from '@/shared/types/messaging';

function nextId(): string {
  return Math.random().toString(36).slice(2);
}

export interface ChatSessionApi {
  turns: ChatTurn[];
  submode: ChatSubmode;
  isSending: boolean;
  error: string | null;
  setSubmode: (submode: ChatSubmode) => void;
  send: (content: string) => Promise<void>;
  clear: () => void;
}

export function useChatSession(): ChatSessionApi {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [submode, setSubmode] = useState<ChatSubmode>(DEFAULT_CHAT_SUBMODE);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const settings = await loadSettings();
        if (active) setSubmode(settings.chatSubmode);
      } catch (settingsError) {
        console.warn('Enclave: could not load chat submode preference', settingsError);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isSending) return;

      const userTurn: ChatTurn = { id: nextId(), role: 'user', content: text };
      const next = [...turns, userTurn];
      setTurns(next);
      setError(null);
      setIsSending(true);

      try {
        const request: RuntimeRequest = { type: 'chat:ask', history: next, submode };
        const response = (await chrome.runtime.sendMessage(request)) as RuntimeResponse | undefined;
        if (!response) throw new Error('The background worker did not reply.');
        if (!response.ok) throw new Error(response.error);
        setTurns([...next, { id: nextId(), role: 'assistant', content: response.reply }]);
      } catch (askError) {
        setError(askError instanceof Error ? askError.message : 'The chat request failed.');
      } finally {
        setIsSending(false);
      }
    },
    [turns, submode, isSending],
  );

  const clear = useCallback(() => {
    setTurns([]);
    setError(null);
  }, []);

  return { turns, submode, isSending, error, setSubmode, send, clear };
}
