import React, { useState } from "react";
import Search from "@/view/search";
import Chats from "@/view/chats";
import My from "@/view/my";
import "./layout.css";
import { TabBar, Icon } from "antd-mobile";
import { Switch, Route } from "react-router-dom";

function Home() {
  const [selectedTab, setSelectedTab] = useState("Chats");
  return (
    <div className="layout_wrapper">
      <div className="main_wrapper">
        <Switch>
          <Route path="/chat" component={Chats} />
          <Route path="/search" component={Search} />
          <Route path="/my" component={My} />
          <Route path="*" component={Chats} />
        </Switch>
      </div>
      <div className="footer_wrapper">
        <TabBar>
          <TabBar.Item
            title="Search"
            key="Search"
            icon={<Icon type="search" />}
            selectedIcon={<Icon type="search" color="#108ee9" />}
            selected={selectedTab === "search"}
            onPress={() => {
              setSelectedTab("search");
            }}
          ></TabBar.Item>
          <TabBar.Item
            title="Chats"
            key="Chats"
            icon={<i className="iconfont icon-xiaoxi"></i>}
            selectedIcon={<i className="iconfont icon-xiaoxi active_icon"></i>}
            selected={selectedTab === "chat"}
            onPress={() => {
              setSelectedTab("chat");
            }}
          ></TabBar.Item>
          <TabBar.Item
            title="My"
            key="My"
            icon={<i className="iconfont icon-user"></i>}
            selectedIcon={<i className="iconfont icon-user active_icon"></i>}
            selected={selectedTab === "my"}
            onPress={() => {
              setSelectedTab("my");
            }}
          ></TabBar.Item>
        </TabBar>
      </div>
    </div>
  );
}
export default Home;
