"use client";

import { Shield } from "lucide-react";

interface VideoSecurityErrorProps {
  errorCode: string;
  browserName?: string | null;
  className?: string;
}

/**
 * Component hiển thị lỗi bảo mật - không tiết lộ chi tiết
 */
export function VideoSecurityError({
  errorCode,
  className,
}: VideoSecurityErrorProps) {
  const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 via-black to-gray-900 ${className}`}
    >
      <div className="aspect-video flex flex-col items-center justify-center p-8 text-center">
        {/* Error icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
          <div className="relative bg-red-500/10 p-4 rounded-full border border-red-500/30">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Error code */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white font-mono tracking-wider">
            Lỗi {errorCode}
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-2">
            Vi phạm bảo mật
          </p>
        </div>

        {/* Simple message */}
        <div className="max-w-sm">
          <p className="text-gray-400 text-sm">
            Không thể phát video. Vui lòng liên hệ hỗ trợ nếu cần.
          </p>
          <p className="text-gray-600 text-xs font-mono mt-4">
            REF: {errorCode}-{randomHash}
          </p>
        </div>
      </div>
    </div>
  );
}
