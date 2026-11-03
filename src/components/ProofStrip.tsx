/**
 * PLACEHOLDER CONTENT. Swap the entries below for real client logos or build
 * screenshots before launch. Kept quiet on purpose: Ash on Char, no Ember.
 */
const PLACEHOLDER_PROOF = [
  'Client logo',
  'Negotiation sim',
  'Client logo',
  'Onboarding platform',
  'Client logo',
  'Safety walkthrough',
  'Client logo',
  'Manager toolkit',
];

export default function ProofStrip() {
  const row = [...PLACEHOLDER_PROOF, ...PLACEHOLDER_PROOF];
  return (
    <section aria-label="Proof (placeholder)" className="relative bg-char py-20 md:py-28">
      <div className="wrap mb-10 flex items-center justify-between">
        <p className="label text-ash">Recent builds</p>
        <p className="label rounded-full border border-dashed border-ash/50 px-3 py-1 text-ash">Placeholder</p>
      </div>
      <div
        className="marquee relative overflow-hidden"
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)' }}
      >
        <ul className="marquee-track flex w-max gap-4 motion-reduce:flex-wrap" aria-hidden={false}>
          {row.map((p, i) => (
            <li
              key={i}
              aria-hidden={i >= PLACEHOLDER_PROOF.length}
              className="flex h-24 w-64 shrink-0 items-center justify-center rounded-card border border-dashed border-bone/15 font-mono text-[12px] uppercase tracking-[0.08em] text-ash"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
