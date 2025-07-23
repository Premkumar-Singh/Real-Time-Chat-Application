# 💬 Real-Time Chat Application

A full-featured browser-based chat application that enables real-time messaging using **Socket.IO**, **JWT Authentication**, and **MongoDB**. The app includes private chat, group chat, and room-based messaging features with secure login, user profiles, typing indicators, message history, and online status tracking.

---

## 🚀 Features

### 🔐 User Authentication & Profile
- Registration with validation:
  - Name: Starts with a letter, no digits
  - Email: Valid format, cannot start with a number
  - Password: Minimum 8 characters, 1 uppercase, 1 special character
  - Confirm Password must match
- Login using Email & Password
- JWT-based secure route protection
- Profile page shows current user's name, email, and logout button

### 👥 Contact System
- Add contacts via email
- Show contact list with status:
  - 🟢 Online
  - ⚪️ Offline
- Open private chats
- Manual contact list refresh

### 🔒 Private Chat
- Secure one-to-one chats in private rooms
- Typing indicators
- Online and Last Seen status
- Timestamps for messages
- Message history stored in MongoDB
- UI alignment: your messages → right, others → left

### 👨‍👩‍👧 Group Chat
- Create or join groups using a Join ID
- Chat with all group members in real-time
- Display sender’s name and timestamp
- Typing indicators in group chats
- Buttons:
  - Copy Group ID
  - Leave Group
  - Refresh Group List
- Group message history stored

### 📢 Room-Based Chat
- Join chat using Room ID
- Open group-like chat without group creation
- Lightweight, real-time discussion
- Store message history

### 📩 Messaging System
- Real-time Socket.IO events:
  - `message`, `typing`, `join_room`, `join_group`, `get_user_status`, etc.
- All messages stored for history
- Dynamic auto-scrolling UI

### 🎨 Frontend UI & Validation
- Responsive UI built with **Tailwind CSS**
- Real-time error messages and field validation
- Secure password input (hidden characters)
- Alerts for success and failure actions

---

## 🛠️ Tech Stack

### Frontend:
- HTML, CSS, JavaScript
- Tailwind CSS

### Backend:
- Node.js
- Express.js

### Database:
- MongoDB

### Real-Time:
- Socket.IO

### Authentication:
- JWT (JSON Web Tokens)
- bcrypt.js (Password Hashing)

### Tools:
- Postman (API Testing)
- VS Code (Development)

---

## 📷 Screenshots

> - Private Chat UI
> - <img width="1920" height="1080" alt="message and chat view" src="https://github.com/user-attachments/assets/8b7c2f58-eafb-41e5-bee1-7dd19ea85508" />

> - Group Chat UI
> - <img width="1920" height="1080" alt="group chat screen" src="https://github.com/user-attachments/assets/ce371b2c-e7ef-49ff-a6d9-cbdc7df95ab9" />

>   for more click here https://github.com/Premkumar-Singh/Real-Time-Chat-Application/tree/main/ScreenShots


---

## 🔒 Security & Validation

- Passwords are hashed with **bcrypt**
- JWT token stored securely in the frontend
- Inputs validated to prevent invalid registration or login
- Secure Socket.IO communication

---

## 📌 Future Enhancements

- Push notifications
- File and image sharing
- PWA/Mobile App version
- Admin controls and moderation
- Dark mode support

---

## 📄 License

This project is for educational use and currently does not include a license.

---

## 🙌 Acknowledgments

Thanks to the open-source community for tools and libraries like:
- [Socket.IO](https://socket.io/)
- [JWT](https://jwt.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)

---

## 👤 Author

**Premkumar Singh**

> Feel free to connect for collaboration or queries!
