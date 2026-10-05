/** Brand marks for the social sign-in buttons (simple single-path versions). */
export function SocialIcon({ id, className = "size-5" }: { id: string; className?: string }) {
  switch (id) {
    case "google":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="6" fill="#06C755" />
          <path
            fill="#fff"
            d="M19.4 11.1c0-3.3-3.3-6-7.4-6s-7.4 2.7-7.4 6c0 3 2.6 5.4 6.2 5.9.2 0 .6.2.7.4v1.2s0 .7.6.4c.6-.3 3.4-2 4.6-3.4 1.8-1.4 2.7-2.8 2.7-4.5Zm-10.6 1.9H7.3a.4.4 0 0 1-.4-.4V9.7c0-.2.2-.4.4-.4s.4.2.4.4v2.5h1.1c.2 0 .4.2.4.4s-.2.4-.4.4Zm1.5-.4a.4.4 0 0 1-.8 0V9.7a.4.4 0 0 1 .8 0v2.9Zm3.6 0c0 .2-.1.3-.3.4h-.1l-.3-.2-1.5-2v1.8a.4.4 0 0 1-.8 0V9.7c0-.2.1-.3.3-.4h.1l.3.2 1.5 2V9.7a.4.4 0 0 1 .8 0v2.9Zm2.4-1.8c.2 0 .4.2.4.4s-.2.4-.4.4h-1.1v.7h1.1c.2 0 .4.2.4.4s-.2.4-.4.4h-1.5a.4.4 0 0 1-.4-.4V9.7c0-.2.2-.4.4-.4h1.5c.2 0 .4.2.4.4s-.2.4-.4.4h-1.1v.7h1.1Z"
          />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <path
            fill="currentColor"
            d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.2-3.1-.1-.4-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
          />
        </svg>
      );
    default:
      return null;
  }
}
