import { LinkButton } from '../components/ui/Button';

const timeline = [
  { year: '2019', title: 'Started in a spare room', desc: 'Two friends who kept buying terrible knockoffs online figured they could do this better.' },
  { year: '2020', title: 'First real partners', desc: 'Signed our first 100 sellers in Japan, Morocco, and Italy. Shipped product #1 — a ceramic teapot from Kyoto.' },
  { year: '2021', title: 'Grew faster than expected', desc: 'Expanded to 14 countries. Added product verification because we got burned by a bad supplier once — never again.' },
  { year: '2022', title: 'Crossed 1M orders', desc: 'Hit a million orders. Moved out of the spare room. Started same-day delivery in a few cities.' },
  { year: '2024', title: 'Still going', desc: 'Over 2 million orders now. Still a small team. Still picky about what we sell.' },
];

export function About() {
  return (
    <div className="min-h-screen bg-background">
      <section className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              We started this because we were tired of getting ripped off online
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vendr exists because buying authentic products from other countries used to be
              a gamble. We wanted to make it boring-reliable. That's pretty much the whole story.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            <div className="py-8 px-4 lg:px-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">2M+</div>
              <div className="text-muted-foreground text-sm">Orders placed</div>
            </div>
            <div className="py-8 px-4 lg:px-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">14</div>
              <div className="text-muted-foreground text-sm">Countries</div>
            </div>
            <div className="py-8 px-4 lg:px-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">150+</div>
              <div className="text-muted-foreground text-sm">Destinations</div>
            </div>
            <div className="py-8 px-4 lg:px-6 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">4.8</div>
              <div className="text-muted-foreground text-sm">Avg. rating</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4 tracking-tight">
                What we actually care about
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                There's a lot of ecommerce out there. Here's why we think we're worth your time.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'We check everything', desc: "Every product sold here is verified. If we can't confirm it's genuine, it doesn't go on the site. We've dropped sellers over this." },
                { title: 'Small makers, fair prices', desc: "Most of our sellers are independent businesses or individual artisans. They set their own prices — we don't push them to go lower." },
                { title: 'Shipping should be boring', desc: "You order something, it shows up in under two weeks. That's it. No mystery, no 'your package is in transit' for 45 days." },
              ].map(item => (
                <div key={item.title} className="bg-card rounded-lg p-5 border border-border">
                  <h3 className="text-foreground font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 tracking-tight">How we got here</h2>

          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-10">
              {timeline.map(item => (
                <div key={item.year} className="relative pl-12">
                  <div className="absolute left-[10px] top-1.5 w-[10px] h-[10px] rounded-full bg-primary" />
                  <span className="text-muted-foreground text-sm font-mono">{item.year}</span>
                  <h3 className="text-foreground text-lg font-semibold mt-1 mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4 tracking-tight">
            Want to take a look?
          </h2>
          <p className="text-muted-foreground mb-8">
            Browse the catalog and see if anything catches your eye. First orders ship free.
          </p>
          <LinkButton to="/products" size="lg">
            Browse products
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
