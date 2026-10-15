import { sections } from "../config/sections";
import { getProgressPercent } from "../utils/progress";

type SectionProgressProps = {
  activeIndex: number;
};

export function SectionProgress({ activeIndex }: SectionProgressProps) {
  const progress = getProgressPercent(activeIndex + 1, sections.length);

  return (
    <nav aria-label="Survey sections">
      <ol className="progress-list">
        {sections.map((section, index) => {
          const current = index === activeIndex;
          const complete = index < activeIndex;

          return (
            <li key={section.id}>
              <span
                className={`progress-marker${current ? " is-current" : ""}${complete ? " is-complete" : ""}`}
                aria-hidden="true"
              >
                {complete ? "✓" : index + 1}
              </span>
              <span
                className="progress-label"
                aria-current={current ? "step" : undefined}
              >
                {section.label}
              </span>
            </li>
          );
        })}
      </ol>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Survey progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-caption">
        Step {activeIndex + 1} of {sections.length}
      </p>
    </nav>
  );
}
