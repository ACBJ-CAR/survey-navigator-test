type WelcomeScreenProps = {
  onStart: () => void;
  onResume: () => void;
};

export function WelcomeScreen({ onStart, onResume }: WelcomeScreenProps) {
  return (
    <main className="welcome-page">
      <header className="site-header welcome-header">
        <a className="wordmark" href="/" aria-label="ACBJ Survey Navigator home">
          <span className="wordmark-mark" aria-hidden="true">
            A
          </span>
          <span>ACBJ</span>
        </a>
        <span className="header-product-name">Survey Navigator</span>
      </header>

      <section className="welcome-content" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p className="eyebrow">A clearer picture of your business</p>
          <h1 id="welcome-title">
            Your business story,
            <br />
            <span>one step at a time.</span>
          </h1>
          <p className="welcome-description">
            A guided survey that helps us understand your business. It’s
            straightforward, secure, and you can pick up where you left off.
          </p>
          <div className="welcome-actions">
            <button className="button button-primary" onClick={onStart}>
              Start survey
              <span aria-hidden="true">→</span>
            </button>
            <button className="button button-secondary" onClick={onResume}>
              Resume survey
            </button>
          </div>
          <p className="welcome-note">
            Take your time. You can review each step as you go.
          </p>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit art-orbit-outer" />
          <div className="art-orbit art-orbit-inner" />
          <div className="art-card">
            <span className="art-card-label">YOUR BUSINESS</span>
            <span className="art-card-line art-card-line-long" />
            <span className="art-card-line art-card-line-short" />
            <span className="art-card-check">✓</span>
          </div>
          <span className="art-spark art-spark-one">✳</span>
          <span className="art-spark art-spark-two">✦</span>
          <span className="art-dot art-dot-one" />
          <span className="art-dot art-dot-two" />
        </div>
      </section>

      <footer className="welcome-footer">
        <span>A guided experience from American City Business Journals</span>
        <span>Thoughtful questions. A clearer picture.</span>
      </footer>
    </main>
  );
}
