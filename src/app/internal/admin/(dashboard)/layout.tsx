import MySidebar from "@/components/admin/sidebar";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
        <MySidebar /> 
        {children}
    </div>
    
  );
}