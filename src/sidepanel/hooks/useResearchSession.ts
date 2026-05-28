import { useCallback, useEffect, useRef, useState } from 'react';

import { deleteReport, listReports } from '@/shared/storage/research-store';
import {
  RESEARCH_PORT,
  type ResearchCommand,
  type ResearchEvent,
} from '@/shared/types/messaging';
import {
  type ResearchPhase,
  type ResearchReport,
  type ResearchSource,
} from '@/shared/types/research';
import { htmlToDataUrl } from '@/shared/util/data-url';

export interface ResearchSessionApi {
  phase: ResearchPhase;
  sources: ResearchSource[];
  aiOverview: string | null;
  history: ResearchReport[];
  error: string | null;
  latestReport: ResearchReport | null;
  start: (topic: string) => void;
  stop: () => void;
  reopenReport: (report: ResearchReport) => void;
  removeReport: (id: string) => Promise<void>;
}

export function useResearchSession(): ResearchSessionApi {
  const [phase, setPhase] = useState<ResearchPhase>('idle');
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [history, setHistory] = useState<ResearchReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<ResearchReport | null>(null);

  const portRef = useRef<chrome.runtime.Port | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      setHistory(await listReports());
    } catch (historyError) {
      console.warn('Enclave: could not load past research reports.', historyError);
    }
  }, []);

  const handleEvent = useCallback((event: ResearchEvent) => {
    switch (event.type) {
      case 'phase':
        setPhase(event.phase);
        return;
      case 'sources':
        setSources(event.sources);
        return;
      case 'source':
        setSources((prev) => {
          const next = [...prev];
          next[event.index] = event.source;
          return next;
        });
        return;
      case 'overview':
        setAiOverview(event.text);
        return;
      case 'log':
        if (event.level === 'error') setError(event.message);
        return;
      case 'done':
        setHistory((prev) => [event.report, ...prev.filter((entry) => entry.id !== event.report.id)]);
        setLatestReport(event.report);
    }
  }, []);

  const connect = useCallback(() => {
    const port = chrome.runtime.connect({ name: RESEARCH_PORT });
    port.onMessage.addListener(handleEvent);
    port.onDisconnect.addListener(() => {
      portRef.current = null;
    });
    portRef.current = port;
    return port;
  }, [handleEvent]);

  useEffect(() => {
    void refreshHistory();
    const port = connect();
    return () => {
      port.disconnect();
      portRef.current = null;
    };
  }, [connect, refreshHistory]);

  const send = useCallback(
    (command: ResearchCommand) => {
      (portRef.current ?? connect()).postMessage(command);
    },
    [connect],
  );

  const start = useCallback(
    (topic: string) => {
      setSources([]);
      setAiOverview(null);
      setError(null);
      setLatestReport(null);
      send({ type: 'start', topic });
    },
    [send],
  );

  const stop = useCallback(() => send({ type: 'stop' }), [send]);

  const reopenReport = useCallback((report: ResearchReport) => {
    void chrome.tabs.create({ url: htmlToDataUrl(report.html) });
  }, []);

  const removeReport = useCallback(
    async (id: string) => {
      await deleteReport(id);
      await refreshHistory();
    },
    [refreshHistory],
  );

  return {
    phase,
    sources,
    aiOverview,
    history,
    error,
    latestReport,
    start,
    stop,
    reopenReport,
    removeReport,
  };
}
