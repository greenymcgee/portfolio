# Copilot Requirements Review

## Comment 1: lines 241 - 250

Creating the row immediately on "New Post" conflicts with the unique-title
requirement below. Because drafts can exist without a title until the user
closes the page, every untitled draft will share the same blank title and a
second draft or early autosave will hit the uniqueness error before the user has
typed anything. The requirements need to specify how untitled drafts avoid that
collision.

## Comment 2: lines 137 - 138

This flow says clicking "Publish" takes the admin back to the posts page, but
the action-bar definition above makes "Close" the navigation action and
describes Publish/Unpublish as an in-place toggle. The document needs one
consistent post-publish behavior before engineering discovery starts.

## Comment 3: lines 231 - 234

The data-lifecycle section now omits one of the feature's new deletion paths.
Later requirements say clicking "Close" on an untitled draft deletes the post,
so documenting deletion as only happening through the existing Delete button
will leave discovery with an incomplete lifecycle.

## Comment 4: lines 173 - 176

This is the second "Flow 8" heading in the file. The duplicate numbering makes
later references ambiguous when discovery or implementation work needs to point
back to a specific flow.

## Comment 5: lines 57 - 60

Correct the spelling of "publisheable" to "publishable".

## Comment 6: lines 242 - 246

Correct the spelling of "publisheable" to "publishable".

## Comment 7: lines 89 - 90

This create flow also sends the user back to the posts page on "Publish", which
conflicts with the action-bar definition that makes "Close" the navigation
action. The requirements need to be explicit about whether publishing redirects
or keeps the admin on the editor.

## Comment 8: lines 110 - 113

This close flow has the same destination mismatch as Flow 2: elsewhere in the
document "Close" returns to the posts page, but here it returns to the updated
post page. Discovery will need one canonical behavior for the close action.

## Comment 9: lines 259 - 262

Correct the spelling of "actuall" to "actually".

## Comment 10: lines 19 - 22

Correct the spelling of "similiar" to "similar".

## Comment 11: lines 123 - 126

This flow also routes "Close" back to the updated post page, which contradicts
the success criteria and scope section that define "Close" as returning to the
posts page. Leaving both versions in the requirements makes the intended UX
ambiguous.

## Comment 12: lines 203 - 206

These two bullets contradict each other: if design-reference.png is the artifact
engineers should match, then the status is not really "No design." Leaving this
as-is makes it unclear whether visual parity with the reference image is a
requirement or not.

## Comment 13: lines 99 - 100

This close flow contradicts the success criteria and scope section, which both
say the "Close" button returns the user to the posts page. Leaving a different
destination here will give discovery two incompatible UX requirements for the
same action.
