import React from "react";

const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function toSuperscript(exp: string) {
  return exp
    .split("")
    .map((n) => SUPERSCRIPTS[Number(n)] ?? n)
    .join("");
}

function applyInlineStyles(text: string, keyRef: { key: number }): React.ReactNode[] {
  let t = text;

  // Fractions
  t = t.replace(/(\d+)\s*\/\s*(\d+)/g, "$1⁄$2");

  // Exponents
  t = t.replace(/\^(\d+)/g, (_, exp) => toSuperscript(exp));

  const nodes: React.ReactNode[] = [];

  while (t.length > 0) {
    const patterns = [
      { regex: /\*\*(.*?)\*\*/, type: "bold" },
      { regex: /_(.*?)_/, type: "italic" },
      { regex: /~~(.*?)~~/, type: "strike" },
      { regex: /`(.*?)`/, type: "code" },
    ];

    let match:
      | { regex: RegExp; type: string; result: RegExpMatchArray }
      | null = null;

    for (const p of patterns) {
      const r = t.match(p.regex);
      if (r && (!match || r.index! < match.result.index!)) {
        match = { regex: p.regex, type: p.type, result: r };
      }
    }

    if (!match) {
      nodes.push(t);
      break;
    }

    const { result, type } = match;

    if (result.index! > 0) {
      nodes.push(t.slice(0, result.index));
    }

    const content = result[1];
    const key = keyRef.key++;

    switch (type) {
      case "bold":
        nodes.push(<strong key={key}>{content}</strong>);
        break;
      case "italic":
        nodes.push(<em key={key}>{content}</em>);
        break;
      case "strike":
        nodes.push(<del key={key}>{content}</del>);
        break;
      case "code":
        nodes.push(
          <code
            key={key}
            className="px-1 py-0.5 rounded bg-muted font-mono text-sm"
          >
            {content}
          </code>
        );
        break;
    }

    t = t.slice(result.index! + result[0].length);
  }

  return nodes;
}

export function formatText(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const keyRef = { key: 0 };

  return (
    <>
      {lines.map((line, i) => {
        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const content = headingMatch[2];

          const Tag = `h${level}` as keyof JSX.IntrinsicElements;

          return (
            <Tag
              key={i}
              className={[
                "font-bold mt-6 mb-3",
                level === 1 && "text-3xl",
                level === 2 && "text-2xl",
                level === 3 && "text-xl",
                level === 4 && "text-lg",
                level === 5 && "text-base",
                level === 6 && "text-sm",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {applyInlineStyles(content, keyRef)}
            </Tag>
          );
        }

        // Normal paragraph
        return (
          <p key={i} className="leading-relaxed">
            {applyInlineStyles(line, keyRef)}
          </p>
        );
      })}
    </>
  );
}
