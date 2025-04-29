import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X } from 'lucide-react'
import { useTheme } from "next-themes"
import { colors } from "@/components/colors"

interface FloatingChatProps {
  onSendChat: () => void
  chatInput: string
  setChatInput: (input: string) => void
  chatResponse: string
  chatLoading: boolean
  chatError: string | null
}

const FloatingChat: React.FC<FloatingChatProps> = ({
  onSendChat,
  chatInput,
  setChatInput,
  chatResponse,
  chatLoading,
  chatError
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const toggleChat = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div 
          className="w-80 h-96 rounded-lg shadow-lg flex flex-col"
          style={{
            backgroundColor: isDark ? colors.background?.dark?.start || '#1a202c' : colors.background?.light?.start || '#f7fafc',
            borderColor: isDark ? colors.border?.dark || '#2d3748' : colors.border?.light || '#e2e8f0',
          }}
        >
          <div 
            className="flex justify-between items-center p-3 border-b"
            style={{
              borderColor: isDark ? colors.border?.dark || '#2d3748' : colors.border?.light || '#e2e8f0',
            }}
          >
            <h3 
              className="font-semibold"
              style={{
                color: isDark ? colors.text?.dark?.primary || '#f7fafc' : colors.text?.light?.primary || '#1a202c',
              }}
            >
              Chat
            </h3>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={toggleChat}
            >
              <X size={20} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {chatResponse && (
              <div 
                className="mb-2 p-2 rounded"
                style={{
                  backgroundColor: isDark ? colors.background?.dark?.end || '#2d3748' : colors.background?.light?.end || '#edf2f7',
                  color: isDark ? colors.text?.dark?.primary || '#f7fafc' : colors.text?.light?.primary || '#1a202c',
                }}
              >
                {chatResponse}
              </div>
            )}
            {chatError && (
              <div className="text-red-500 mb-2">{chatError}</div>
            )}
          </div>
          <div className="p-3 border-t" style={{ borderColor: isDark ? colors.border?.dark || '#2d3748' : colors.border?.light || '#e2e8f0' }}>
            <form onSubmit={(e) => { e.preventDefault(); onSendChat(); }} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                style={{
                  backgroundColor: isDark ? colors.background?.dark?.end || '#2d3748' : colors.background?.light?.end || '#edf2f7',
                  color: isDark ? colors.text?.dark?.primary || '#f7fafc' : colors.text?.light?.primary || '#1a202c',
                  borderColor: isDark ? colors.border?.dark || '#2d3748' : colors.border?.light || '#e2e8f0',
                }}
              />
              <Button 
                type="submit" 
                disabled={chatLoading}
                style={{
                  backgroundColor: colors.button?.primary?.default || '#3182ce',
                  color: colors.button?.text || '#ffffff',
                }}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          size="icon"
          onClick={toggleChat}
          style={{
            backgroundColor: colors.button?.primary?.default || '#3182ce',
            color: colors.button?.text || '#ffffff',
          }}
        >
          <MessageCircle size={24} />
        </Button>
      )}
    </div>
  )
}

export default FloatingChat

