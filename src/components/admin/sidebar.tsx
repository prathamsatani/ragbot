import React from "react";
import { Sidebar, SidebarBody } from "../ui/sidebar";
import Link from "next/link";
import {
  IconEdit,
  IconLogout,
  IconLogs,
  IconReportAnalytics,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

export default function MySidebar() {
  return (
    <Sidebar open={true} animate={false}>
      <SidebarBody className="bg-background-sidebar h-full">
        <div className="flex flex-col h-full">
          <div className="space-y-4 mb-4">
            <h1 className="text-font-main font-bold text-center text-4xl">
              RAGBot
            </h1>
            <h2 className="text-font-main font-bold text-center text-2xl my-2">
              Admin Panel
            </h2>
            <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
          </div>

          <nav
            aria-label="Admin navigation"
            className="flex flex-col flex-1 justify-between"
          >
            <div className="space-y-2">
              <Link
                href="/internal/admin/analytics"
                className="flex items-center hover:bg-background-hover p-2 rounded-lg transition-colors"
                aria-label="Analytics"
              >
                <IconReportAnalytics className="text-font-main w-7 h-7" />
                <span className="text-font-main font-bold text-lg ml-4">
                  Analytics
                </span>
              </Link>
              <Link
                href="/internal/admin/edit-chatbot"
                className="flex items-center hover:bg-background-hover p-2 rounded-lg transition-colors"
                aria-label="Edit Chatbot"
              >
                <IconEdit className="text-font-main w-7 h-7" />
                <span className="text-font-main font-bold text-lg ml-4">
                  Edit Chatbot
                </span>
              </Link>
              <Link
                href="/internal/admin/manage-users"
                className="flex items-center hover:bg-background-hover p-2 rounded-lg transition-colors"
                aria-label="Manage Users"
              >
                <IconUsers className="text-font-main w-7 h-7" />
                <span className="text-font-main font-bold text-lg ml-4">
                  Manage Users
                </span>
              </Link>
              <Link
                href="/internal/admin/logs"
                className="flex items-center hover:bg-background-hover p-2 rounded-lg transition-colors"
                aria-label="Logs"
              >
                <IconLogs className="text-font-main w-7 h-7" />
                <span className="text-font-main font-bold text-lg ml-4">
                  Logs
                </span>
              </Link>
            </div>
            <div className="space-y-2 mb-4">
              <Link
                href="/internal/admin/settings"
                className="flex items-center hover:bg-background-hover p-2 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <IconSettings className="text-font-main w-7 h-7" />
                <span className="text-font-main font-bold text-lg ml-4">
                  Settings
                </span>
              </Link>
              <Link
                href="#"
                className="flex items-center hover:bg-background-hover p-2 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <IconLogout className="text-font-main w-7 h-7" />
                <span className="text-font-main font-bold text-lg ml-4">
                  Logout
                </span>
              </Link>
            </div>
          </nav>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
