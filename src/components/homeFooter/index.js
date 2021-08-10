import { useHistory } from "react-router-dom";
import { TabBar, Icon } from "antd-mobile";
import "./homeFooter.css";

const HomeFooter = (props) => {
  const history = useHistory();
  return (
    <div className="footer_wrapper">
      <TabBar>
        <TabBar.Item
          title="Search"
          key="Search"
          icon={<Icon type="search" />}
          selectedIcon={<Icon type="search" color="#108ee9" />}
          selected={props.selectedTab === "search"}
          onPress={() => {
            history.push("/search");
          }}
        ></TabBar.Item>
        <TabBar.Item
          title="Chats"
          key="Chats"
          icon={<i className="iconfont icon-xiaoxi"></i>}
          selectedIcon={<i className="iconfont icon-xiaoxi active_icon"></i>}
          selected={props.selectedTab === "chat"}
          onPress={() => {
            history.push("/chat");
          }}
        ></TabBar.Item>
        <TabBar.Item
          title="My"
          key="My"
          icon={<i className="iconfont icon-user"></i>}
          selectedIcon={<i className="iconfont icon-user active_icon"></i>}
          selected={props.selectedTab === "my"}
          onPress={() => {
            history.push("/my");
          }}
        ></TabBar.Item>
      </TabBar>
    </div>
  );
};
export default HomeFooter;
