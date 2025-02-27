import { time } from "console";

interface LogProps {
	method: string;
	endpoint: string;
	status: number;
	timestamp: Date;
	ip: string;
}

export default async function logEvent({ method, endpoint, status, timestamp, ip }: LogProps) {
  await fetch("/api/logging/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: method,
      endpoint: endpoint,
      status: status,
      timestamp: timestamp,
      ip: ip,
    }),
  });
}
