import { VERIFICATION_UI } from '@/shared/constants/strings';
import {
  type TaskVerification,
  type VerificationConfidence,
  type VerificationVerdict,
} from '@/shared/types/verification';

interface VerificationBadgeProps {
  verification: TaskVerification;
}

const VERDICT_LABEL: Record<VerificationVerdict, string> = {
  succeeded: VERIFICATION_UI.succeeded,
  uncertain: VERIFICATION_UI.uncertain,
  failed: VERIFICATION_UI.failed,
};

const VERDICT_BORDER: Record<VerificationVerdict, string> = {
  succeeded: 'border-l-2 border-status-success/70',
  uncertain: 'border-l-2 border-status-warning/70',
  failed: 'border-l-2 border-status-error/70',
};

const VERDICT_LABEL_COLOR: Record<VerificationVerdict, string> = {
  succeeded: 'text-status-success',
  uncertain: 'text-status-warning',
  failed: 'text-status-error',
};

const CONFIDENCE_LABEL: Record<VerificationConfidence, string> = {
  high: VERIFICATION_UI.confidenceHigh,
  medium: VERIFICATION_UI.confidenceMedium,
  low: VERIFICATION_UI.confidenceLow,
};

export function VerificationBadge({ verification }: VerificationBadgeProps) {
  const { verdict, confidence, explanation, method } = verification;
  const methodLabel = method === 'vision' ? VERIFICATION_UI.methodVision : VERIFICATION_UI.methodDom;

  return (
    <div className={`pl-3 py-2 ${VERDICT_BORDER[verdict]}`}>
      <span className={`text-[13px] font-semibold ${VERDICT_LABEL_COLOR[verdict]}`}>
        {VERDICT_LABEL[verdict]}
      </span>
      {explanation && (
        <p className="mt-0.5 text-[12px] leading-snug text-slate-300">{explanation}</p>
      )}
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
        {methodLabel} · {CONFIDENCE_LABEL[confidence]}
      </p>
    </div>
  );
}
