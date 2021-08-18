import React from "react";

let initState = {
  curUserId: null, // 当前登录用户ID
  chatList: [], // 会话列表
  msgList: [], // 消息列表
  curConversationID: null, // 当前会话ID
  cos: {}, // 当前cos
  cosConfig: {}, // cos相关配置
};

// 更新state
const updateObject = (oldObject, newValues) => {
  // 用空对象作为第一个参数传递给 Object.assign，以确保是复制数据，而不是去改变原来的数据
  return Object.assign({}, oldObject, newValues);
};

// 更新消息数组
const updateMsgArray = (msgList, msgs) => {
  return msgList.map((msg) => {
    let index = msgs.findIndex((newMsg) => newMsg.onlyId === msg.onlyId);
    if (index === -1) {
      return msg;
    }
    let newMsg = msgs.splice(index, 1);
    return updateObject(msg, newMsg);
  });
};

// 清理初始化
const clear = (state) => {
  return updateObject({}, initState);
};

// 设置用户id
const setUserId = (state, userId) => {
  return updateObject(state, {
    curUserId: userId,
  });
};
const setCos = (state, cos) => {
  return updateObject(state, {
    cos: cos,
  });
};
const setCosConfig = (state, data) => {
  return updateObject(state, {
    cosConfig: data,
  });
};

/**会话 */
// 新增会话列表
const addChats = (state, chats) => {
  return updateObject(state, {
    chatList: state.chatList.concat(chats),
  });
};
// 新增会话
const addChat = (state, chat) => {
  return updateObject(state, {
    chatList: [].concat(chat, state.chatList),
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
  let newChats = [];
  let deleteChatsObj = {};
  let updateChatsObj = {};
  chats.forEach((chat) => {
    if (chat.deleted) {
      deleteChatsObj[chat.conversationID] = chat;
    } else {
      updateChatsObj[chat.conversationID] = chat;
    }
  });
  state.chatList.forEach((chat) => {
    if (
      Object.prototype.hasOwnProperty.call(deleteChatsObj, chat.conversationID)
    ) {
      delete deleteChatsObj[chat.conversationID];
    } else if (
      Object.prototype.hasOwnProperty.call(updateChatsObj, chat.conversationID)
    ) {
      newChats.push(updateObject(chat, updateChatsObj[chat.conversationID]));
      delete updateChatsObj[chat.conversationID];
    } else {
      newChats.push(chat);
    }
  });
  newChats.push(...Object.values(updateChatsObj));

  // state.chatList.forEach((chat) => {
  //   let index = chats.findIndex(
  //     (newChat) => newChat.conversationID === chat.conversationID
  //   );
  //   if (index === -1) {
  //     newChats.push(chat);
  //   } else {
  //     let newChat = chats.splice(index, 1);
  //     if (newChat.deleted !== true) {
  //       newChats.push(updateObject(chat, newChat));
  //     }
  //   }
  // });
  // let addChats = chats.filter((newChat) => !newChat.deleted);
  // newChats.push(...addChats);
  newChats.sort((pre, next) => {
    return next.showMsgTime - pre.showMsgTime;
  });
  let newState = {
    chatList: newChats,
  };
  return updateObject(state, newState);
};

/**消息 */
// 新增消息列表
const addMsgs = (state, msgs) => {
  return updateObject(state, {
    msgList: msgs.concat(state.msgList),
  });
};
// 新增消息
const addMsg = (state, msg) => {
  return updateObject(state, {
    msgList: state.msgList.concat(msg),
  });
};
// 更新消息列表
const updateMsgs = (state, msgs) => {
  if (msgs[0].conversationID === state.curConversationID) {
    let newMsgs = updateMsgArray(state.msgList, msgs);
    return updateObject(state, {
      msgList: newMsgs.concat(msgs),
    });
  } else {
    return state;
  }
};
// 更新消息
const updateMsg = (state, msg) => {
  if (msg.conversationID === state.curConversationID) {
    let newMsgs = state.msgList.map((msgItem) => {
      if (msgItem.onlyId === msg.onlyId) {
        return updateObject(msgItem, msg);
      } else {
        return msgItem;
      }
    });
    return updateObject(state, {
      msgList: newMsgs,
    });
  } else {
    return state;
  }
};

// 撤回消息列表
const revokeMsgs = (state, msgs) => {
  if (msgs[0].conversationID === state.curConversationID) {
    let newMsgs = updateMsgArray(state.msgList, msgs);
    return updateObject(state, {
      msgList: newMsgs,
    });
  } else {
    return state;
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
    case "setCos":
      return setCos(state, payload);
    case "setCosConfig":
      return setCosConfig(state, payload);
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
    case "updateMsg":
      return updateMsg(state, payload);
    case "revokeMsgs":
      return revokeMsgs(state, payload);
    default:
      return state;
  }
};

let context = React.createContext();

export { reducer, initState, context };
