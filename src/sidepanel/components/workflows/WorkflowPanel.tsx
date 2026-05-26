import { useWorkflowSession } from '../../hooks/useWorkflowSession';
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
    <section className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
      <RecordingControls
        isRecording={isRecording}
        stepCount={recordedSteps.length}
        onStart={startRecording}
        onSave={stopRecording}
        onDiscard={discardRecording}
      />
      {error && (
        <div className="rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-300">{error}</div>
      )}
      <div className="flex-1 overflow-y-auto">
        <WorkflowList
          workflows={workflows}
          replay={replay}
          onPlay={startReplay}
          onPause={pauseReplay}
          onResume={resumeReplay}
          onStop={stopReplay}
          onDelete={(id) => void removeWorkflow(id)}
        />
      </div>
    </section>
  );
}
