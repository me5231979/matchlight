import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Wordmark } from '../components/Nav';
import { company as c } from '../lib/company';

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Matchlight`;
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[300] rounded-full bg-bone px-4 py-2 text-ink">
        Skip to content
      </a>
      <header className="border-b border-line">
        <nav aria-label="Primary" className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-12">
          <a href="/" className="text-[20px] text-bone" aria-label="Matchlight home">
            <Wordmark />
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-[15px] text-bone/80 hover:text-bone">
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden /> Back to site
          </a>
        </nav>
      </header>
      <main id="main" className="wrap max-w-[760px] py-20 md:py-28">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] text-bone md:text-h1">{title}</h1>
        <div className="legal mt-12">{children}</div>
      </main>
      <footer className="border-t border-line">
        <div className="wrap flex flex-wrap justify-between gap-4 py-8 text-[13px] text-ash">
          <span>
            © {new Date().getFullYear()} {c.legalName}
          </span>
          <span className="flex gap-6">
            <a href="/privacy" className="link-strike hover:text-bone">
              Privacy
            </a>
            <a href="/legal" className="link-strike hover:text-bone">
              Legal notice
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}

export function Privacy() {
  return (
    <Shell title="Privacy notice">
      <p className="label text-ash">Last updated {c.privacyUpdated}</p>

      <h2>The short version</h2>
      <p>
        This site has no cookies, no analytics, no ad trackers, and no forms. We do not sell or share personal information. The
        only personal data involved is what our host logs to serve the site, and anything you choose to send us by email.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {c.legalName}, {c.street}, {c.city}, {c.country}. Email: <a href={`mailto:${c.email}`}>{c.email}</a>.
      </p>

      <h2>What happens when you visit</h2>
      <p>
        The site is hosted by Vercel Inc. When your browser requests a page, Vercel processes technical data to deliver it and
        keep the service secure: your IP address, browser and device type, the page requested, the referring page, and the time
        of the request. These server logs are kept for a limited period and are not used to identify or profile you. Vercel may
        process this data in the United States and other countries; transfers rely on safeguards such as the European Commission’s
        Standard Contractual Clauses.
      </p>
      <p>
        Legal basis (GDPR, where it applies): our legitimate interest in running a secure, working website (Art. 6(1)(f)).
      </p>

      <h2>Fonts and media</h2>
      <p>
        All fonts, images, and animations are served from this site. Your browser does not contact Google Fonts, a video service,
        or any other third party when you load these pages.
      </p>

      <h2>Storage on your device</h2>
      <p>
        We store one small value in your browser’s session storage (<code>ml-struck</code>) so the opening animation plays only
        once per visit. It never leaves your device and is deleted when you close the tab. It is not a cookie and is not used for
        tracking.
      </p>

      <h2>When you email us</h2>
      <p>
        If you write to <a href={`mailto:${c.email}`}>{c.email}</a>, we use your name, address, and message to reply and to scope
        any work you ask about. We keep it as long as the conversation or project needs it, and for any period the law requires
        for business records. Legal basis: steps prior to a contract and our legitimate interest in answering you (Art. 6(1)(b)
        and (f)).
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us for a copy of your personal data, and ask us to correct it, delete it, restrict or object to its use, or
        hand it to you in a portable format. Write to <a href={`mailto:${c.email}`}>{c.email}</a>. If you are in the EU or UK,
        you can also complain to your local data protection authority.
      </p>
      <p>
        California residents: we do not sell or share personal information, and we do not use it for targeted advertising. You
        have the right to know, correct, and delete the personal information we hold about you.
      </p>

      <h2>Changes</h2>
      <p>
        If we add analytics, a contact form, or anything else that collects data, we will update this notice first and change
        the date at the top.
      </p>
    </Shell>
  );
}

export function LegalNotice() {
  return (
    <Shell title="Legal notice">
      <p className="text-ash">Information provided under § 5 DDG (Germany) and § 25 MedienG (Austria).</p>

      <h2>Provider</h2>
      <p>
        {c.legalName}
        <br />
        {c.legalForm}
        <br />
        {c.street}
        <br />
        {c.city}
        <br />
        {c.country}
      </p>

      <h2>Represented by</h2>
      <p>{c.representedBy}</p>

      <h2>Contact</h2>
      <p>
        Email: <a href={`mailto:${c.email}`}>{c.email}</a>
        <br />
        Phone: {c.phone}
      </p>

      <h2>Register</h2>
      <p>{c.register}</p>

      <h2>VAT</h2>
      <p>{c.vatId}</p>

      <h2>Responsible for content</h2>
      <p>{c.contentResponsible}</p>

      <h2>Liability for links</h2>
      <p>
        This site may link to external websites. We have no control over their content and are not responsible for it. If we
        learn that a linked page breaks the law, we will remove the link.
      </p>

      <h2>Copyright</h2>
      <p>
        The design, text, illustrations, and code of this site are the work of {c.tradingName} unless noted otherwise. Fonts
        (Geist, Geist Mono, Instrument Serif) are used under the SIL Open Font License 1.1.
      </p>

      <h2>Dispute resolution</h2>
      <p>We are not obliged and not willing to take part in dispute resolution proceedings before a consumer arbitration board.</p>
    </Shell>
  );
}
