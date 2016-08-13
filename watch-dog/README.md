## Privacy Policy

This application stores a name associated with a user from the list of names available in AMAZON.US_FIRST_NAMES. In order to make the app better serve the user, this information is combined with a unique identifier (`userId`) from the user's session, so that two users with the same first name won't collide in the table and cause the older data to be erased.

This information is stored in a dynamoDB table used only for this application, and the entries are removed when the user indicates they have returned. Entries are stored for the sole purpose of being queriable  while they are gone and upon return.

# v0.0.4

* Fixes based on Amazon Skill Feedback.
* Added unique Welcome Intent for when skill is started without specifying a command. Ties into Help Intent.
* Added delete from db when return query completes.
* Changed db storage to be `userId~name` instead of just name to prevent collisions.

# v0.0.3

* Fixes based on Amazon Skill Feedback.
* Changed default (Help) Intent to not end session. Added Sample Utterance for just a username that performs a query.

# v0.0.2

* Fixes based on Amazon Skill Feedback.
* Added Help/Cancel Intents, and cleaned up the Sample Utterances and card text.

# v0.0.1

* Basic functionality
