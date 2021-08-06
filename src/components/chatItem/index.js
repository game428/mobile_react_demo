import "./chatItem.css";
import avatar from "@/assets/img/avatar.png";

function ChatItem(props) {
  let chat = props.chat;
  return (
    <div className="chat_item" onClick={() => props.onClick(chat)}>
      <div className="avatar">
        <img className="avatar_img" src={avatar} alt="" />
      </div>
      <div className="info">
        <div className="user_info">
          <div className="user_name van-ellipsis">{chat.conversationID}</div>
          <div className="unread_sign">
            {chat.unread > 0 ? (
              <span className="badge">{chat.unread}</span>
            ) : null}
          </div>
        </div>
        <div className="last_msg">
          <div className="last_msg_body van-ellipsis">
            {chat.showMsgType === 1
              ? "[图片]"
              : chat.showMsgType === 2
              ? "[音频]"
              : chat.showMsgType === 3
              ? "[视频]"
              : chat.showMsgType === 31
              ? "[已撤回]"
              : chat.showMsgType === 100
              ? "[自定义消息]]"
              : chat.showMsg}
          </div>
          <div className="last_msg_time">
            {chat.showTime ? new Date(chat.showTime).toLocaleTimeString() : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
