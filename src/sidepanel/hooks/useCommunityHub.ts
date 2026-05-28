import { useCallback, useEffect, useState } from 'react';

import { saveWorkflow } from '@/shared/storage/workflow-store';
import { type CommunityWorkflow } from '@/shared/types/community';
import { type Workflow } from '@/shared/types/workflow';
import {
  fetchCommunityWorkflows,
  isCacheFresh,
  loadCommunityCache,
} from '@/shared/util/community-hub';

export interface CommunityHubApi {
  workflows: CommunityWorkflow[];
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
  refresh: () => Promise<void>;
  importWorkflow: (workflow: CommunityWorkflow) => Promise<Workflow>;
}

export function useCommunityHub(): CommunityHubApi {
  const [workflows, setWorkflows] = useState<CommunityWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  const load = useCallback(async (forceRefresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const cache = await loadCommunityCache();
      if (cache && !forceRefresh && isCacheFresh(cache)) {
        setWorkflows(cache.workflows);
        setFetchedAt(cache.fetchedAt);
        return;
      }
      const fresh = await fetchCommunityWorkflows();
      setWorkflows(fresh.workflows);
      setFetchedAt(fresh.fetchedAt);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Could not reach the community hub.';
      setError(message);
      const cache = await loadCommunityCache();
      if (cache) {
        setWorkflows(cache.workflows);
        setFetchedAt(cache.fetchedAt);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  const importWorkflow = useCallback(
    async (community: CommunityWorkflow): Promise<Workflow> => {
      const workflow: Workflow = {
        id: crypto.randomUUID(),
        name: community.name,
        description: community.description,
        version: community.version,
        author: community.author,
        createdAt: Date.now(),
        steps: community.steps,
      };
      await saveWorkflow(workflow);
      return workflow;
    },
    [],
  );

  return { workflows, loading, error, fetchedAt, refresh, importWorkflow };
}
