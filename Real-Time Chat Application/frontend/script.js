let socket;
let token = localStorage.getItem("token") || "";
let username = "";
let email = "";
let room = "";
let currentChatUserId = null;
let currentChatGroupId = null;
let isGroupChat = false;
let onlineUserIds = [];
let isRoomChat = false;
let chatroom = "";
let gname = "";

function toggleSidebar() {
  const menu = document.getElementById("sidebarMenu");
  menu.classList.toggle("hidden");
}

function toggleProfileBox() {
  const box = document.getElementById("profileBox");
  box.classList.toggle("hidden");
}

function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}

function setChatHeader(name, status) {
  document.getElementById("chatHeaderName").innerText = name;
  document.getElementById("chatStatus").innerText = status;
}

function toggleCreateGroup() {
  document.getElementById("createGroupForm").classList.toggle("hidden");
}

function createGroup() {
  const name = document.getElementById("groupName").value.trim(); // trim to remove spaces
  const token = localStorage.getItem("token");

  if (!name) {
    alert("Please enter a group name.");
    return;
  }

  fetch("http://localhost:5000/api/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ name })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("groupName").value = "";
      toggleCreateGroup();
      loadGroups();

      alert(`Group created! Share this Join ID with others: ${data.joinId}`);
    })
    .catch(err => {
      console.error("Error creating group:", err);
      alert("Something went wrong while creating the group.");
    });
}


async function joinGroup() {
  const joinId = document.getElementById("joinGroupId").value.trim();
  const token = localStorage.getItem("token");

  if (!joinId) {
    alert("Please enter a group join ID.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/groups/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ joinId })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Joined group successfully!");
      document.getElementById("joinGroupId").value = "";
      loadGroups(); // reload updated group list
    } else if (res.status === 400 && data.msg === "You’ve already joined this group") {
      alert("⚠️ You’ve already joined this group!");
      document.getElementById("joinGroupId").value = "";
    } else {
      alert(data.msg || "❌ Invalid Join Id.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
}




function notifyTyping() {
  socket.emit("typing", { room, username });
}

function sendMessage() {
  const input = document.getElementById("msg");
  const message = input.value;
  const time = new Date().toLocaleTimeString();
  if (!message.trim()) return;

  socket.emit("send_message", { room, author: username, message, time });
  displayMessage({ author: "You", message, time }, true);
  input.value = "";
}

function displayMessage(data, isOwn = false) {
  const msgBox = document.getElementById("messages");

  const wrapper = document.createElement("div");
  wrapper.className = `flex mb-2 ${isOwn ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");
  bubble.className = `rounded-xl px-4 py-2 max-w-[70%] shadow 
    ${isOwn ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"}`;

  const author = document.createElement("div");
  author.className = "text-xs font-semibold mb-1";
  author.innerText = data.author;

  const message = document.createElement("div");
  message.className = "text-sm";
  message.innerText = data.message;

  const timestamp = document.createElement("div");
  timestamp.className = "text-[10px] mt-1 text-right opacity-80";
  timestamp.innerText = data.time;
  if(currentChatGroupId){bubble.appendChild(author);}
  if(isRoomChat){bubble.appendChild(author);}
  
  bubble.appendChild(message);
  bubble.appendChild(timestamp);

  wrapper.appendChild(bubble);
  msgBox.appendChild(wrapper);
  msgBox.scrollTop = msgBox.scrollHeight;
}


function createPrivateRoomId(id1, id2) {
  return [id1, id2].sort().join('_'); 
}

function openChatWithUser(user) {
  isGroupChat = false;
  isRoomChat = false;
  currentChatUserId = user._id;
  currentChatGroupId = null;
  room = user._id;
  console.log(id);
  console.log(user._id);
  room = createPrivateRoomId(id, user._id);
  console.log(room);
  socket.emit("join_room", room);
  setChatHeader(user.name, "Connecting...");

  socket.emit("get_user_status", user._id, ({ status }) => {
    setChatHeader(user.name, status);
  });
}

function openGroupChat(group) {
  isGroupChat = true;
  isRoomChat = false;
  currentChatGroupId = group._id;
  currentChatUserId = null;
  room = `group_${group.name}`;

  socket.emit("join_room", room);
  gname = group.name;
  setChatHeader(group.name, "Group chat");
}

function openRoomChat() {
  isRoomChat = true;
  isGroupChat = false;
  currentChatUserId = null;
  currentChatGroupId = null;
  room = document.getElementById("joinRoom").value.trim();
  chatroom = room;
  if (!room) return alert("Please enter a room ID.");

  socket.emit("join_room", room);
  
  setChatHeader(room, "Room chat");
}

function loadContacts() {
  fetch("http://localhost:5000/api/contacts", {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(contacts => {
      document.getElementById("contactList").innerHTML = contacts.map(c => `
        <li onclick='openChatWithUser(${JSON.stringify(c)})'
            class="flex justify-between items-center p-2 bg-white rounded shadow-sm cursor-pointer hover:bg-blue-50">
          <span>${c.name}</span>
          <span>${onlineUserIds.includes(c._id) ? "🟢" : "⚪️"}</span>
        </li>`).join('');
    });
}

function loadGroups() {
  fetch("http://localhost:5000/api/groups", {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(groups => {
      document.getElementById("groupList").innerHTML = groups.map(g => `
        <li class="p-2 bg-white rounded shadow-sm hover:bg-green-50 flex justify-between items-center">
          <span onclick='openGroupChat(${JSON.stringify(g)})' class="cursor-pointer flex-grow">
            ${g.name}
          </span>
          <div class="flex gap-2">
            <button onclick="copyJoinId('${g.joinId}')" title="Copy Join ID" class="text-blue-500 hover:text-blue-700">
              📋
            </button>
            <button onclick="leaveGroup('${g._id}')" title="Leave Group" class="text-red-500 hover:text-red-700">
              ❌
            </button>
          </div>
        </li>
      `).join('');
    });
}


function leaveGroup(groupId) {
  if (!confirm("Do you want to leave this group?")) return;

  fetch(`http://localhost:5000/api/groups/leave/${groupId}`, {
    method: "PATCH",
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.msg);
      loadGroups(); 
    });
}



function copyJoinId(joinId) {
  if (!joinId) return alert("Join ID not available.");
  navigator.clipboard.writeText(joinId).then(() => {
    alert(`Join ID copied: ${joinId}`);
  });
}


function startSocket() {
  socket = io("http://localhost:5000", { auth: { token } });
  socket.emit("register_online", token);

  socket.on("load_messages", (messages) => {
    document.getElementById("messages").innerHTML = "";
    messages.forEach(m => displayMessage(m, m.author === username));
  });

  socket.on("receive_message", (data) => {
  const messageRoom = data.room;

  if (messageRoom !== room) return;

  displayMessage(data, false);
});


  socket.on("user_typing", ({ username: typingUser }) => {
    if (typingUser !== username) {
       if (currentChatUserId) {
      document.getElementById("chatStatus").innerText = "Typing...";}
      if (currentChatGroupId){document.getElementById("chatStatus").innerText = typingUser+" typing...";}
      if (isRoomChat){document.getElementById("chatStatus").innerText = typingUser+" typing...";}
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        if (currentChatUserId) {
          socket.emit('get_user_status', currentChatUserId, ({ status }) => {
            setChatHeader(typingUser, status);
          });
        } else if (currentChatGroupId) {
          setChatHeader(gname, 'Group chat');
        } else if (isRoomChat) {
          setChatHeader(chatroom, 'Room chat');
        }
      }, 1500);
    }
  });

  socket.on("update_online_users", (ids) => {
    onlineUserIds = ids;
    loadContacts();
  });
}

window.onload = () => {
  if (!token) return window.location.href = "login.html";

  fetch("http://localhost:5000/api/auth/me", {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      username = data.name;
      email = data.email;
      id = data.id;
    
      document.getElementById("profileName").innerText = username;
      document.getElementById("profileEmail").innerText = email;

      startSocket();
      loadContacts();
      loadGroups();
    })
    .catch(() => logout());
};

function toggleAddContact() {
  const form = document.getElementById("addContactForm");
  form.classList.toggle("hidden");
}

function toggleJoinGroup() {
  const form = document.getElementById("JoinGroupForm");
  form.classList.toggle("hidden");
}

async function addContact() {
  const email = document.getElementById("contactEmail").value;
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/contacts/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Contact added!");
    loadContacts(); // refresh the contact list
    const token = localStorage.getItem("token");
    socket.emit("register_online", token);
    document.getElementById("contactEmail").value = "";
    toggleAddContact(); // close form
  } else {
    alert(data.msg || "Error adding contact");
  }
}
