"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HtmlEditor({ value, onChange, placeholder }: HtmlEditorProps) {
  const [mounted, setMounted] = useState(false);

  // This ensures the component renders only on the client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // This is the fallback UI while the component is mounted on the client side
    return (
      <div className="flex h-64 items-center justify-center border rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Write something..."}
      className="w-full h-64 border rounded-md p-2"
    />
  );
}
