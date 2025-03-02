"use client";
import logAPICall from "@/middleware/logging/log";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconDeviceFloppy, IconUpload, IconMessage, IconMessageQuestion, IconEdit, IconTrash, IconRobot, IconSettings } from "@tabler/icons-react";
import { AlertCircle, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { v4 } from "uuid";

interface ChatbotSettings {
  _id?: string,
  name?: string,
  retrieverPrompt: string,
  systemPrompt: string,
  collectionName: string,
  dateCreated: Date,
  isActive: boolean,
  lastUpdated: Date,
  contextFile?: File;
}

export default function EditChatbotPage() {
  const [chatbotSettingsList, setChatbotSettingsList] = useState<ChatbotSettings[]>([]);
  const [chatbotSettings, setChatbotSettings] = useState<ChatbotSettings>({
    systemPrompt: "",
    retrieverPrompt: "",
    collectionName: "",
    dateCreated: new Date(),
    isActive: false,
    lastUpdated: new Date(),
    contextFile: undefined
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentSettingId, setCurrentSettingId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Helper function to safely format dates
  const formatDate = (dateValue: Date | string | undefined) => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle both Date objects and date strings
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      
      // Check if the date is valid before using toLocaleDateString
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  useEffect(() => {
    const fetchChatbotSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chatbot/fetch-settings");
        await logAPICall({
          method: "GET",
          endpoint: "/api/chatbot/fetch-settings",
          status: response.status,
          timestamp: new Date(),
          ip: "",
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();

        setChatbotSettingsList(data);
        
        if (!Array.isArray(data) && data._id) {
          setChatbotSettings({
            _id: data._id,
            name: data.name,
            systemPrompt: data.systemPrompt,
            retrieverPrompt: data.retrieverPrompt,
            collectionName: data.collectionName,
            dateCreated: data.dateCreated,
            isActive: data.isActive,
            lastUpdated: data.lastUpdated,
          });
        }
        
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

  const handleInputChange = (field: keyof ChatbotSettings, value: string | boolean) => {
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
        contextFile: file
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

      // For demo purposes - update the settings list with the edited setting
      if (currentSettingId) {
        setChatbotSettingsList(prevList => 
          prevList.map(setting => 
            setting._id === currentSettingId 
              ? {...chatbotSettings, lastUpdated: new Date()} 
              : setting
          )
        );
      } else {
        // For new settings, add to the list with a temporary _id
        const newSetting = {
          ...chatbotSettings,
          _id: v4(),
          dateCreated: new Date(),
          lastUpdated: new Date()
        };
        setChatbotSettingsList(prevList => [...prevList, newSetting]);
      }
      
      const formData = new FormData();
      
      // Add all properties except the file
      Object.entries(chatbotSettings).forEach(([key, value]) => {
        if (key !== 'contextFile' && value !== undefined) {
          formData.append(key, typeof value === 'boolean' ? value.toString() : value);
        }
      });
      
      // Add the file if it exists
      if (chatbotSettings.contextFile) {
        formData.append('contextFile', chatbotSettings.contextFile);
      }

      let response = undefined;
      if (currentSettingId) {
        response = await fetch('/api/chatbot/update-settings', {
          method: 'PUT',
          body: formData
        });

        await logAPICall({
          method: "PUT",
          endpoint: "/api/chatbot/update-settings",
          status: response.status,
          timestamp: new Date(),
          ip: "",
        });
      }
      else{
        response = await fetch('/api/chatbot/update-settings', {
          method: 'POST',
          body: formData
        });

        await logAPICall({
          method: "POST",
          endpoint: "/api/chatbot/update-settings",
          status: response.status,
          timestamp: new Date(),
          ip: "",
        });
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setSuccess("Chatbot settings saved successfully!");
      
      // Reset edit mode
      setEditMode(false);
      setShowEditForm(false);
      setCurrentSettingId(null);
      
    } catch (err) {
      console.error("Failed to save chatbot settings:", err);
      setError("Failed to save chatbot settings. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (settingId: string) => {
    const settingToEdit = chatbotSettingsList.find(setting => setting._id === settingId);
    if (settingToEdit) {
      setChatbotSettings(settingToEdit);
      setCurrentSettingId(settingId);
      setEditMode(true);
      setShowEditForm(true);
    }
  };

  const handleDeleteClick = async (settingId: string) => {
    if (confirm("Are you sure you want to delete this chatbot setting?")) {
      try {
        setIsLoading(true);
        
        // In a real app, you would call the API to delete the setting
        // const response = await fetch(`/api/chatbot/settings/${settingId}`, {
        //   method: 'DELETE',
        // });
        
        // For demo purposes, just remove it from the local state
        setChatbotSettingsList(prevList => 
          prevList.filter(setting => setting._id !== settingId)
        );
        
        setSuccess("Chatbot setting deleted successfully!");
        
        // If we were editing this setting, reset the form
        if (currentSettingId === settingId) {
          setEditMode(false);
          setShowEditForm(false);
          setCurrentSettingId(null);
          setChatbotSettings({
            systemPrompt: "",
            retrieverPrompt: "",
            collectionName: "",
            dateCreated: new Date(),
            isActive: false,
            lastUpdated: new Date(),
          });
        }
        
      } catch (err) {
        console.error("Failed to delete chatbot setting:", err);
        setError("Failed to delete chatbot setting. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-b from-white to-gray-50">
      {/* Page Header */}
      <header className="p-4 border-b">
        <h1 className="font-bold text-3xl text-gray-800">Edit Chatbot</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and customize your chatbot settings.
        </p>
      </header>

      {/* Content Area */}
      <div className="p-4 pb-20">
        <div className="mx-auto">
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

              {/* Chatbot Settings Table Section */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <IconSettings className="w-5 h-5 text-blue-700" />
                    <h2 className="text-2xl font-bold text-gray-800">Chatbot Settings</h2>
                  </div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Reset form for a new chatbot setting
                      setChatbotSettings({
                        systemPrompt: "",
                        retrieverPrompt: "",
                        collectionName: "",
                        dateCreated: new Date(),
                        isActive: false,
                        lastUpdated: new Date(),
                        name: "New Chatbot"
                      });
                      setEditMode(true);
                      setShowEditForm(true);
                      setCurrentSettingId(null);
                    }}
                  >
                    <IconRobot className="w-4 h-4 mr-2" />
                    Add New Chatbot
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Name</TableHead>
                          <TableHead>Collection</TableHead>
                          <TableHead>Date Created</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chatbotSettingsList.length > 0 ? (
                          chatbotSettingsList.map((setting) => (
                            <TableRow key={setting._id}>
                              <TableCell className="font-medium">{setting.name || 'Unnamed Chatbot'}</TableCell>
                              <TableCell>{setting.collectionName}</TableCell>
                              <TableCell>{formatDate(setting.dateCreated)}</TableCell>
                              <TableCell>{formatDate(setting.lastUpdated)}</TableCell>
                              <TableCell>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  setting.isActive 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {setting.isActive ? "Active" : "Inactive"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditClick(setting._id!)}
                                    className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                  >
                                    <IconEdit className="w-4 h-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteClick(setting._id!)}
                                    className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <IconTrash className="w-4 h-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <p className="text-gray-500">No chatbot settings found. Create one using the button above.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Edit Form Section - Conditionally rendered */}
              {showEditForm && (
                <div className="space-y-6 mt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconRobot className="w-5 h-5 text-blue-700" />
                      <h2 className="text-2xl font-bold text-gray-800">
                        {editMode && currentSettingId 
                          ? `Edit: ${chatbotSettings.name}` 
                          : "Create New Chatbot"}
                      </h2>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditMode(false);
                        setCurrentSettingId(null);
                      }}
                      className="flex items-center gap-1"
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span>Collapse</span>
                    </Button>
                  </div>

                  {/* Settings Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <IconSettings className="w-5 h-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Chatbot Name
                          </label>
                          <Input
                            id="name"
                            value={chatbotSettings.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter chatbot name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
                            Collection Name
                          </label>
                          <Input
                            id="collection"
                            value={chatbotSettings.collectionName}
                            onChange={(e) => handleInputChange('collectionName', e.target.value)}
                            placeholder="Enter collection name"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={chatbotSettings.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                          Active (publicly available)
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prompts Section */}
                  <div className="flex items-center gap-2 mt-6 mb-4">
                    <IconMessage className="w-5 h-5 text-blue-700" />
                    <h2 className="text-xl font-bold text-gray-800">Prompts</h2>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <IconMessage className="w-5 h-5" />
                        System Prompt
                      </CardTitle>
                      <CardDescription>
                        This message will be displayed when a user first interacts with your chatbot.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={chatbotSettings.systemPrompt}
                        onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                        placeholder="Enter system prompt"
                        className="min-h-32 resize-y text-base"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <IconMessageQuestion className="w-5 h-5" />
                        Retriever Prompt
                      </CardTitle>
                      <CardDescription>
                        This message will be displayed when the chatbot cannot understand or process a user's query.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={chatbotSettings.retrieverPrompt}
                        onChange={(e) => handleInputChange('retrieverPrompt', e.target.value)}
                        placeholder="Enter retriever prompt"
                        className="min-h-32 resize-y text-base"
                      />
                    </CardContent>
                  </Card>

                  {/* Training Section */}
                  <div className="flex items-center gap-2 mt-6 mb-4">
                    <IconMessageQuestion className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-xl font-bold text-gray-800">Training</h2>
                  </div>

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
{`question, answer
What are your hours?, We're open 9-5 M-F
How do I reset my password?, Click 'Forgot Password'`}
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
   "a": "Click 'Forgot Password'"
 }
]`}
                              </pre>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-bold mb-1 text-blue-600">TXT Format</p>
                              <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {
`Q: What are your hours?
A: We're open 9-5 M-F

Q: How do I reset my password?
A: Click 'Forgot Password'`
                                }
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className=" flex justify-end pt-4">
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
          )}
        </div>
      </div>
    </div>
  );
}