import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/** Markdown written in the Admin web. Raw HTML is not rendered. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-pc", className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            const external = !!href && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
