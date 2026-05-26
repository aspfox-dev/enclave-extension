import { ERRORS } from '@/shared/constants/strings';
import {
  AGENT_PORT,
  RESEARCH_PORT,
  type RuntimeRequest,
  WORKFLOW_PORT,
} from '@/shared/types/messaging';

import { AgentSession } from './agent/agent-session';
import { handleChatAsk } from './chat/chat-handler';
import { ResearchSession } from './research/research-session';
import { getActiveWorkflowSession, WorkflowSession } from './workflow/workflow-session';

const TOGGLE_SIDEBAR_COMMAND = 'toggle-sidebar';

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.error(ERRORS.sidePanelBehaviorFailed, error);
  }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== TOGGLE_SIDEBAR_COMMAND || !tab?.windowId) return;

  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error(ERRORS.sidePanelOpenFailed, error);
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === AGENT_PORT) new AgentSession(port);
  else if (port.name === RESEARCH_PORT) new ResearchSession(port);
  else if (port.name === WORKFLOW_PORT) new WorkflowSession(port);
});

chrome.runtime.onMessage.addListener((message: RuntimeRequest, sender, sendResponse) => {
  if (!message?.type) return false;

  if (message.type === 'workflow:event') {
    getActiveWorkflowSession()?.handleRecordedStep(message.step, sender.tab?.id);
    return false;
  }

  if (message.type === 'chat:ask') {
    void (async () => {
      try {
        sendResponse(await handleChatAsk(message));
      } catch (error) {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'The chat request failed.',
        });
      }
    })();
    return true;
  }

  return false;
});
