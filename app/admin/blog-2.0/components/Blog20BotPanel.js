"use client";

import MailerLiteSessionAlert from "./MailerLiteSessionAlert";
import MailerLiteBotControls from "./MailerLiteBotControls";
import BotPushProgress from "./BotPushProgress";

/**
 * Single stack for MailerLite bot UI — keeps OTP + controls + progress from jumping separately.
 */
export default function Blog20BotPanel({
  settings,
  botStatus,
  canEdit,
  onRefresh,
  processingDraft,
  retryDraft,
  onStartPush,
  botUiActive,
  ghostProcessing,
  onBotComplete,
}) {
  return (
    <div className="b20-bot-panel" aria-live="polite">
      <MailerLiteSessionAlert
        settings={settings}
        canEdit={canEdit}
        onRefresh={onRefresh}
        botStatus={botStatus}
      />
      <MailerLiteBotControls
        botStatus={botStatus}
        processingDraft={processingDraft}
        retryDraft={retryDraft}
        canEdit={canEdit}
        onRefresh={onRefresh}
        onStartPush={onStartPush}
      />
      <BotPushProgress
        active={botUiActive}
        onComplete={onBotComplete}
        canEdit={canEdit}
        botStatus={botStatus}
        ghostProcessing={ghostProcessing}
      />
    </div>
  );
}
