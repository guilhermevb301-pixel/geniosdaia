import React from "react";

interface LinkifyTextProps {
  text: string;
  className?: string;
}

export function LinkifyText({ text, className }: LinkifyTextProps) {
  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        // Recria o regex para testar cada parte (evita problemas com lastIndex)
        if (/^https?:\/\/[^\s]+$/.test(part)) {
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
