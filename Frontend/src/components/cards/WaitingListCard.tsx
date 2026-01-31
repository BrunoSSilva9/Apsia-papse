import React from "react";
import { Link } from "react-router-dom";
import type {
  WaitingListCardProps,
  CardColor,
  CardIcon,
} from "../../types/index";

const WaitingListCard: React.FC<WaitingListCardProps> = ({
  title,
  description,
  color,
  icon,
  to = "#",
}) => {
  const colorClasses: Record<CardColor, string> = {
    blue: "bg-blue-500 hover:bg-blue-600",
    amber: "bg-amber-400 hover:bg-amber-500",
    darkblue: "bg-blue-800 hover:bg-blue-900",
    coral: "bg-orange-500 hover:bg-orange-600",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  const iconComponents: Record<CardIcon, React.ReactNode> = {
    users: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    clipboard: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    document: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    refresh: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    shield: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  };

  return (
    <Link
      to={to}
      className={`${colorClasses[color]} text-white rounded-lg p-6 shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105 block no-underline`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{iconComponents[icon]}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default WaitingListCard;
