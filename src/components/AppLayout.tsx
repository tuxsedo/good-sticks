import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import FeedbackButton from "./FeedbackButton";

const AppLayout = () => {
  return (
    <div className="h-screen bg-ember-gradient flex w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <Outlet />
      </main>
      <FeedbackButton />
    </div>
  );
};

export default AppLayout;
