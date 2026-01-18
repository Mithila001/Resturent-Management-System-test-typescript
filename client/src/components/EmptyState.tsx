import type { FC, ReactNode } from "react";
import "../components/ErrorMessage.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actionText?: string | null;
  onAction?: (() => void) | null;
}

const EmptyState: FC<EmptyStateProps> = ({
  icon = "📭",
  title = "No items found",
  description = "",
  actionText = null,
  onAction = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {actionText && onAction && (
        <div className="empty-state-action">
          <button onClick={onAction} className="btn btn-primary">
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
