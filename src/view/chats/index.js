import { useContext, useState, useEffect, useCallback, useMemo } from "react";
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
import HomeFooter from "@/components/homeFooter";
import ChatItem from "@/components/chatItem";

const ChatPage = () => {
  let $msim = window.$msim;
  let [state, dispatch] = useContext(context);
  let history = useHistory();

  const ds = useMemo(() => {
    return new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
  }, []);

  const [dataSource, setDataSource] = useState(ds);
  const [hasMore, setHasMore] = useState(true);

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

  const initChat = useCallback(
    (conversationID) => {
      console.log(11, conversationID);
      $msim
        .getConversationList({
          conversationID: conversationID,
          pageSize: 20,
        })
        .then((res) => {
          let chats = res.data.chats;
          console.log(1111, chats);
          setHasMore(res.data.hasMore);
          if (chats.length > 0) {
            dispatch({ type: "addChats", payload: chats });
          }
        })
        .catch((err) => {
          return Toast.show(err?.msg || err);
        });
    },
    [$msim, dispatch]
  );

  // 模拟加载更多数据
  const loadData = useCallback(() => {
    let conversationID;
    let chatList = state.chatList;
    if (chatList.length > 0) {
      conversationID = chatList[chatList.length - 1].conversationID;
    }
    initChat(conversationID);
  }, [initChat, state.chatList]);

  const deleteChat = (chat) => {
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
  };

  const chatChange = (chat) => {
    if (chat && chat.conversationID) {
      // TODO怎么判断已读
      if (chat.unread > 0) {
        setRead(chat.conversationID);
      }
      dispatch({ type: "changeChat", payload: chat.conversationID });
      history.push(`/message/${chat.conversationID}/${chat.uid}`);
    }
  };

  const setRead = (conversationID) => {
    $msim.setMessageRead({
      conversationID: conversationID,
    });
  };

  useEffect(() => {
    if (state.chatList.length === 0) {
      loadData();
    } else {
      setDataSource(ds.cloneWithRows([...state.chatList]));
    }
  }, [state.chatList, ds, loadData]);

  return (
    <div className="chat_wrapper">
      <NavBar mode="light">会话列表</NavBar>
      <ListView
        className="chat_list"
        dataSource={dataSource}
        renderRow={renderItem}
        renderFooter={() => {
          return hasMore ? null : <div className="no_more">没有更多数据了</div>;
        }}
        pullToRefresh={
          hasMore ? (
            <PullToRefresh
              direction="up"
              indicator={{
                activate: <Icon type="loading" />,
                deactivate: <div></div>,
                release: <Icon type="loading" />,
                finish: <div></div>,
              }}
              distanceToRefresh={100}
              onRefresh={(e) => {
                loadData();
              }}
            />
          ) : null
        }
      />
      <HomeFooter selectedTab="chat"></HomeFooter>
    </div>
  );
};

export default ChatPage;
