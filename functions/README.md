Before deploying to firebase: add `sec/config.ts` file with this content:
```typescript
// rootEmail: a user with this email will automatically (on creation) receive an Admin role.
// IMPORTANT! If not provided, then you won't be able to set user roles.
export const rootEmail = '...'

// withUserSearchIndices if true, then for each user name a 'pyramid' of search strings will be generated. This is in order to allow a pseudo-"full-text" search for user profiles.
export const withUserSearchIndices = true

// withTagSearchIndices if true, then for each tag title a 'pyramid' of search strings will be generated. This is in order to allow a pseudo-"full-text" search for tags.
export const withTagSearchIndices = true
``` 
