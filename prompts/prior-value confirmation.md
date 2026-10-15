Prompt 5: Prior-value confirmation workflows

Implement confirmation and correction of information ACBJ already possesses.

Create a reusable confirm-existing-value component.

Example behavior:
“Last year you reported 114 employees.”
- That’s still correct
- Update this number

Requirements:
- Display current/prior value and prior period when configured.
- Selecting Confirm stores the value as confirmed.
- Selecting Update reveals the correct input type and stores a new current response while preserving the original prior value.
- Merely viewing the question does not confirm it.
- Returning to the question displays the latest choice.
- Review should distinguish a confirmed unchanged value from an updated value in developer/debug state, while remaining simple for respondents.

Apply this pattern to demonstration data for:
- address
- total employees
- revenue
- CEO/top executive
- year founded

Add tests for known → confirmed, known → updated, revisit behavior and preserved prior values.

Acceptance checklist:
- Prior values can be confirmed or corrected.
- Original prior data remains in state after an update.
- Viewing alone never confirms.
- Save/resume preserves the latest choice.
- Tests pass.
