import React from "react";

let initState = {
  curUserId: null, // 当前登录用户ID
  chatList: [], // 会话列表
  msgList: [], // 消息列表
  curChat: null, // 当前会话
};

// 清理初始化
function clear(state) {
  state.curUserId = null;
  state.chatList = [];
  state.msgList = [];
  state.curChat = null;
}

// 设置用户id
function setUserId(state, userId) {
  state.curUserId = userId;
}

/**会话 */
// 清理会话列表
function clearChats(state) {
  state.chatList = [];
}
// 新增会话列表
function addChats(state, chats) {
  state.chatList.push(...chats);
}
// 新增会话
function addChat(state, chat) {
  state.chatList.unshift(chat);
}
// 切换会话
function changeChat(state, chat) {
  state.curChat = chat;
  state.msgList = [];
}
// 更新会话列表
function updateChats(state, chats) {
  chats.forEach((newChat) => {
    if (newChat.deleted) {
      // 如果是删除会话
      state.chatList = state.chatList.filter((chat) => {
        if (newChat.conversationID === state.curChat.conversationID) {
          state.curChat = null;
        }
        return chat.conversationID !== newChat.conversationID;
      });
    } else {
      // 更新其他会话
      let oldChat = state.chatList.find(
        (chat) => chat.conversationID === newChat.conversationID
      );
      if (oldChat) {
        Object.assign(oldChat, newChat);
      } else {
        state.chatList.unshift(newChat);
      }
    }
  });
  state.chatList.sort((pre, next) => {
    return next.showMsgTime - pre.showMsgTime;
  });
  if (!state.curChat && state.chatList.length) {
    state.curChat = state.chatList[0];
    state.msgList = [];
  }
}

/**消息 */
// 新增消息列表
function addMsgs(state, msgs) {
  console.log(141, state, msgs);
  state.msgList.unshift(...msgs);
}
// 新增消息
function addMsg(state, msg) {
  state.msgList.push(msg);
}
// 更新消息列表
function updateMsgs(state, msgs) {
  if (!state.curChat) return;
  msgs.forEach((newMsg) => {
    if (newMsg.conversationID === state.curChat.conversationID) {
      let msg = state.msgList.find(
        (msgItem) => msgItem.onlyId === newMsg.onlyId
      );
      if (msg) {
        Object.assign(msg, newMsg);
      } else {
        state.msgList.push(newMsg);
      }
    }
  });
}

// 撤回消息列表
function revokeMsgs(state, msgs) {
  if (!state.curChat) return;
  msgs.forEach((newMsg) => {
    if (newMsg.conversationID === state.curChat.conversationID) {
      let msg = state.msgList.find((msgItem) => msgItem.msgId === newMsg.msgId);
      if (msg) {
        Object.assign(msg, newMsg);
        console.log(41, msg);
      }
    }
  });
}

// 数据处理器
const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case "clear":
      clear(state);
      break;
    case "setUserId":
      setUserId(state, payload);
      break;
    case "clearChats":
      clearChats(state);
      break;
    case "addChats":
      addChats(state, payload);
      break;
    case "addChat":
      addChat(state, payload);
      break;
    case "changeChat":
      changeChat(state, payload);
      break;
    case "updateChats":
      updateChats(state, payload);
      break;
    case "addMsgs":
      addMsgs(state, payload);
      break;
    case "addMsg":
      addMsg(state, payload);
      break;
    case "updateMsgs":
      updateMsgs(state, payload);
      break;
    case "revoke":
      revokeMsgs(state, payload);
      break;
    default:
      break;
  }
  return state;
};

let context = React.createContext();

export { reducer, initState, context };
