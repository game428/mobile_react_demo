import { Icon, Grid } from "antd-mobile";
import emojiJson from "@/assets/emoji/emoji.json";
const Emoji = (props) => {
  console.log("emoji");
  return (
    <div className="emoji_wrapper">
      <Grid
        data={emojiJson}
        itemStyle={{ margin: "0 10px" }}
        columnNum={7}
        hasLine={false}
        renderItem={(dataItem) => (
          <div
            className="grid_item"
            onClick={() => {
              props.selectEmoji(dataItem);
            }}
          >
            <img
              className="emoji_item"
              src={require("@/assets/emoji/" + dataItem.url).default}
              alt={dataItem.key}
            />
          </div>
        )}
      />
      <div className="clear_btn">
        <Icon type="cross" size="md" onClick={() => props.clearMsg()} />
      </div>
    </div>
  );
};

export default Emoji;
