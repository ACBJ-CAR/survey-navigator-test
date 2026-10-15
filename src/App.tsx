import { useState } from "react";
import { BizEstimateCard } from "./components/BizEstimateCard";
import { SectionProgress } from "./components/SectionProgress";
import { SurveyShell } from "./components/SurveyShell";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { sections } from "./config/sections";

export default function App() {
  const [surveyStarted, setSurveyStarted] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const activeSection = sections[activeSectionIndex];

  function startSurvey() {
    setActiveSectionIndex(0);
    setSurveyStarted(true);
  }

  if (!surveyStarted) {
    return <WelcomeScreen onStart={startSurvey} onResume={startSurvey} />;
  }

  return (
    <SurveyShell
      activeSection={activeSection}
      activeSectionIndex={activeSectionIndex}
      onNavigate={setActiveSectionIndex}
      progress={<SectionProgress activeIndex={activeSectionIndex} />}
      estimate={<BizEstimateCard />}
    />
  );
}
