# Requirements

The register page does not work in it's current state. It calls the signIn
function from next-auth/react, but no user exists to sign in with. This is how
the template chosen from Next.js templates was set up, and I'm not sure how I
added any users initially.

## The Plan

1. Create a new UserRepository based on the PostRepository, but for the User model, with only a create method.
2. Create a new UserService to handle the business logic for the User model.
3. Create a new createUser action to handle the form submission from the register page.
4. Delete the users/new page since it's a confusing duplicate of the register page.
5. Hook up the register page and add test coverage.
