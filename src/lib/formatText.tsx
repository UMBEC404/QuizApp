import React from "react";

export function formatText(text: string): React.ReactNode[] {
  if (!text) return [];

  let processed = text;

  // Fractions: 2/3 → 2⁄3
  processed = processed.replace(/(\d+)\s*\/\s*(\d+)/g, "$1⁄$2");

  // x^2 → x² (ONLY digits)
  processed = processed.replace(/\^(\d+)/g, (_, exp) =>
    exp
      .split("")
      .map((d: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)])
      .join("")
  );

  const parts: React.ReactNode[] = [];
  let key = 0;

  while (processed.length > 0) {
    // **bold**
    const bold = processed.match(/\*\*(.*?)\*\*/);
    // _italic_
    const italic = processed.match(/_(.*?)_/);

    const next =
      !bold ? italic :
      !italic ? bold :
      bold.index! < italic.index! ? bold : italic;

    if (!next) {
      parts.push(processed);
      break;
    }

    if (next.index! > 0) {
      parts.push(processed.slice(0, next.index));
    }

    if (next[0].startsWith("**")) {
      parts.push(<strong key={key++}>{next[1]}</strong>);
    } else {
      parts.push(<em key={key++}>{next[1]}</em>);
    }

    processed = processed.slice(next.index! + next[0].length);
  }

  return parts;
}
