import { useContext, useState, useEffect, useCallback } from "react";
import { context } from "@/reducer";
import { useHistory } from "react-router-dom";
import {
  Toast,
  NavBar,
  PullToRefresh,
  ListView,
  Icon,
  SwipeAction,
  Button,
} from "antd-mobile";
import "./chat.css";
import ChatItem from "@/components/chatItem";

const ChatPage = () => {
  let $msim = window.$msim;
  let [state, dispatch] = useContext(context);
  let history = useHistory();

  const ds = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
  });

  const [dataSource, setDataSource] = useState(ds);
  const [loading, setLoading] = useState(false);

  const renderItem = (rowData, sectionID, rowID) => {
    return (
      <SwipeAction
        className="goods_card"
        key={rowData.conversationID}
        right={[
          <Button
            size="lg"
            shape="rect"
            className="delete_button"
            theme="danger"
            onClick={() => deleteChat(rowData)}
          >
            删除
          </Button>,
        ]}
      >
        <ChatItem chat={rowData} onClick={chatChange} />
      </SwipeAction>
    );
  };

  const initChat = (conversationID) => {
    setDataSource(
      dataSource.cloneWithRows([
        {
          conversationID: 11,
          showMsg: "41414",
        },
      ])
    );
    setLoading(false);
    // $msim
    //   .getConversationList({
    //     conversationID: conversationID,
    //   })
    //   .then((res) => {
    //     let chats = res.data.chats;
    //     if (chats.length > 0) {
    //       dispatch({ type: "addChats", payload: chats });
    //       setDataSource(dataSource.cloneWithRows([...chats]));
    //     setLoading(false);
    //     }
    //     setLoading(false);
    //   })
    //   .catch((err) => {
    //     setLoading(false);
    //     return Toast.show(err?.msg || err);
    //   });
  };

  // 模拟加载更多数据
  const loadData = () => {
    setLoading(true);
    let conversationID;
    let chatList = state?.chatList || [];
    if (chatList.length > 0) {
      conversationID = chatList[chatList.length - 1].conversationID;
    }
    initChat(conversationID);
  };

  function deleteChat(chat) {
    $msim
      .deleteConversation({
        conversationID: chat.conversationID,
      })
      .then((res) => {
        return Toast.success(`删除会话[${chat.conversationID}]成功`);
      })
      .catch((err) => {
        return Toast.show(err?.msg || err);
      });
  }

  function chatChange(chat) {
    if (chat && chat.conversationID) {
      // TODO怎么判断已读
      if (chat.unread > 0) {
        setRead(chat.conversationID);
      }
      dispatch({ type: "changeChat", payload: chat });
      history.push("/message/" + chat.conversationID);
    }
  }

  function setRead(conversationID) {
    $msim.setMessageRead({
      conversationID: conversationID,
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="chat_wrapper">
      <NavBar mode="light">会话列表</NavBar>
      <ListView
        className="chat_list"
        dataSource={dataSource}
        renderFooter={() => {
          return loading ? <Icon type="loading" /> : null;
        }}
        renderRow={renderItem}
        onEndReached={loadData}
      />
    </div>
  );
};

export default ChatPage;
