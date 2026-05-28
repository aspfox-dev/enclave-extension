import { useWorkflowSession } from '../../hooks/useWorkflowSession';
import { CommunityHub } from './CommunityHub';
import { RecordingControls } from './RecordingControls';
import { WorkflowList } from './WorkflowList';

export function WorkflowPanel() {
  const {
    isRecording,
    recordedSteps,
    workflows,
    replay,
    error,
    startRecording,
    stopRecording,
    discardRecording,
    startReplay,
    pauseReplay,
    resumeReplay,
    stopReplay,
    removeWorkflow,
  } = useWorkflowSession();

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      {/* Recording controls zone */}
      <div className="shrink-0 px-4 pb-3 pt-4">
        <RecordingControls
          isRecording={isRecording}
          stepCount={recordedSteps.length}
          onStart={startRecording}
          onSave={stopRecording}
          onDiscard={discardRecording}
        />
        {error && (
          <div className="mt-2 border-l-2 border-status-error/60 pl-3 py-1.5">
            <p className="text-[12px] text-status-error">{error}</p>
          </div>
        )}
      </div>

      {/* Workflow list zone */}
      <div className="flex-1 overflow-y-auto border-t border-surface-border px-4 py-3">
        <WorkflowList
          workflows={workflows}
          replay={replay}
          onPlay={startReplay}
          onPause={pauseReplay}
          onResume={resumeReplay}
          onStop={stopReplay}
          onDelete={(id) => void removeWorkflow(id)}
        />
        <CommunityHub />
      </div>
    </section>
  );
}
