import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"

interface InputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: any
  autoCapitalize?: any
  editable?: boolean
  error?: string | null
  showClear?: boolean
  multiline?: boolean
  numberOfLines?: number
  className?: string
  testID?: string
  hint?: string
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable = true,
  error,
  showClear = false,
  multiline = false,
  numberOfLines = 1,
  className = "",
  testID,
  hint,
}: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View className={`w-full ${className}`}>
      {label ? <Text className="text-sm font-semibold text-gray-800 mb-2">{label}</Text> : null}

      <View
        className={`w-full rounded-xl px-4 py-3 bg-white border 
          ${error ? "border-red-400" : focused ? "border-blue-500 shadow-md" : "border-gray-300"}
          flex-row items-center`}
        style={{
          minHeight: multiline ? numberOfLines * 24 + 24 : 52,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          testID={testID}
          className="flex-1 text-base text-gray-900"
          style={{
            padding: 0,
            outlineStyle: "none" as any,
            textAlignVertical: multiline ? "top" : "center",
          }}
        />

        {showClear && value.length > 0 && editable ? (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}

      {hint && !error && <Text className="text-gray-400 text-xs mt-1">{hint}</Text>}
    </View>
  )
}
