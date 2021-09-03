import Login from "@/view/login";
import Message from "@/view/message";
import Search from "@/view/search";
import Chats from "@/view/chats";
import Register from "@/view/register";
import My from "@/view/my";
import { Switch, Route, Redirect } from "react-router-dom";
import { useMemo } from "react";

const AppRoute = () => {
  let userId = useMemo(() => {
    return window.localStorage.getItem("userId");
  }, []);
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/chat" component={Chats} />
      <Route path="/message/:conversationID/:uid" component={Message} />
      <Route path="/search" component={Search} />
      <Route path="/my" component={My} />
      <Redirect to={userId ? "/chat" : "/login"} />
    </Switch>
  );
};
export default AppRoute;
