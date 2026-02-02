# Changelog

All notable changes to the MKBS Realm project will be documented in this file.

## [1.0.0] - 2026-02-02

### Added

#### Authentication & User Management

- User registration with email validation
- User login with JWT authentication
- Password hashing with bcryptjs
- User profile management (view, edit)
- Avatar and cover photo support
- Bio and personal information

#### Posts & Social Features

- Create posts with text content
- Like/unlike posts
- Comment on posts with real-time updates
- News feed with pagination
- Sort posts by recency or popularity
- Delete own posts
- Real-time post updates

#### Friend System

- Send friend requests to users
- Accept/reject incoming friend requests
- Cancel sent friend requests
- Unfriend functionality
- View friends list with online status
- Friend request notifications

#### Real-Time Messaging

- One-on-one chat with Socket.io
- Real-time message delivery
- Typing indicators while composing
- Read receipts for messages
- Online/offline status indicators
- Message search functionality
- Conversation management
- Unread message counter
- Message history with pagination

#### Audio/Video Calls

- WebRTC-based one-on-one audio calls
- WebRTC-based one-on-one video calls
- Mute/unmute microphone during calls
- Camera on/off toggle for video calls
- Call duration tracking
- Incoming call notifications with ringtone
- Accept/reject call functionality
- Call history saved as messages
- Picture-in-picture local video view
- Full-screen remote video view

#### Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Custom XSS sanitization middleware
- Helmet.js for security headers
- Input validation with express-validator
- CORS configuration
- Protected routes with middleware

#### UI/UX Features

- Responsive design for mobile and desktop
- Modern UI with Tailwind CSS
- Loading skeletons
- Toast notifications
- Error boundary for graceful error handling
- Smooth animations and transitions
- Infinite scroll pagination
- Real-time updates without refresh

### Technical Stack

#### Frontend

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4
- Socket.io Client 4.8
- Simple Peer (WebRTC)

#### Backend

- Node.js
- Express 5.1
- MongoDB with Mongoose 9
- Socket.io 4.8
- JWT authentication
- Bcryptjs for password hashing

#### Security

- Helmet 8.1
- Express Rate Limit 8.2
- Express Validator 6.15
- Custom sanitization middleware

### Fixed

- ObjectId constructor error in postController
- Express 5 compatibility issues with deprecated packages
- Global variable issue with simple-peer in Vite
- Socket.io CORS configuration
- WebRTC connection issues

### Security

- Removed express-mongo-sanitize (not compatible with Express 5)
- Removed xss-clean (deprecated)
- Implemented custom sanitization middleware
- Added rate limiting to prevent abuse
- Secured Socket.io connections with JWT authentication

## [Future Enhancements]

### Planned Features

- Group chats
- Group video/audio calls
- File and image sharing in messages
- Story/status feature
- Photo/video posts
- Emoji reactions
- Message editing and deletion
- Push notifications
- Email notifications
- Two-factor authentication
- Password reset functionality
- User blocking
- Report functionality
- Admin dashboard
- Analytics
- Dark mode
- Multiple language support

### Known Issues

- None at this time

---

For more information, see the [README.md](README.md) file.
