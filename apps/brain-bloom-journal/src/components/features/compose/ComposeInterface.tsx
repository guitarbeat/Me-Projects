import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Button, Tooltip, TooltipTrigger, TooltipContent, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { NewsprintTextarea } from "@/components/ui/newsprint-textarea";
import { Printer, Mic, MicOff, Send, Upload, X, Check, AlertCircle, MessageSquare } from "@/lib/icons/icon-imports";
import { supabase } from "@/integrations/supabase/client";
import { useToast, useErrorHandler } from "@/hooks";
import { newsprintTextStyles } from "@/lib";
import { ModelSelector, type ModelConfig, AI_MODELS } from "../chat/ModelSelector";
import { MessageItem, TypingIndicator, ChatEmptyState } from "../chat/chat-components";
import { useSpeechRecognition } from "../chat/use-speech-recognition";
import type { Message } from "@/types";

export type { Message };

interface ComposeInterfaceProps {
  onGenerateRetrospective: (messages: Message[], structuredData?: any) => void;
  onAudioSave?: (audioBlob: Blob, transcription: string) => Promise<void>;
  className?: string;
  isMobile?: boolean;
}

interface ParsedEntry {
  date: string;
  content: string;
}

export const ComposeInterface = memo<ComposeInterfaceProps>(({ 
  onGenerateRetrospective,
  className = '',
  isMobile = false 
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'import'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(
    AI_MODELS.find(m => m.provider === 'gemini' && m.model === 'gemini-1.5-flash') || AI_MODELS[0]
  );
  
  // Import state
  const [textContent, setTextContent] = useState('');
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { handleError, handleAsyncError } = useErrorHandler({ context: { component: 'ComposeInterface' } });

  const { isListening, startListening, stopListening } = useSpeechRecognition(
    setCurrentMessage,
    (error) => handleError(error, { operation: 'speechRecognition', metadata: { errorType: error.error } })
  );

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadMessages = useCallback(async () => {
    const result = await handleAsyncError(async () => {
      const { data, error } = await (supabase as any).from('reflect_daily').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setMessages(data.map((entry: any) => ({
          id: entry.id,
          text: entry.content,
          isUser: entry.entry_type === 'user_message',
          timestamp: new Date(entry.created_at)
        })));
      }
    }, { operation: 'loadMessages' });
    setIsLoading(false);
  }, [handleAsyncError]);

  const saveMessage = useCallback(async (message: Message) => {
    await handleAsyncError(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await (supabase as any).from('reflect_daily').insert({
        user_id: user.id,
        content: message.text,
        entry_date: new Date().toISOString().split('T')[0],
        entry_type: message.isUser ? 'user_message' : 'ai_response'
      });
      if (error) throw error;
    }, { operation: 'saveMessage' });
  }, [handleAsyncError]);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;
    const sanitizedMessage = currentMessage.replace(/[<>]/g, '').trim();
    if (!sanitizedMessage) return;

    const userMessage: Message = { id: Date.now().toString(), text: sanitizedMessage, isUser: true, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setIsTyping(true);
    await saveMessage(userMessage);

    const result = await handleAsyncError(async () => {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { message: userMessage.text, context: updatedMessages.slice(-10), modelConfig: selectedModel }
      });
      if (error) throw error;
      return data;
    }, { operation: 'getAIResponse' });

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: result.data?.response || "I'm here to listen. What's on your mind?",
      isUser: false,
      timestamp: new Date()
    };

    const finalMessages = [...updatedMessages, aiMessage];
    setMessages(finalMessages);
    await saveMessage(aiMessage);
    setIsTyping(false);
  }, [currentMessage, messages, saveMessage, selectedModel, handleAsyncError]);

  const handleGenerateRetrospectiveClick = useCallback(async () => {
    const result = await handleAsyncError(async () => {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { message: '', context: messages, generateSummary: true, modelConfig: selectedModel }
      });
      if (error) throw error;
      return data;
    }, { operation: 'generateRetrospective' });

    if (!result.error) {
      onGenerateRetrospective(messages, { ...result.data.structuredData, weather: result.data.weather });
    }
  }, [messages, onGenerateRetrospective, selectedModel, handleAsyncError]);

  // Import handlers
  const parseTextContent = useCallback((text: string): ParsedEntry[] => {
    const entries: ParsedEntry[] = [];
    const datePattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})[:\s-]+(.+?)(?=\n\d{4}-\d{2}-\d{2}|\n\d{1,2}\/\d{1,2}\/\d{4}|$)/gs;
    let match;
    
    while ((match = datePattern.exec(text)) !== null) {
      entries.push({ date: match[1].trim(), content: match[2].trim() });
    }
    
    if (entries.length === 0 && text.trim()) {
      entries.push({ date: new Date().toISOString().split('T')[0], content: text.trim() });
    }
    
    return entries;
  }, []);

  const handleTextChange = useCallback((value: string) => {
    setTextContent(value);
    setImportError(null);
    setParsedEntries(value.trim() ? parseTextContent(value) : []);
  }, [parseTextContent]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        const entries = Array.isArray(json) ? json : [json];
        const parsed = entries.map((entry: any) => ({
          date: entry.date || entry.timestamp || new Date().toISOString().split('T')[0],
          content: entry.content || entry.text || entry.message || JSON.stringify(entry),
        }));
        setParsedEntries(parsed);
        setTextContent(JSON.stringify(json, null, 2));
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());
        const dateIdx = headers?.findIndex(h => h.includes('date')) ?? -1;
        const contentIdx = headers?.findIndex(h => h.includes('content') || h.includes('text')) ?? -1;
        
        const parsed = lines.slice(1).map(line => {
          const cols = line.split(',');
          return {
            date: cols[dateIdx]?.trim() || new Date().toISOString().split('T')[0],
            content: cols[contentIdx]?.trim() || '',
          };
        }).filter(e => e.content);
        
        setParsedEntries(parsed);
        setTextContent(text);
      } else {
        handleTextChange(text);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to read file');
    }
  }, [handleTextChange]);

  const handleImport = useCallback(() => {
    if (parsedEntries.length === 0) {
      setImportError('No entries to import');
      return;
    }

    const importedMessages: Message[] = parsedEntries.map((entry, idx) => ({
      id: `import-${idx}`,
      text: entry.content,
      isUser: true,
      timestamp: new Date(entry.date || Date.now()),
    }));

    onGenerateRetrospective(importedMessages, {
      importedAt: new Date().toISOString(),
      entriesCount: parsedEntries.length,
    });

    toast({ title: 'Imported', description: `${parsedEntries.length} entries added` });
    setTextContent('');
    setParsedEntries([]);
  }, [parsedEntries, onGenerateRetrospective, toast]);

  const clearImport = useCallback(() => {
    setTextContent('');
    setParsedEntries([]);
    setImportError(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-2 h-2 bg-newsprint-foreground sharp-corners animate-bounce"
              style={{ animationDelay: `${i * 100}ms`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
        <span className="font-newsprint-mono text-xs uppercase tracking-widest text-newsprint-neutral-500">
          Loading messages...
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Unified Tab Header */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'import')} className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-newsprint-border pb-2 mb-4">
          <TabsList className="h-8">
            <TabsTrigger value="chat" className="text-xs gap-1.5 px-3">
              <MessageSquare className="h-3 w-3" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs gap-1.5 px-3">
              <Upload className="h-3 w-3" />
              Import
            </TabsTrigger>
          </TabsList>
          
          <span className={`${newsprintTextStyles.metadata} text-xs`}>
            {activeTab === 'chat' && messages.length > 0 && `${messages.length} msgs`}
            {activeTab === 'import' && parsedEntries.length > 0 && `${parsedEntries.length} entries`}
          </span>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.length === 0 ? (
              <ChatEmptyState isMobile={isMobile} />
            ) : (
              messages.map(msg => <MessageItem key={msg.id} message={msg} isMobile={isMobile} />)
            )}
            {isTyping && <TypingIndicator isMobile={isMobile} />}
            <div ref={messagesEndRef} />
          </div>

          <div className="space-y-3 pt-3 border-t border-newsprint-border">
            <div className="flex items-center gap-2">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            </div>
            
            <NewsprintTextarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder="What's on your mind..."
              className="min-h-[80px] resize-none"
            />
            
            <div className="flex items-center justify-between">
              <Button
                onClick={handleGenerateRetrospectiveClick}
                variant="newsprint-outline"
                size="sm"
                disabled={messages.length <= 1}
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Print
              </Button>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      variant="newsprint-outline"
                      size="icon"
                      className={`h-8 w-8 ${isListening ? "animate-pulse bg-newsprint-accent text-newsprint-bg" : ""}`}
                    >
                      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isListening ? "Stop" : "Record"}</TooltipContent>
                </Tooltip>

                <Button 
                  onClick={handleSendMessage} 
                  disabled={!currentMessage.trim() || isTyping} 
                  variant="newsprint"
                  size="sm"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="flex-1 space-y-4">
            {/* File Upload */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="Upload file"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
              className="border border-dashed border-newsprint-border p-6 text-center cursor-pointer hover:border-newsprint-foreground/50 transition-colors sharp-corners focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newsprint-foreground focus-visible:ring-offset-2"
            >
              <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">Drop file or click to upload</p>
              <p className="text-xs text-muted-foreground">.txt, .json, .csv</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Text Input */}
            <textarea
              value={textContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Or paste entries here...&#10;Format: YYYY-MM-DD: Your entry"
              className="w-full min-h-[120px] border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring sharp-corners"
            />

            {/* Error */}
            {importError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {importError}
              </div>
            )}

            {/* Preview */}
            {parsedEntries.length > 0 && (
              <div className="border border-newsprint-border p-3 sharp-corners space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    {parsedEntries.length} entries ready
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={clearImport} className="h-6 px-2" aria-label="Clear import">
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear import</TooltipContent>
                  </Tooltip>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {parsedEntries.slice(0, 3).map((entry, idx) => (
                    <div key={idx} className="text-xs truncate text-muted-foreground">
                      <span className="font-medium">{entry.date}:</span> {entry.content.slice(0, 60)}...
                    </div>
                  ))}
                  {parsedEntries.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{parsedEntries.length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Import Action */}
          <div className="pt-3 border-t border-newsprint-border">
            <Button
              onClick={handleImport}
              disabled={parsedEntries.length === 0}
              variant="newsprint"
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Import & Generate
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

ComposeInterface.displayName = 'ComposeInterface';