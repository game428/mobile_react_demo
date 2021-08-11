import React from "react";

let initState = {
  curUserId: null, // 当前登录用户ID
  chatList: [], // 会话列表
  msgList: [], // 消息列表
  curConversationID: null, // 当前会话ID
};

// 更新state
const updateObject = (oldObject, newValues) => {
  // 用空对象作为第一个参数传递给 Object.assign，以确保是复制数据，而不是去改变原来的数据
  return Object.assign({}, oldObject, newValues);
};

// 清理初始化
const clear = (state) => {
  return updateObject(state, {
    curUserId: null, // 当前登录用户ID
    chatList: [], // 会话列表
    msgList: [], // 消息列表
    curConversationID: null, // 当前会话id
  });
};

// 设置用户id
const setUserId = (state, userId) => {
  return updateObject(state, {
    curUserId: userId, // 当前登录用户ID
  });
};

/**会话 */
// 清理会话列表
const clearChats = (state) => {
  return updateObject(state, {
    chatList: [],
  });
};
// 新增会话列表
const addChats = (state, chats) => {
  return updateObject(state, {
    chatList: [...state.chatList, ...chats],
  });
};
// 新增会话
const addChat = (state, chat) => {
  return updateObject(state, {
    chatList: [chat, ...state.chatList],
  });
};
// 切换会话
const changeChat = (state, conversationID) => {
  return updateObject(state, {
    curConversationID: conversationID,
    msgList: [],
  });
};
// 更新会话列表
const updateChats = (state, chats) => {
  chats.forEach((newChat) => {
    if (newChat.deleted) {
      // 如果是删除会话
      state.chatList = state.chatList.filter((chat) => {
        if (newChat.conversationID === state.curConversationID) {
          state.curConversationID = null;
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
  let newObje = {
    chatList: JSON.parse(JSON.stringify(state.chatList)),
  };
  if (!state.curConversationID && state.chatList.length) {
    newObje.curConversationID = state.chatList[0].conversationID;
    newObje.msgList = [];
  }
  return updateObject(state, newObje);
};

/**消息 */
// 新增消息列表
const addMsgs = (state, msgs) => {
  return updateObject(state, {
    msgList: [...msgs, ...state.msgList],
  });
};
// 新增消息
const addMsg = (state, msg) => {
  return updateObject(state, {
    msgList: [...state.msgList, msg],
  });
};
// 更新消息列表
const updateMsgs = (state, msgs) => {
  console.log(141, state.curConversationID);
  if (!state.curConversationID) {
    return state;
  } else {
    msgs.forEach((newMsg) => {
      if (newMsg.conversationID === state.curConversationID) {
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
    return updateObject(state, {
      msgList: JSON.parse(JSON.stringify(state.msgList)),
    });
  }
};

// 撤回消息列表
const revokeMsgs = (state, msgs) => {
  if (!state.curConversationID) {
    return state;
  } else {
    msgs.forEach((newMsg) => {
      if (newMsg.conversationID === state.curConversationID) {
        let msg = state.msgList.find(
          (msgItem) => msgItem.msgId === newMsg.msgId
        );
        if (msg) {
          Object.assign(msg, newMsg);
        }
      }
    });
    return updateObject(state, {
      msgList: JSON.parse(JSON.stringify(state.msgList)),
    });
  }
};

// 数据处理器
const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case "clear":
      return clear(state);
    case "setUserId":
      return setUserId(state, payload);
    case "clearChats":
      return clearChats(state);
    case "addChats":
      return addChats(state, payload);
    case "addChat":
      return addChat(state, payload);
    case "changeChat":
      return changeChat(state, payload);
    case "updateChats":
      return updateChats(state, payload);
    case "addMsgs":
      return addMsgs(state, payload);
    case "addMsg":
      return addMsg(state, payload);
    case "updateMsgs":
      return updateMsgs(state, payload);
    case "revoke":
      return revokeMsgs(state, payload);
    default:
      return state;
  }
};

let context = React.createContext();

export { reducer, initState, context };
