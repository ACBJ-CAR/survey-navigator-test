import { sections, type SectionId } from "../config/survey";
import { getProgressPercent } from "../utils/progress";

type SectionProgressProps = {
  activeSection: SectionId;
  onSelect?: (section: SectionId) => void;
};

export function SectionProgress({ activeSection, onSelect }: SectionProgressProps) {
  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const progress = getProgressPercent(activeIndex + 1, sections.length);

  return (
    <nav aria-label="Survey sections">
      <ol className="progress-list">
        {sections.map((section, index) => {
          const current = index === activeIndex;
          const complete = index < activeIndex;

          return (
            <li key={section.id}>
              <button
                className="progress-item"
                aria-current={current ? "step" : undefined}
                onClick={() => onSelect?.(section.id)}
              >
                <span
                  className={`progress-marker${current ? " is-current" : ""}${complete ? " is-complete" : ""}`}
                  aria-hidden="true"
                >
                  {complete ? "✓" : index + 1}
                </span>
                <span className="progress-label">{section.label}</span>
              </button>
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
      <p className="progress-caption">{sections[activeIndex]?.label ?? "Survey progress"}</p>
    </nav>
  );
}
