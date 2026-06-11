#!/usr/bin/env python3
"""Generate the six AC Intelligence service pages from shared templates."""
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LOGO_SVG = '''<svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="40" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#3b82ff"/><stop offset="0.5" stop-color="#6d6bff"/><stop offset="1" stop-color="#ff5fa2"/>
              </linearGradient>
            </defs>
            <path d="M2 26 L11 2 L20 26" stroke="url(#navGrad)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.4 18 H15.6" stroke="url(#navGrad)" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M37 8.5 A 8 8 0 1 0 37 19.5" stroke="url(#navGrad)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          </svg>'''

def nav():
    return f'''  <div class="spectrum-bar" aria-hidden="true"></div>

  <header class="nav" id="nav">
    <div class="nav__inner">
      <a class="brand" href="index.html" aria-label="AC Intelligence home">
        <span class="brand__mark" aria-hidden="true">
          {LOGO_SVG}
        </span>
        <span class="brand__word">Intelligence</span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <a href="index.html#what">What we do</a>
        <a href="index.html#work">How we work</a>
        <a href="index.html#services">Services</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
      </nav>
      <div class="nav__actions">
        <a class="btn btn--primary btn--sm" href="contact.html">Book a call <span class="btn__plus" aria-hidden="true">+</span></a>
        <button class="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu" hidden>
      <a href="index.html#what">What we do</a>
      <a href="index.html#work">How we work</a>
      <a href="index.html#services">Services</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <a class="btn btn--primary" href="contact.html">Book a Discovery Call</a>
    </div>
  </header>'''

def footer():
    return '''  <footer class="footer">
    <div class="container">
      <div class="footer__inner">
        <div class="footer__brand">
          <a class="brand" href="index.html" aria-label="AC Intelligence home">
            <span class="brand__mark" aria-hidden="true">
              <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="footGrad" x1="0" y1="0" x2="40" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="#3b82ff"/><stop offset="0.5" stop-color="#6d6bff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs>
                <path d="M2 26 L11 2 L20 26" stroke="url(#footGrad)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.4 18 H15.6" stroke="url(#footGrad)" stroke-width="2.6" stroke-linecap="round"/>
                <path d="M37 8.5 A 8 8 0 1 0 37 19.5" stroke="url(#footGrad)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
              </svg>
            </span>
            <span class="brand__word">Intelligence</span>
          </a>
          <p class="footer__tagline">AI consulting and implementation for businesses that want measurable results.</p>
        </div>
        <div class="footer__col">
          <h4>Explore</h4>
          <a href="index.html#what">What we do</a>
          <a href="index.html#services">Services</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="footer__col">
          <h4>Get in touch</h4>
          <a href="contact.html">Book a discovery call</a>
          <a href="mailto:hello@acintelligence.co">hello@acintelligence.co</a>
        </div>
      </div>
    </div>
    <div class="footer__bar">
      <p>© 2026 Amaro Campbell Intelligence LLC</p>
      <p>Built to help businesses operate at a higher level.</p>
    </div>
  </footer>'''

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — AC Intelligence</title>
  <meta name="description" content="{desc}" />
  <link rel="icon" href="assets/logomark.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>'''

def esc(s):
    return html.escape(s, quote=False)

def covers_html(covers):
    cards = []
    for t, b in covers:
        cards.append(f'''          <article class="ocard reveal">
            <span class="ocard__mark" aria-hidden="true"></span>
            <h3 class="ocard__title">{esc(t)}</h3>
            <p class="ocard__body">{esc(b)}</p>
          </article>''')
    return "\n".join(cards)

def problems_html(problems):
    items = "\n".join(
        f'            <li><span class="tick">✓</span> {esc(p)}</li>' for p in problems
    )
    return items

def bullets_html(bullets):
    return "\n".join(
        f'              <li><span class="mk" aria-hidden="true"></span> {esc(b)}</li>' for b in bullets
    )

def build_service(d):
    name = d["name"]
    return f'''{HEAD.format(title=esc(name), desc=esc(d["intro"]))}
{nav()}

  <main id="main">
    <section class="contact">
      <div class="contact__glow" aria-hidden="true"></div>
      <div class="container contact__inner">
        <header class="contact__head">
          <p class="eyebrow eyebrow--spectrum reveal"><a href="index.html#services" style="color:inherit">Services</a></p>
          <h1 class="contact__title reveal" data-delay="1">{esc(name)}</h1>
          <p class="contact__lead reveal" data-delay="2">{esc(d["intro"])}</p>
          <div class="page-hero__cta reveal" data-delay="3">
            <a class="btn btn--primary btn--lg" href="contact.html">Book a Discovery Call</a>
            <a class="btn btn--ghost btn--lg" href="index.html#services">All services</a>
          </div>
        </header>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section__head section__head--wide reveal">
          <p class="eyebrow eyebrow--spectrum">What this covers</p>
          <h2 class="section__title">{esc(d["covers_heading"])}</h2>
        </header>
        <div class="outcomes-grid">
{covers_html(d["covers"])}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="band reveal">
          <div class="band__inner">
            <p class="eyebrow eyebrow--spectrum">How we approach it</p>
            <h2 class="band__title">{esc(d["approach_heading"])}</h2>
            <p class="band__sub">{esc(d["approach_body"])}</p>
            <ul class="band__bullets">
{bullets_html(d["approach_bullets"])}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section__head reveal">
          <p class="eyebrow eyebrow--spectrum">Problems it helps solve</p>
          <h2 class="section__title">{esc(d["problems_heading"])}</h2>
        </header>
        <ul class="feature__list reveal" style="max-width:680px">
{problems_html(d["problems"])}
        </ul>
      </div>
    </section>

    <section class="cta-final">
      <div class="container">
        <h2 class="cta-final__title reveal">Let's see if this fits your business.</h2>
        <p class="cta-final__body reveal" data-delay="1">Book a discovery call and we will look at where {esc(d["short"])} could create the most value for the way you operate.</p>
        <div class="cta-final__actions reveal" data-delay="2">
          <a class="btn btn--primary btn--lg" href="contact.html">Book a Discovery Call</a>
          <p class="cta-final__note">No obligation. Or email <a href="mailto:hello@acintelligence.co">hello@acintelligence.co</a></p>
        </div>
      </div>
    </section>
  </main>

{footer()}

  <script src="script.js"></script>
</body>
</html>
'''

SERVICES = [
    {
        "slug": "ai-strategy-advisory", "name": "AI Strategy & Advisory",
        "short": "AI strategy",
        "intro": "We help you decide where AI is worth applying, and where it is not. Practical, business-first guidance grounded in how your operation actually runs.",
        "covers_heading": "From business review to a plan you can act on.",
        "covers": [
            ("Business & workflow review", "We assess how the business operates today and where time, cost, or quality is being lost."),
            ("Opportunity identification", "We pinpoint the specific places AI can realistically improve output, not vague potential."),
            ("Implementation planning", "A clear, sequenced plan for what to build, in what order, and why."),
            ("Practical guidance", "Straight answers on tools, trade-offs, and what is worth the investment."),
        ],
        "approach_heading": "We start with the business, not the technology.",
        "approach_body": "Before recommending anything, we look at how work moves through your team. The plan that follows is built around real constraints and goals, so it holds up once it meets the day-to-day.",
        "approach_bullets": ["Grounded in operational reality", "Clear priorities and sequencing", "No technology for its own sake"],
        "problems_heading": "When this is the right place to start.",
        "problems": ["Unsure where AI actually fits the business", "Tool decisions being made without an operational plan", "AI pilots that never reach real, daily use"],
    },
    {
        "slug": "automation-systems", "name": "Automation Systems",
        "short": "automation",
        "intro": "We design and build automations that take repetitive work off your team and keep it running quietly in the background.",
        "covers_heading": "Automate the repetitive work, end to end.",
        "covers": [
            ("Workflow automation", "Automate the repetitive steps in how work gets done, from intake to handoff."),
            ("Internal process improvement", "Tighten the processes around the automation so the whole flow runs cleaner."),
            ("System & tool integration", "Connect the tools you already use so data moves without copy-paste."),
            ("Reliable operation", "Automations built to be monitored and maintained, not left to break silently."),
        ],
        "approach_heading": "Automation that fits how you already work.",
        "approach_body": "We map the real process first, then automate around it, so the systems support your team instead of forcing a new way of working.",
        "approach_bullets": ["Built around existing tools", "Designed for practical use", "Maintained after launch"],
        "problems_heading": "What this typically removes.",
        "problems": ["Too much manual, repetitive admin", "Work falling through the cracks between tools", "Processes that depend on one person remembering"],
    },
    {
        "slug": "ai-powered-websites", "name": "AI-Powered Websites",
        "short": "a smarter website",
        "intro": "Websites and digital experiences built to convert, support growth, and create smoother customer journeys, with AI woven in where it adds value.",
        "covers_heading": "A site built to perform, not just to look good.",
        "covers": [
            ("High-converting design", "Clean, premium sites built to turn visitors into qualified leads."),
            ("Smart lead capture", "Forms, flows, and follow-up that route the right leads to the right place."),
            ("AI-assisted journeys", "On-site assistance and personalization that help customers find what they need."),
            ("Built for growth", "Digital infrastructure that scales as the business grows."),
        ],
        "approach_heading": "Design that serves the business, not just the brand.",
        "approach_body": "Every page is built around a clear job: move the right visitor one step closer to working with you. The result looks premium and performs.",
        "approach_bullets": ["Conversion-focused structure", "Lead flow built in", "Room to grow"],
        "problems_heading": "When a new site actually pays off.",
        "problems": ["A website that looks fine but does not convert", "Leads that slip through after the first click", "A digital presence that does not match the business"],
    },
    {
        "slug": "voice-conversational-ai", "name": "Voice & Conversational AI",
        "short": "conversational AI",
        "intro": "Voice agents, chat systems, and communication workflows that improve responsiveness and save your team time.",
        "covers_heading": "Faster, more consistent communication.",
        "covers": [
            ("Voice agents", "AI voice that handles routine calls and questions in your tone."),
            ("Chat systems", "On-site and messaging assistants trained on your business."),
            ("Communication workflows", "Automated follow-up and routing across channels."),
            ("Clean human handoff", "Escalation to your team with full context attached."),
        ],
        "approach_heading": "Responsive without losing the human touch.",
        "approach_body": "We build conversational systems that handle the routine and know when to hand off, so customers get fast answers and your team keeps the conversations that matter.",
        "approach_bullets": ["Trained on your business", "Routine handled automatically", "Clean handoff to staff"],
        "problems_heading": "What this helps with.",
        "problems": ["Slow or inconsistent response times", "Routine questions eating staff hours", "Customers waiting outside business hours"],
    },
    {
        "slug": "ai-marketing-systems", "name": "AI Marketing Systems",
        "short": "marketing systems",
        "intro": "Content workflows, campaign support systems, lead nurture flows, and AI-assisted marketing operations.",
        "covers_heading": "The operational backbone behind your marketing.",
        "covers": [
            ("Content workflows", "Systems that help produce and organize content consistently."),
            ("Campaign support", "AI-assisted support for planning and running campaigns."),
            ("Lead nurture", "Automated nurture flows that keep leads warm and moving."),
            ("Marketing operations", "The connective systems that keep marketing running smoothly."),
        ],
        "approach_heading": "Marketing systems that keep working between campaigns.",
        "approach_body": "We build the operational backbone behind your marketing, so content, nurture, and follow-up keep moving without constant manual effort.",
        "approach_bullets": ["Consistent output", "Automated nurture", "Built to scale"],
        "problems_heading": "Where this makes a difference.",
        "problems": ["Inconsistent content output", "Leads going cold after first contact", "Marketing work that does not scale"],
    },
    {
        "slug": "custom-implementation", "name": "Custom Implementation",
        "short": "a custom build",
        "intro": "Tailored AI systems designed around your workflows, priorities, and operational goals, for needs that do not fit a template.",
        "covers_heading": "Built around your business, end to end.",
        "covers": [
            ("Discovery & scoping", "We define the real problem and what a working solution looks like."),
            ("Custom build", "Systems built specifically around how your business operates."),
            ("Integration", "Fit into your existing stack and workflows."),
            ("Ongoing refinement", "Tuned and improved after launch as needs evolve."),
        ],
        "approach_heading": "Built around your business, not a template.",
        "approach_body": "When the need is specific, the system should be too. We scope carefully, build around your actual workflows, and stay involved to keep it delivering.",
        "approach_bullets": ["Scoped to your real need", "Built around your stack", "Refined over time"],
        "problems_heading": "When custom is the right call.",
        "problems": ["Off-the-shelf tools that almost fit", "Unique workflows no product supports", "Needs that span several systems"],
    },
]

for s in SERVICES:
    out = ROOT / f"{s['slug']}.html"
    out.write_text(build_service(s))
    print("wrote", out.name)
print("done")
