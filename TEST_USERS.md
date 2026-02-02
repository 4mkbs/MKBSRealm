# Test Users

These test users have been created in the database for testing purposes.

## Login Credentials

| Name           | Email                  | Password    | User ID                  |
| -------------- | ---------------------- | ----------- | ------------------------ |
| Test User      | newuser123456@test.com | password123 | 69804fdbcb34f19a36d2f740 |
| John Doe       | johndoe@test.com       | password123 | 698050c075a4308a4bc1e543 |
| Bob Johnson    | bob@example.com        | password123 | 698059a06c3d0a5e7fbbc8f6 |
| Carol Williams | carol@example.com      | password123 | 698059a96c3d0a5e7fbbc8f9 |
| David Brown    | david@example.com      | password123 | 698059b26c3d0a5e7fbbc8fc |
| Emma Davis     | emma@example.com       | password123 | 698059ba6c3d0a5e7fbbc8ff |

## Usage

You can use these accounts to:

- Test messaging between users
- Send friend requests
- Make audio/video calls
- Create posts and interact with them

## Testing Scenarios

### Messaging Test

1. Login as "Test User" (newuser123456@test.com)
2. Open Messenger
3. Search for "Bob Johnson"
4. Start a conversation and send messages
5. Open another browser/incognito window
6. Login as "Bob Johnson" (bob@example.com)
7. Check real-time message delivery

### Video Call Test

1. Login as "Carol Williams" in one browser
2. Login as "David Brown" in another browser
3. Go to Messenger and start conversation
4. Click video call icon
5. Accept the call from the other browser
6. Test mute/unmute and camera toggle

### Friend System Test

1. Login as any user
2. Search for another user
3. Send friend request
4. Login as the other user
5. Accept/reject the request

## Notes

- All test users have the same password: `password123`
- Users are already created in the database
- You can create additional users through the registration page
- Default avatars are generated from pravatar.cc

## Cleanup

To remove test users from the database:

```javascript
// Connect to MongoDB and run:
db.users.deleteMany({
  email: {
    $in: [
      "newuser123456@test.com",
      "johndoe@test.com",
      "bob@example.com",
      "carol@example.com",
      "david@example.com",
      "emma@example.com",
    ],
  },
});
```
