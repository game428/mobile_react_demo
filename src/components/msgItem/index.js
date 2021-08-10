import { Icon, ActivityIndicator } from "zarm";
import emojiMap from "@/assets/emoji/emojiMap.json";
import "./msgItem.css";

const MsgItem = (props) => {
  let message = props.message;
  let isSelf = props.isSelf;
  let $IM = window.$IM;

  // 处理表情
  const handleMsg = (text) => {
    let temp = text;
    let html = [];
    let left = -1;
    let right = -1;
    while (temp.length > 0) {
      left = temp.indexOf("[");
      right = temp.indexOf("]");
      if (right > left && left > -1) {
        let img = temp.slice(left, right + 1);
        if (emojiMap[img]) {
          html.push(temp.slice(0, left));
          html.push(
            <img
              className="emoji_icon"
              key={message.onlyId + "-" + temp.length}
              src={require("@/assets/emoji/" + emojiMap[img]).default}
              alt={emojiMap[img]}
            />
          );
        } else {
          html.push(temp.slice(0, right + 1));
        }
        temp = temp.slice(right + 1);
      } else {
        let n = right < left ? left : right;
        if (n === -1) {
          html.push(temp);
          temp = "";
        } else {
          html.push(temp.slice(0, n + 1));
          temp = temp.slice(n + 1);
        }
      }
    }
    return html;
  };

  // 消息状态
  const msgStatusDom = () => {
    switch (message.sendStatus) {
      case $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SENDING:
        return <ActivityIndicator type="spinner" />;
      case $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_SUCC:
        return isSelf ? (
          <span
            className="revoke_btn"
            onClick={() => {
              props.revoke(message);
            }}
          >
            撤回
          </span>
        ) : null;
      case $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_FAIL:
        return (
          <div onClick={props.resend()}>
            <Icon
              type="info-round-fill"
              theme="warning"
              color="f35f5f"
              size="lg"
            />
          </div>
        );
      default:
        break;
    }
  };

  // 消息类型
  const msgTypeDom = () => {
    switch (message.type) {
      case 0:
        return <span className="text_box">{handleMsg(message.text)}</span>;
      case 1:
        return <img className="image_element" src={message.url} alt="" />;
      case 2:
        return <span className="text_box">[音频]</span>;
      case 3:
        return <img className="image_element" src={message.url} alt="" />;
      case 100:
        return <span className="text_box">[自定义消息]</span>;
      default:
        return <span>{message.body}</span>;
    }
  };
  return (
    <div className="message_item_wrapper">
      {message.type === 31 ? (
        <div className="group_tip_wrapper">
          {isSelf ? "你" : "对方"}撤回了一条消息
        </div>
      ) : (
        <div className={"c2c_layout" + (isSelf ? " position_right" : "")}>
          <div className="col_1">
            <div className="avatar">
              <img
                src={
                  require(isSelf
                    ? "@/assets/img/curUser.jpg"
                    : "@/assets/img/avatar.png").default
                }
                className="avatar_img"
                alt=""
              />
            </div>
          </div>
          <div className="col_2">
            <div className="content_wrapper">
              <div className="message_status">{msgStatusDom()}</div>
              <div
                className={
                  "message_content " +
                  (isSelf ? "message_send" : "message_received")
                }
              >
                {msgTypeDom()}
              </div>
            </div>
            <div className={"base " + (isSelf ? "right" : "left")}>
              <div className="date">
                {new Date(message.showMsgTime).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col_3"></div>
        </div>
      )}
    </div>
  );
};

export default MsgItem;
