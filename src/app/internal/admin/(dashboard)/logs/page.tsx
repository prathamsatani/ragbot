"use client";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search } from "lucide-react";
import logAPICall from "@/middleware/logging/log";

interface Log {
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
}

export default function Page() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  // New state for time filtering
  const [timeFilter, setTimeFilter] = useState('all'); // Options: 'all', '1h', '3h', '6h', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Ref for the scrollable area
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/logging/fetch-logs");
      await logAPICall({
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
      const logsData = data.logs && Array.isArray(data.logs)
        ? data.logs
        : Array.isArray(data)
          ? data
          : [];
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setError("Failed to load logs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Filter by method
    if (methodFilter !== 'all') {
      filtered = filtered.filter(log => log.method === methodFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => {
        if (statusFilter === '2xx') return log.status >= 200 && log.status < 300;
        if (statusFilter === '4xx') return log.status >= 400 && log.status < 500;
        if (statusFilter === '5xx') return log.status >= 500;
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status.toString().includes(searchTerm)
      );
    }

    // Filter by time
    if (timeFilter !== 'all') {
      if (timeFilter === 'custom' && customStart && customEnd) {
        const customStartDate = new Date(customStart);
        const customEndDate = new Date(customEnd);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= customStartDate && logDate <= customEndDate;
        });
      } else if (timeFilter !== 'custom') {
        let hours = 0;
        if (timeFilter === '1h') hours = 1;
        else if (timeFilter === '3h') hours = 3;
        else if (timeFilter === '6h') hours = 6;
        const thresholdDate = new Date(Date.now() - hours * 60 * 60 * 1000);
        filtered = filtered.filter(log => new Date(log.timestamp) >= thresholdDate);
      }
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, methodFilter, statusFilter, timeFilter, customStart, customEnd]);

  const getStatusBadgeClass = (status: number) => {
    if (status < 300) return 'bg-green-100 text-green-800 border border-green-300';
    if (status < 400) return 'bg-blue-100 text-blue-800 border border-blue-300';
    if (status < 500) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-red-100 text-red-800 border border-red-300';
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'POST': return 'bg-green-100 text-green-800 border border-green-300';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'DELETE': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Auto-scroll to bottom whenever filteredLogs changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-800">Logs</h1>
          <Button 
            onClick={fetchLogs} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and analyze your chatbot's activity logs.
        </p>
      </header>

      {/* Filters */}
      <div className="p-4 border-b">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="2xx">2xx (Success)</SelectItem>
              <SelectItem value="4xx">4xx (Client Error)</SelectItem>
              <SelectItem value="5xx">5xx (Server Error)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="3h">Last 3 Hours</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {timeFilter === 'custom' && (
          <div className="mt-4 flex gap-4">
            <Input
              type="datetime-local"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              placeholder="Start Time"
            />
            <Input
              type="datetime-local"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              placeholder="End Time"
            />
          </div>
        )}
      </div>

      {/* Logs Table */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="border rounded-lg h-full flex flex-col">
          {/* Table Header */}
          <div className="flex bg-gray-50 border-b">
            <div className="w-1/5 p-3 text-sm font-medium text-gray-600">
              Timestamp
            </div>
            <div className="w-1/5 p-3 text-sm font-medium text-gray-600">
              Method
            </div>
            <div className="w-2/5 p-3 text-sm font-medium text-gray-600">
              Endpoint
            </div>
            <div className="w-1/5 p-3 text-sm font-medium text-gray-600">
              Status
            </div>
          </div>

          {/* Table Body */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <p>Loading logs...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p>No logs found</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex px-4 py-2 border-b hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-1/5 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="w-1/5">
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${getMethodBadgeClass(log.method)}`}
                      >
                        {log.method}
                      </span>
                    </div>
                    <div className="w-2/5 text-sm text-gray-600 break-all">
                      {log.endpoint}
                    </div>
                    <div className="w-1/5">
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${getStatusBadgeClass(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}
