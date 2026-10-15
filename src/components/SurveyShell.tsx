import type { ReactNode } from "react";
import { sections, type SurveySection } from "../config/sections";

type SurveyShellProps = {
  activeSection: SurveySection;
  activeSectionIndex: number;
  onNavigate: (index: number) => void;
  progress: ReactNode;
  estimate: ReactNode;
};

export function SurveyShell({
  activeSection,
  activeSectionIndex,
  onNavigate,
  progress,
  estimate,
}: SurveyShellProps) {
  const previousDisabled = activeSectionIndex === 0;
  const continueDisabled = activeSectionIndex === sections.length - 1;

  return (
    <div className="survey-page">
      <header className="site-header survey-header">
        <a className="wordmark" href="/" aria-label="ACBJ Survey Navigator home">
          <span className="wordmark-mark" aria-hidden="true">
            A
          </span>
          <span>ACBJ</span>
        </a>
        <span className="header-product-name">Survey Navigator</span>
        <span className="save-status" role="status">
          <span className="save-status-dot" aria-hidden="true" />
          Progress saved
        </span>
      </header>

      <div className="survey-layout">
        <aside className="survey-sidebar" aria-label="Survey overview">
          <div className="sidebar-section">
            <p className="sidebar-heading">YOUR PROGRESS</p>
            {progress}
          </div>
          <div className="sidebar-estimate">{estimate}</div>
          <p className="sidebar-footnote">
            Your answers help us build a clearer picture of your business.
          </p>
        </aside>

        <main className="survey-main">
          <div className="question-card">
            <p className="eyebrow">{activeSection.label}</p>
            <h1>{activeSection.title}</h1>
            <p className="question-intro">{activeSection.description}</p>
            <div className="coming-soon" role="note">
              <span className="coming-soon-icon" aria-hidden="true">
                ✳
              </span>
              <div>
                <h2>Your survey starts here</h2>
                <p>
                  This is the starting shell for the survey. Questions will be
                  added in a later stage.
                </p>
              </div>
            </div>
            <nav className="step-navigation" aria-label="Survey navigation">
              <button
                className="button button-secondary"
                disabled={previousDisabled}
                onClick={() => onNavigate(activeSectionIndex - 1)}
              >
                <span aria-hidden="true">←</span>
                Previous
              </button>
              <button
                className="button button-primary"
                disabled={continueDisabled}
                onClick={() => onNavigate(activeSectionIndex + 1)}
              >
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
}
