Prompt 3: Autosave, resume and response-state model

Add persistent prototype response state, autosave and resume behavior.

Implement response states that distinguish:
- known
- confirmed
- updated
- new
- missing
- declined/not provided

Prototype storage:
- Use local prototype storage appropriate to the existing stack.
- Abstract storage behind an interface so production storage can replace it later.
- Do not claim this is production authentication or production persistence.

Behavior:
- Autosave after answer changes with sensible debouncing.
- Show “Saving…” and then “Progress saved.”
- Store current section and question position.
- Resume from the saved point after browser refresh or a new session.
- Add a deliberate Reset prototype data control in a developer/test area.
- Preserve latest answers when moving backward.
- Viewing a previous value must not mark it confirmed.

Add tests for:
- autosave;
- resume position;
- answer persistence;
- state changes from known to confirmed or updated;
- reset behavior.

Acceptance checklist:
- Respondent can leave, refresh and resume.
- Previously entered responses remain intact.
- Saved-state messaging reflects actual state.
- Viewing a question alone does not confirm prior information.
- Storage is isolated behind a replaceable adapter.
- Tests pass.
