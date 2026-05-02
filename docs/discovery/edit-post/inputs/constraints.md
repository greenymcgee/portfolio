# Edit Post — Known Constraints

> **For engineers**: Document constraints that shape architectural decisions. These are inputs to discovery — not outputs. Update as constraints change.
>
> **For LLMs**: Read these constraints before generating the initial plan or architecture. Flag any constraints that conflict with requirements.

---

## Timeline

- **Hard deadline**: No hard deadline.
- **Release target**: Main.
- **Milestones**:
  - Backend is added for updating the post
  - The `getPosts` backend is updated for filtering unpublished posts and allowing the "unpublished" parameter
  - The edit post page is added and works like the new post page currently does
  - The title and rich text editor styles are updated to match the design-reference.png file
  - The sticky action bar is added to the edit post page and the rich text controls are moved to it
  - The modal component is added
  - The description button is added to the action bar and the modal is used to display the description input
  - The "Close" button is added and includes the delete logic without a title
  - The modal is used to display the confirmation modal when the user closes the post without a title
  - The "Publish/Unpublish" button is added and includes the publish/unpublish logic

## Dependencies

- **Other teams**: The modal component does not exist yet. Shadcn's modal needs to be audited for accessibility vs the native dialog element.
- **Other features**: The new post page is no longer in production after this feature is complete.
- **Third-party services**: No third-party services are needed.

## Technical

- **Must use**: Patterns described in the clean-authoring and authoring-typescript skills.
- **Must integrate with**: The existing systems, APIs, and databases.
- **Cannot change**: The immovable parts of the stack.
- **Performance requirements**: The performance requirements are not considered for this feature.


## Scope

- **Team size**: 1 senior fullstack engineer.
- **Skill constraints**: No skill constraints.
