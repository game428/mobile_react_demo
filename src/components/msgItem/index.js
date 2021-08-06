import { Icon, ActivityIndicator } from "zarm";

const MsgItem = (props) => {
  let message = props.message;
  let isSelf = props.isSelf;
  let $IM = window.$IM;
  const emojiMap = require("@/assets/emoji/emojiMap.json");
  function handleMsg(text) {
    let temp = text;
    let html = "";
    let left = -1;
    let right = -1;
    while (temp.length > 0) {
      left = temp.indexOf("[");
      right = temp.indexOf("]");
      if (right > left && left > -1) {
        let img = temp.slice(left, right + 1);
        if (emojiMap[img]) {
          html += temp.slice(0, left);
          html += `<img className="emoji_icon" src="${require("@/assets/emoji/" +
            emojiMap[img])}">`;
        } else {
          html += temp.slice(0, right + 1);
        }
        temp = temp.slice(right + 1);
      } else {
        let n = right < left ? left : right;
        if (n === -1) {
          html += temp;
          temp = "";
        } else {
          html += temp.slice(0, n + 1);
          temp = temp.slice(n + 1);
        }
      }
    }
    return html;
  }
  function msgStatusDom() {
    switch (message.sendStatus) {
      case $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SENDING:
        return <ActivityIndicator type="spinner" />;
      case $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_SUCC:
        return (
          <span className="revoke_btn" onClick="$emit('revoke', message)">
            撤回
          </span>
        );
      case $IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_FAIL:
        return <Icon type="info-round-fill" theme="warning" size="lg" />;
      default:
        break;
    }
  }
  function msgTypeDom() {
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
  }
  return (
    <div className="message_wrapper">
      {message.type === 31 ? (
        <div className="group_tip_wrapper">
          {isSelf ? "你" : "对方"}撤回了一条消息
        </div>
      ) : (
        <div
          className="c2c_layout"
          className={isSelf ? "position_right" : null}
        >
          <div className="col_1">
            <div className="avatar">
              <img
                v-if="isSelf"
                src="@/assets/img/curUser.jpg"
                className="avatar_img"
                alt=""
              />
              <img
                v-else
                src="@/assets/img/avatar.png"
                className="avatar_img"
                alt=""
              />
            </div>
          </div>
          <div className="col_2">
            <div className="content_wrapper">
              <div className="message_status">{msgStatusDom()}</div>
              <div
                className="message_content"
                className={isSelf ? "message_send" : "message_received"}
              >
                {msgTypeDom()}
              </div>
            </div>
            <div className="base" className={isSelf ? "right" : "left"}>
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
