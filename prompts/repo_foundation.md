Prompt 1: Repository foundation and application shell Create the initial ACBJ Survey Navigator prototype repository and application shell.

Technical outcome:
- Build a modern browser application with a responsive component structure.
- If the repository does not already establish a stack, use a practical typed front-end stack appropriate for a prototype and document the choice in the README.
- Add scripts for local development, production build, linting and tests.
- Create a clear folder structure for components, survey configuration, state, modules, utilities and tests.

User experience:
- Create a welcome screen with product name, short explanation, Start survey and Resume survey actions.
- Create a respondent shell with:
  - top product header;
  - section-progress indicator;
  - persistent BizEstimate panel or card;
  - primary content area;
  - Previous and Continue controls;
  - visible “Progress saved” state.
- Make the design bright, clean, airy and nonthreatening.
- Use large readable type, generous spacing, strong focus states and mobile-responsive behavior.
- Do not create the full questionnaire yet.

Sections shown in progress navigation:
- Company
- Business details
- Your industry
- What’s ahead
- Review

BizEstimate initial state:
“Your BizEstimate — Complete a few questions to begin building your estimate.”

Accessibility:
- Use semantic landmarks and headings.
- Ensure keyboard navigation, visible focus and associated form labels.
- Meet WCAG-friendly contrast targets.
- Respect reduced-motion preferences.

Acceptance checklist:
- Application runs locally and builds successfully.
- Welcome, Start and Resume shells are visible.
- Layout works at mobile and desktop widths.
- Previous/Continue controls and progress component exist.
- BizEstimate initial state is visible.
- No industry taxonomy or valuation formula has been invented.
- README explains setup, scripts and prototype constraints.
