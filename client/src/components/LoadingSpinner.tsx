import type { FC } from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large" | string;
  text?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = "medium", text = "Loading..." }) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
