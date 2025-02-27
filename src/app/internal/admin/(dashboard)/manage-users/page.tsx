"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import logEvent from "@/middleware/logging/log";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface User {
  email: string;
  fname: string;
  lname: string;
  date_added: string;
  access: string[];
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Error";
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/user-actions/fetch");
        await logEvent({
          method: "GET",
          endpoint: "/api/auth/user-actions/fetch",
          status: response.status,
          timestamp: new Date(),
          ip: "",
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        } else {
          setUsers([]);
          setFilteredUsers([]);
          console.warn("Unexpected response format:", data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (accessFilter !== 'all') {
      filtered = filtered.filter(user => user.access.includes(accessFilter));
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        return user.fname.toLowerCase().includes(search) ||
          user.lname.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search);
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, accessFilter, users]);

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Page Header */}
      <header className="p-4 border-b">
          <h1 className="font-bold text-3xl text-gray-800">Manage Users</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your team members and their account permissions here.
        </p>
      </header>
      <div className="p-4 border-b">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Levels</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="creator">Creator</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Link
          href="/internal/admin/manage-users/add-user"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <IconPlus className="w-5 h-5" />
          <span className="ml-2">Add User</span>
        </Link>

        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="border rounded-lg">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gray-100 p-3 rounded-t-lg text-sm font-medium text-gray-700">
            <div className="col-span-5">User</div>
            <div className="col-span-4">Access</div>
            <div className="col-span-2">Date Added</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p>Loading users...</p>
              </div>
            </div>
            ) : error ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-red-500">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-700">No users found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.email || index}
                    className="grid grid-cols-12 items-center p-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* User Details */}
                    <div className="col-span-5 flex flex-col">
                      <span className="font-bold text-gray-900">
                        {user.fname} {user.lname}
                      </span>
                      <span className="text-gray-600 text-sm">{user.email}</span>
                    </div>
                    {/* Access Roles */}
                    <div className="col-span-4">
                      {user.access && user.access.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.access.map((role, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No access roles</span>
                      )}
                    </div>
                    {/* Date Added */}
                    <div className="col-span-2 text-gray-700">
                      {formatDate(user.date_added)}
                    </div>
                    {/* Actions */}
                    <div className="col-span-1 flex justify-center gap-2">
                      <Link
                        href={`/edit-user/${user.email}`}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        aria-label="Edit user"
                      >
                        <IconPencil className="w-5 h-5 text-gray-700" />
                      </Link>
                      <button
                        disabled={user.access.includes("superadmin")}
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${user.fname} ${user.lname}?`
                            )
                          ) {
                            // Handle delete functionality here
                          }
                        }}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        aria-label="Delete user"
                      >
                        <IconTrash className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
