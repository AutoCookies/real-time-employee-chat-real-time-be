# real-time-chat-service

A standalone real-time chat service running on a separate port, dedicated to handling chat functionality and real-time messaging.

## Project Overview

This is a separate service dedicated to real-time chat functionality. It runs on its own port and focuses solely on chat creation and real-time message delivery. Due to time constraints, this service implements basic chat features without role-based separation.

## Project Structure

```
├── middlewares/          # Custom middleware functions
│   └── chat/            # Chat-specific middleware
├── services/            # Business logic and data operations
│   └── chat/            # Chat-specific services
├── controllers/         # Request handlers
│   └── chat/            # Chat-specific controllers
├── routes/              # API route definitions
│   └── chat/            # Chat-specific routes
├── helpers/             # Utility functions and helpers
│   └── chat/            # Chat-specific helpers
├── libs/                # Third-party library configurations
│   └── chat/            # Chat-specific lib configurations
├── sockets/             # Socket.io handlers and events
    ├── events/          # Socket event handlers
    ├── middleware/      # Socket middleware
    └── index.js         # Socket configuration
```

## Key Features

- **Real-time Messaging**: Instant message delivery using WebSockets
- **Chat Room Management**: Create a chat rooms with employees
- **Standalone Service**: Runs independently on separate port
- **Socket.IO Integration**: WebSocket implementation for real-time communication

## Installation & Running

```bash
# .env
Copy the .env file in .zip with folder named "Backend Chat"

# Install dependencies
npm install

# Run in development mode
npm run dev
```

**Note**: This is a basic implementation due to tight deadlines. Current features include only essential chat functionality.

## Current Limitations

Due to time constraints, the following features are not yet implemented:
- Chat room permissions
- Message history
- File attachments
- Typing indicators
- Online status
- Not seen messages

## Future Enhancements
- Message encryption
- File upload support
- Typing indicators
- Message read receipts
- Chat room management
- User blocking/muting features
- Not seen messages