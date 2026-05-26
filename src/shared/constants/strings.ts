export const APP_NAME = 'Enclave';
export const APP_TAGLINE = 'Your local-first browser agent';

export const MODE_LABELS = {
  agent: 'Agent',
  research: 'Research',
  chat: 'Chat',
  workflows: 'Workflows',
  history: 'History',
} as const;

export const MODE_DESCRIPTIONS = {
  agent: 'Describe a goal in plain English and Enclave carries it out across the page, step by step.',
  research: 'Hand over a topic. Enclave searches, reads the top sources, and writes a synthesized report.',
  chat: 'Ask questions about the page you are looking at, with full context.',
  workflows: 'Record a sequence of actions once, then replay it whenever you need it.',
  history: 'Every completed task, with its verification result and a screenshot of where it landed.',
} as const;

export const ACTIONS = {
  openSettings: 'Settings',
  comingSoon: 'In progress',
} as const;

export const AGENT_UI = {
  goalPlaceholder: 'Describe what you want done on this page…',
  runHint: 'Ctrl+Enter to run · Esc to stop',
  run: 'Run',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop',
  emptyLog: 'Your agent run will stream here, step by step.',
} as const;

export const CHAT_UI = {
  placeholder: 'Ask about this page…',
  sendHint: 'Enter to send · Shift+Enter for newline',
  send: 'Send',
  emptyState: 'Ask anything about the page you are viewing.',
  thinking: 'Thinking…',
  quickHint: 'Sends page text only — fastest and cheapest.',
  proHint: 'Adds a live screenshot so the model sees layout and visuals.',
  clear: 'Clear',
} as const;

export const AGENT_STATUS_LABELS = {
  idle: 'Idle',
  running: 'Running',
  paused: 'Paused',
  done: 'Completed',
  failed: 'Failed',
  stopped: 'Stopped',
} as const;

export const SETTINGS_UI = {
  loading: 'Loading settings…',
  apiKeyLabel: 'API key',
  apiKeyPlaceholder: 'Stored only in this browser',
  baseUrlLabel: 'API endpoint',
  modelsHeading: 'Model slots',
  activeBadge: 'Active for runs',
  setActive: 'Use for runs',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  saveError: 'Could not save — try again',
  limitsHeading: 'Agent limits',
  maxSteps: 'Max steps',
  stepDelay: 'Step delay (ms)',
  llmTimeout: 'LLM timeout (ms)',
  wallTimeout: 'Wall timeout (ms)',
  behaviorHeading: 'Behavior',
  visionEscalation: 'Vision escalation',
  memory: 'Persistent memory',
  chatDefault: 'Default chat mode',
} as const;

export const CHAT_SUBMODE_LABELS = {
  quick: 'Quick',
  pro: 'Pro',
} as const;

export const RESEARCH_UI = {
  topicPlaceholder: 'Topic to research…',
  runHint: 'Ctrl+Enter to run · Esc to stop',
  run: 'Research',
  stop: 'Stop',
  phaseSearching: 'Searching Google…',
  phaseReading: 'Reading sources…',
  phaseSynthesizing: 'Writing the synthesis…',
  phaseDone: 'Report ready',
  emptySources: 'Source list will stream here as the run goes.',
  historyHeading: 'Past reports',
  historyEmpty: 'Past reports will show up here once you finish a run.',
  openReport: 'Open',
  delete: 'Delete',
  overviewLabel: 'AI overview',
} as const;

export const RESEARCH_STATUS_LABELS = {
  pending: 'queued',
  active: 'reading',
  done: 'done',
  error: 'error',
  skipped: 'skipped',
} as const;

export const WORKFLOW_UI = {
  startRecording: 'Start recording',
  stopRecording: 'Stop & save',
  discardRecording: 'Discard',
  recordingLabel: 'Recording',
  stepsLabel: 'steps',
  step: 'step',
  workflowNameLabel: 'Workflow name',
  workflowDescLabel: 'Description (optional)',
  defaultName: 'Untitled workflow',
  save: 'Save',
  cancel: 'Cancel',
  play: 'Play',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop',
  delete: 'Delete',
  empty: 'No workflows yet. Start recording to create one.',
  replayRunning: 'Replaying…',
  replayPaused: 'Paused',
  replayDone: 'Replay finished',
  replayFailed: 'Replay failed',
  replayStopped: 'Replay stopped',
} as const;

export const VAULT_UI = {
  heading: 'Personal info vault',
  description:
    'Used only when your agent task asks to fill, register, sign up, apply, or check out. Stored locally and encrypted at rest.',
  nameLabel: 'Name',
  emailLabel: 'Email',
  phoneLabel: 'Phone',
  addressLabel: 'Address',
  dobLabel: 'Date of birth',
  customHeading: 'Custom fields',
  customLabelPlaceholder: 'Label',
  customValuePlaceholder: 'Value',
  addCustom: 'Add field',
  remove: 'Remove',
  save: 'Save vault',
} as const;

export const ERRORS = {
  sidebarMountFailed: 'Enclave sidebar failed to mount: #root element was not found.',
  optionsMountFailed: 'Enclave settings failed to mount: #root element was not found.',
  sidePanelBehaviorFailed: 'Enclave could not configure the side panel to open on toolbar click.',
  sidePanelOpenFailed: 'Enclave could not open the side panel for the active window.',
} as const;
