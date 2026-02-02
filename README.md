# MKBS Realm - Social Media Platform

A full-featured social media application with real-time messaging, audio/video calls, and friend management. Built with React, Node.js, MongoDB, and Socket.io.

## 🚀 Features

### Authentication & User Management

- ✅ User registration and login with JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ User profiles with avatars, cover photos, and bio
- ✅ Profile viewing and editing

### Posts & Social Features

- ✅ Create, read, update, and delete posts
- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ News feed with sorting (recency/popularity)
- ✅ Pagination for infinite scroll

### Friend System

- ✅ Send friend requests
- ✅ Accept/reject friend requests
- ✅ Cancel sent requests
- ✅ Unfriend users
- ✅ View friends list

### Real-Time Messaging

- ✅ One-on-one chat with Socket.io
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Message search
- ✅ Conversation management

### Audio/Video Calls

- ✅ One-on-one audio calls via WebRTC
- ✅ One-on-one video calls via WebRTC
- ✅ Mute/unmute functionality
- ✅ Camera on/off toggle
- ✅ Call duration tracking
- ✅ Incoming call notifications
- ✅ Call history

## 🛠 Tech Stack

### Frontend

- **React 19** - UI library
- **React Router 7** - Navigation
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Socket.io Client** - Real-time communication
- **Simple Peer** - WebRTC for video/audio calls

### Backend

- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose 9** - ODM
- **Socket.io** - Real-time engine
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

### Security

- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation
- **Custom Sanitization** - XSS protection

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mkbs-realm
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional)
# Add VITE_API_URL if different from http://localhost:5000/api
```

## ⚙️ Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

### Frontend (.env - optional)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Production Build

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 👥 Test Users

For testing, you can use these pre-created accounts:

| Name           | Email             | Password    |
| -------------- | ----------------- | ----------- |
| Bob Johnson    | bob@example.com   | password123 |
| Carol Williams | carol@example.com | password123 |
| David Brown    | david@example.com | password123 |
| Emma Davis     | emma@example.com  | password123 |

Or register new accounts via the signup page.

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `GET /api/auth/profile/:id` - Get user profile

### Posts

- `GET /api/posts` - Get news feed
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id` - Delete post

### Friends

- `POST /api/friends/request/:id` - Send friend request
- `POST /api/friends/accept/:id` - Accept request
- `POST /api/friends/reject/:id` - Reject request
- `POST /api/friends/cancel/:id` - Cancel request
- `POST /api/friends/unfriend/:id` - Unfriend user
- `GET /api/friends/list` - Get friends list

### Messages

- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get/create conversation
- `GET /api/messages/:conversationId/messages` - Get messages
- `POST /api/messages/:conversationId/messages` - Send message
- `PUT /api/messages/:conversationId/read` - Mark as read
- `DELETE /api/messages/messages/:id` - Delete message
- `GET /api/messages/users/search` - Search users

## 🔌 Socket.io Events

### Connection

- `connect` - User connected
- `disconnect` - User disconnected
- `online-users` - List of online users
- `user-status-change` - User online/offline status

### Messaging

- `join-conversation` - Join conversation room
- `leave-conversation` - Leave conversation room
- `send-message` - Send message
- `new-message` - Receive message
- `typing` - User typing status
- `user-typing` - Typing indicator
- `mark-read` - Mark messages as read
- `messages-read` - Messages read notification

### Calls (WebRTC Signaling)

- `call-user` - Initiate call
- `incoming-call` - Receive call
- `accept-call` - Accept call
- `call-accepted` - Call accepted
- `reject-call` - Reject call
- `call-rejected` - Call rejected
- `end-call` - End call
- `call-ended` - Call ended
- `ice-candidate` - WebRTC ICE candidate

## 📁 Project Structure

```
mkbs-realm/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── socket.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── friendController.js
│   │   └── messageController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── security.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── friendRoutes.js
│   │   └── messageRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── feed/
│   │   │   ├── messenger/
│   │   │   └── ui/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── CallContext.jsx
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Messenger.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🐛 Known Issues & Solutions

### "global is not defined" error

Fixed by adding polyfill in `vite.config.js`:

```js
define: {
  global: "globalThis";
}
```

### Port already in use

Kill existing processes:

```bash
# Backend
pkill -f "node server.js"

# Frontend
pkill -f vite
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [Redux](https://redux.js.org/)
- [JWT](https://jwt.io/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Heroku](https://www.heroku.com/)
- [Netlify](https://www.netlify.com/)

## Contact

For any questions or suggestions, please open an issue or contact me at [facebook.com/4mkbs](https://facebook.com/4mkbs)
