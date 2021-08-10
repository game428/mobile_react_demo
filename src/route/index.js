import Login from "@/view/login";
import Message from "@/view/message";
import Search from "@/view/search";
import Chats from "@/view/chats";
import My from "@/view/my";
import { Switch, Route } from "react-router-dom";

const AppRoute = () => {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/chat" component={Chats} />
      <Route path="/message/:conversationID" component={Message} />
      <Route path="/search" component={Search} />
      <Route path="/my" component={My} />
      <Route path="*" component={Login} />
    </Switch>
  );
};
export default AppRoute;
