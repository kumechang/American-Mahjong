import { CONTACT_EMAIL } from "@/lib/site";

// Renders the site contact address as a mailto link. If no address has been
// configured yet, says so instead of leaving a dead link.
export function ContactLink() {
  if (!CONTACT_EMAIL) {
    return <span>our contact address (being set up)</span>;
  }
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:no-underline">
      {CONTACT_EMAIL}
    </a>
  );
}
