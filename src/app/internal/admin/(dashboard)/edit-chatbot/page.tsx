"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import logEvent from "@/middleware/logging/log";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconDeviceFloppy, IconUpload, IconRobot, IconMessage, IconMessageQuestion } from "@tabler/icons-react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatbotSettings {
  welcomeMessage: string;
  fallbackResponse: string;
  trainingDataFile?: File;
}

export default function EditChatbotPage() {
  const [chatbotSettings, setChatbotSettings] = useState<ChatbotSettings>({
    welcomeMessage: "",
    fallbackResponse: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("messages");

  useEffect(() => {
    const fetchChatbotSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chatbot/settings");
        await logEvent({
          method: "GET",
          endpoint: "/api/chatbot/settings",
          status: response.status,
          timestamp: new Date(),
          ip: "",
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setChatbotSettings({
          welcomeMessage: data.welcomeMessage || "",
          fallbackResponse: data.fallbackResponse || ""
        });
        
        if (data.trainingFileName) {
          setFileName(data.trainingFileName);
        }
      } catch (err) {
        console.error("Failed to fetch chatbot settings:", err);
        setError("Failed to load chatbot settings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatbotSettings();
  }, []);

  const handleInputChange = (field: keyof ChatbotSettings, value: string) => {
    setChatbotSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatbotSettings(prev => ({
        ...prev,
        trainingDataFile: file
      }));
      setFileName(file.name);
      setSuccess(`File "${file.name}" selected successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSuccess(null);
      setError(null);
      
      const formData = new FormData();
      formData.append('welcomeMessage', chatbotSettings.welcomeMessage);
      formData.append('fallbackResponse', chatbotSettings.fallbackResponse);
      
      if (chatbotSettings.trainingDataFile) {
        formData.append('trainingData', chatbotSettings.trainingDataFile);
      }
      
      const response = await fetch('/api/chatbot/settings', {
        method: 'POST',
        body: formData
      });
      
      await logEvent({
        method: "POST",
        endpoint: "/api/chatbot/settings",
        status: response.status,
        timestamp: new Date(),
        ip: "",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setSuccess("Chatbot settings saved successfully!");
    } catch (err) {
      console.error("Failed to save chatbot settings:", err);
      setError("Failed to save chatbot settings. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-b from-white to-gray-50">
      {/* Page Header */}
      <header className="p-4 border-b">
        <h1 className="font-bold text-3xl text-gray-800">Edit Chatbot</h1>
        <p className="mt-1 text-sm text-gray-600">
          Customize your chatbot's behavior and responses.
        </p>
      </header>

      {/* Content Area */}
      <div className="p-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p className="font-medium">Loading chatbot settings...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notification area */}
              {(success || error) && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  success ? "bg-green-50 text-green-700 border border-green-200" : 
                  "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {success ? 
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" /> : 
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <p className="font-medium">{success || error}</p>
                    {error && (
                      <p className="mt-1 text-sm">Please try again or contact support if the problem persists.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <Tabs defaultValue="messages" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
                  <TabsTrigger value="messages" className="flex items-center gap-2">
                    <IconMessage className="w-4 h-4" />
                    <span>Messages</span>
                  </TabsTrigger>
                  <TabsTrigger value="training" className="flex items-center gap-2">
                    <IconMessageQuestion className="w-4 h-4" />
                    <span>Training</span>
                  </TabsTrigger>
                </TabsList>

                {/* Messages Tab */}
                <TabsContent value="messages" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <IconMessage className="w-5 h-5" />
                        Welcome Message
                      </CardTitle>
                      <CardDescription>
                        This message will be displayed when a user first interacts with your chatbot.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={chatbotSettings.welcomeMessage}
                        onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                        placeholder="Hi there! I'm your friendly assistant. How can I help you today?"
                        className="min-h-32 resize-y text-base"
                      />
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <IconRobot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
                            <p className="text-gray-800">
                              {chatbotSettings.welcomeMessage || "Hi there! I'm your friendly assistant. How can I help you today?"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <IconMessageQuestion className="w-5 h-5" />
                        Fallback Response
                      </CardTitle>
                      <CardDescription>
                        This message will be displayed when the chatbot cannot understand or process a user's query.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={chatbotSettings.fallbackResponse}
                        onChange={(e) => handleInputChange('fallbackResponse', e.target.value)}
                        placeholder="I'm sorry, I didn't quite understand that. Could you rephrase your question?"
                        className="min-h-32 resize-y text-base"
                      />
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                            <IconRobot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
                            <p className="text-gray-800">
                              {chatbotSettings.fallbackResponse || "I'm sorry, I didn't quite understand that. Could you rephrase your question?"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Training Tab */}
                <TabsContent value="training" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <IconUpload className="w-5 h-5" />
                        Training Data
                      </CardTitle>
                      <CardDescription>
                        Upload a file containing training data for your chatbot to improve its responses.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            type="file"
                            id="file-upload"
                            className="sr-only"
                            accept=".csv,.json,.txt"
                            onChange={handleFileChange}
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 px-6 transition-all hover:border-blue-400 hover:bg-blue-50"
                          >
                            <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                              <IconUpload className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-700">
                              {fileName ? fileName : "Upload training data file"}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                              Drag and drop your file here, or click to browse
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Supports CSV, JSON, and TXT files
                            </p>
                          </label>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <h4 className="font-medium text-gray-700 mb-2">Training Data Format</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            The training file should contain pairs of questions and answers in one of these formats:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-bold mb-1 text-blue-600">CSV Format</p>
                              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                question,answer
                                "What are your hours?","We're open 9-5 M-F"
                                "How do I reset my password?","Visit the login page and click 'Forgot Password'"
                              </pre>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-bold mb-1 text-blue-600">JSON Format</p>
                              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {`[
                                  {
                                    "q": "What are your hours?",
                                    "a": "We're open 9-5 M-F"
                                  },
                                  {
                                    "q": "How do I reset my password?",
                                    "a": "Visit the login page and click 'Forgot Password'"
                                  }
                                ]`}
                              </pre>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-bold mb-1 text-blue-600">TXT Format</p>
                              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {`Q: What are your hours?
                                  A: We're open 9-5 M-F

                                  Q: How do I reset my password?
                                  A: Visit the login page and click 'Forgot Password'`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Save Button */}
              <div className="sticky bottom-6 flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-lg text-base flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="w-5 h-5" />
                      <span>Save Chatbot Settings</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}