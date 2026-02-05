import React from "react";

interface LinkifyTextProps {
  text: string;
  className?: string;
}

// Adiciona https:// se o URL não tiver protocolo
function ensureProtocol(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

// Verifica se uma string parece ser um URL
function isUrl(text: string): boolean {
  // Padrão: domínio.extensão (com ou sem protocolo/www)
  const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/i;
  return urlPattern.test(text);
}

export function LinkifyText({ text, className }: LinkifyTextProps) {
  // Regex que detecta URLs com ou sem protocolo
  // Captura: http(s)://... OU www.... OU domínio.extensão
  const urlRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  
  const parts = text.split(urlRegex);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part && isUrl(part)) {
          return (
            <a 
              key={i} 
              href={ensureProtocol(part)} 
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
