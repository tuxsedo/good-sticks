import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="h-screen bg-ember-gradient flex w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
