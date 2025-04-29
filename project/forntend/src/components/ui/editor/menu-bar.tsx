"use client"

import { useTheme } from "next-themes"
import { Bold, Italic, Code, AlignLeft, AlignCenter, AlignRight, List, Type, Palette, ChevronDown } from 'lucide-react'
import { colors } from "@/components/colors"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const fontSizes = [
  { label: 'Small', size: '0.875em' },
  { label: 'Normal', size: '1em' },
  { label: 'Large', size: '1.25em' },
  { label: 'Extra Large', size: '1.5em' },
]

const textColors = [
  { label: 'Default', color: 'inherit' },
  { label: 'Primary', color: '#2563eb' },
  { label: 'Success', color: '#16a34a' },
  { label: 'Warning', color: '#d97706' },
  { label: 'Danger', color: '#dc2626' },
]

export function MenuBar({ editor }: { editor: any }) {
  const { theme } = useTheme()
  
  if (!editor) return null

  const toolbarStyle = {
    backgroundColor: theme === "dark" ? colors.background.dark.end : colors.background.light.end,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  }

  const buttonStyle = {
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  }

  const activeButtonStyle = {
    backgroundColor: theme === "dark" ? colors.background.dark.start : colors.background.light.start,
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    opacity: 0.9
  }

  return (
    <div className="flex items-center gap-1 p-2 rounded-lg border mb-2" style={toolbarStyle}>
      <div className="flex items-center gap-1 border-r pr-2" style={{ borderColor: toolbarStyle.borderColor }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive('bold') ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive('bold') ? activeButtonStyle : buttonStyle}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive('italic') ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive('italic') ? activeButtonStyle : buttonStyle}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive('code') ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive('code') ? activeButtonStyle : buttonStyle}
          title="Code"
        >
          <Code size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2" style={{ borderColor: toolbarStyle.borderColor }}>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive({ textAlign: 'left' }) ? activeButtonStyle : buttonStyle}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive({ textAlign: 'center' }) ? activeButtonStyle : buttonStyle}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive({ textAlign: 'right' }) ? activeButtonStyle : buttonStyle}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2" style={{ borderColor: toolbarStyle.borderColor }}>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
            editor.isActive('bulletList') ? 'bg-opacity-20 bg-gray-500' : ''
          }`}
          style={editor.isActive('bulletList') ? activeButtonStyle : buttonStyle}
          title="Bullet List"
        >
          <List size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors flex items-center gap-1"
              style={buttonStyle}
            >
              <Type size={18} />
              <ChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" style={toolbarStyle}>
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size.size}
                onClick={() => editor.chain().focus().setFontSize(size.size).run()}
                className="flex items-center gap-2"
                style={buttonStyle}
              >
                <span style={{ fontSize: size.size }}>{size.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors flex items-center gap-1"
              style={buttonStyle}
            >
              <Palette size={18} />
              <ChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" style={toolbarStyle}>
            {textColors.map((color) => (
              <DropdownMenuItem
                key={color.color}
                onClick={() => editor.chain().focus().setColor(color.color).run()}
                className="flex items-center gap-2"
                style={buttonStyle}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color.color }} />
                {color.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

