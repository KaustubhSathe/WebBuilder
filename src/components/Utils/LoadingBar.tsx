"use client";

import { useEffect, useState } from "react";

interface LoadingBarProps {
    duration?: number; // Duration in milliseconds
    onComplete?: () => void;
}

const LoadingBar: React.FC<LoadingBarProps> = (
    { duration = 2000, onComplete },
) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const endTime = startTime + duration;

        const updateProgress = () => {
            const now = Date.now();
            const newProgress = Math.min(
                ((now - startTime) / duration) * 100,
                100,
            );
            setProgress(newProgress);

            if (now < endTime) {
                requestAnimationFrame(updateProgress);
            } else {
                onComplete?.();
            }
        };

        requestAnimationFrame(updateProgress);
    }, [duration, onComplete]);

    return (
        <div className="w-[300px] flex flex-col items-center gap-6">
            <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-pulse"
            >
                <rect
                    x="6"
                    y="8"
                    width="36"
                    height="32"
                    rx="2"
                    stroke="#3B82F6"
                    strokeWidth="2"
                />
                <path
                    d="M6 14H42"
                    stroke="#3B82F6"
                    strokeWidth="2"
                />
                <circle
                    cx="11"
                    cy="11"
                    r="1.5"
                    fill="#3B82F6"
                />
                <circle
                    cx="16"
                    cy="11"
                    r="1.5"
                    fill="#3B82F6"
                />
                <circle
                    cx="21"
                    cy="11"
                    r="1.5"
                    fill="#3B82F6"
                />
                <rect
                    x="12"
                    y="20"
                    width="24"
                    height="14"
                    rx="1"
                    stroke="#3B82F6"
                    strokeWidth="2"
                />
                <path
                    d="M18 26L24 31L30 26"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="h-1 w-full bg-[#3c3c3c] rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default LoadingBar;
