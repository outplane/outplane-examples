import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

const features = [
  {
    title: "Docs with rhythm",
    description: "A focused layout with a custom home page, doc sidebar, and MDX support.",
    label: "MDX ready",
  },
  {
    title: "Static build flow",
    description: "Build once, serve anywhere. The Docker image runs the compiled site on port 8080.",
    label: "Deployable",
  },
  {
    title: "Out Plane aligned",
    description: "Defaults to 8080 and includes a clear entry point for quick testing.",
    label: "Test friendly",
  },
];

const highlights = [
  {
    title: "Clean navigation",
    description: "A single docs section keeps the demo focused and fast to scan.",
  },
  {
    title: "Readable theming",
    description: "Warm neutrals, teal accents, and a bold serif headline for contrast.",
  },
  {
    title: "Motion with intent",
    description: "Subtle reveal animations guide attention without clutter.",
  },
];

export default function Home() {
  return (
    <Layout title="Docusaurus Example" description="Docusaurus example site for Out Plane demos">
      <main className="op-main">
        <section className="op-hero">
          <div className="container op-hero-inner">
            <span className="op-hero-kicker">Out Plane Examples</span>
            <h1 className="op-hero-title">Docusaurus, tuned for fast doc demos</h1>
            <p className="op-hero-subtitle">
              A clean documentation site with a custom landing page, ready for Docker builds and quick deploy testing.
            </p>
            <div className="op-hero-actions">
              <Link className="button button--primary button--lg" to="/docs/intro">
                Read the intro
              </Link>
              <Link className="button button--secondary button--lg" to="#features">
                View highlights
              </Link>
            </div>
            <div className="op-hero-note">
              Default port: <strong>8080</strong>
            </div>
          </div>
        </section>

        <section id="features" className="op-section">
          <div className="container">
            <div className="op-section-header">
              <h2>What is inside</h2>
              <p>Everything you need to validate a docs pipeline without extra services.</p>
            </div>
            <div className="op-feature-grid">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="op-feature-card"
                  style={{ "--delay": `${index * 0.12}s` }}
                >
                  <div className="op-feature-label">{feature.label}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="op-section op-split">
          <div className="container op-split-inner">
            <div className="op-split-copy">
              <h2>Quick start</h2>
              <p>Build the static site and serve it from the Docker image.</p>
              <ul>
                <li>Docker build and run are already wired for port 8080.</li>
                <li>The docs live at <strong>/docs/intro</strong>.</li>
              </ul>
            </div>
            <div className="op-split-code">
              <pre>
                <code>
                  docker build -t docusaurus-example .
                  {"\n"}
                  docker run --rm -p 8080:8080 docusaurus-example
                </code>
              </pre>
            </div>
          </div>
        </section>

        <section className="op-section op-secondary">
          <div className="container">
            <div className="op-section-header">
              <h2>Why this layout works</h2>
              <p>Short sections and bold contrast keep the content legible on mobile and desktop.</p>
            </div>
            <div className="op-highlight-grid">
              {highlights.map((item, index) => (
                <div
                  key={item.title}
                  className="op-highlight-card"
                  style={{ "--delay": `${index * 0.1}s` }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
