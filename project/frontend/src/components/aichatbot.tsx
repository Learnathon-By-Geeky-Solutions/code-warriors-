import React, { useState } from 'react';
import { Cat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ThemeStyles {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
}

interface FloatingChatButtonProps {
  onSendChat: () => void;
  chatInput: string;
  setChatInput: (value: string) => void;
  chatResponse: string;
  chatLoading: boolean;
  chatError: string | null;
  themeTextStyle: ThemeStyles;
  themeInputStyle: ThemeStyles;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onSendChat,
  chatInput,
  setChatInput,
  chatResponse,
  chatLoading,
  chatError,
  themeTextStyle,
  themeInputStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <Cat className="w-6 h-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle style={themeTextStyle}>Chat with Bot</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mb-4 p-4" style={themeInputStyle}>
            {chatResponse && (
              <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                <p className="whitespace-pre-wrap">{chatResponse}</p>
              </div>
            )}
            {chatLoading && <p className="text-muted-foreground">Processing...</p>}
            {chatError && <p className="text-destructive">{chatError}</p>}
          </div>

          <div className="flex gap-2 p-4 border-t">
            <Textarea
              placeholder="Type your question here..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 resize-none"
              rows={2}
              style={themeInputStyle}
            />
            <Button 
              onClick={onSendChat}
              disabled={!chatInput.trim() || chatLoading}
              className="self-end"
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChatButton;