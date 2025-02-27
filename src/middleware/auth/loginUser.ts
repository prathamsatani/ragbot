import { redirect } from "next/navigation";
import logEvent from "../logging/log";

interface loginUserProps {
  email: string;
  password: string;
}

export default async function loginUser({ email, password }: loginUserProps) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "ragbot-client-token": "client-token" },
    body: JSON.stringify({ email, password }),
  });

  logEvent({
    method: "POST",
    endpoint: "/api/auth/login",
    status: 200,
    timestamp: new Date(),
    ip: "",
  })

  const data = await response.json();
  console.log(data);
  if (data["status"] === "200") {
    redirect("/internal/admin/analytics");
  } else {
    return true;
  }
};


