import { useState } from "react";
import { useInput } from "@/utils/useInput";
import { Icon, InputItem, Button, Grid } from "antd-mobile";
import "./msgSend.css";

const MsgSend = (props) => {
  const [isHideMore, setHideMore] = useState(true);
  const [isHideEmoji, setHideEmoji] = useState(true);
  const [msgText, setMsgText] = useInput("");
  const emojiJson = require("@/assets/emoji/emoji.json");
  // emojiJson.forEach((emoji) => {
  //   import("@/assets/emoji/" + emoji.url).then((imgUrl) => {
  //     emoji.imgUrl = imgUrl.default;
  //   });
  // });
  //                 src={dataItem.imgUrl}
  const emojiMap = require("@/assets/emoji/emojiMap.json");
  const moreData = [
    {
      className: "more_item iconfont icon-tupian",
      onClick: showEmoji,
    },
  ];

  function hideAll() {
    if (!isHideMore) setHideMore(true);
    if (!isHideEmoji) setHideEmoji(true);
  }
  function showMore() {
    if (isHideMore) setHideMore(false);
    if (!isHideEmoji) setHideEmoji(true);
  }
  function showEmoji() {
    if (isHideEmoji) setHideEmoji(false);
    if (!isHideMore) setHideMore(true);
  }

  return (
    <div className="footer_wrapper">
      <div className="footer_input">
        <InputItem {...msgText} clear type="text" placeholder="发送聊天内容" />
        <i
          className="emoji_btn lg_icon iconfont icon-biaoqing"
          onClick={showEmoji}
        ></i>
        {msgText.value.length > 0 ? (
          <Button type="primary" size="small" inline>
            发送
          </Button>
        ) : (
          <i className="lg_icon iconfont icon-jjia-" onClick={showMore}></i>
        )}
      </div>
      <div
        className={
          "footer_more more_wrapper " + (isHideMore ? "is_head_more" : "")
        }
      >
        <div className="more_cont">
          <Grid
            data={moreData}
            itemStyle={{ margin: "0 10px" }}
            hasLine={false}
            renderItem={(dataItem) => (
              <div className="grid_item bg_w">
                <i
                  className={dataItem.className}
                  onClick={dataItem.onClick}
                ></i>
              </div>
            )}
          />
        </div>
      </div>
      <div
        className={
          "footer_more emoji_wrapper " + (isHideEmoji ? "is_head_more" : "")
        }
      >
        <div className="more_cont">
          <Grid
            data={emojiJson}
            itemStyle={{ margin: "0 10px" }}
            columnNum={7}
            hasLine={false}
            renderItem={(dataItem) => (
              <div className="grid_item">
                <img
                  className="emoji_item"
                  src={require("@/assets/emoji/" + dataItem.url).default}
                  alt={dataItem.key}
                />
              </div>
            )}
          />
        </div>
        <div className="clear_btn">
          <Icon name="cross" />
        </div>
      </div>
    </div>
  );
};

export default MsgSend;
