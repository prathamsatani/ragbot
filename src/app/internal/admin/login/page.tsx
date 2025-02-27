"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import loginUser from "@/middleware/auth/loginUser";
import logEvent from "@/middleware/logging/log";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(await loginUser({ email, password }));
  };

  return (
    <div className="h-screen w-screen">
      <div className="h-screen flex items-center justify-center">
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-70 z-10">
            <div className="flex items-center justify-center h-full">
              <div className="bg-white p-8 rounded-lg">
                <h3 className="text-lg font-bold text-red-600">Error</h3>
                <h1 className="text-3xl font-bold">Unable to verify identity</h1>
                <p className="text-md">
                  Please check your email and password and try again
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setError(false);
                    setEmail("");
                    setPassword("");
                  }}
                >Okay</Button>
              </div>
            </div>
          </div>
        )}
        <Card className="w-[25%]">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
