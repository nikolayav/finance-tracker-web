import Sidebar from "./SideBar";

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
