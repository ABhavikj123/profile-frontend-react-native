import type React from "react"
import { Text, ActivityIndicator, View, Pressable, type GestureResponderEvent } from "react-native"

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps {
  title: string
  onPress?: (event: GestureResponderEvent) => void
  loading?: boolean
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  textClassName?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  fullWidth?: boolean
  testID?: string
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  textClassName = "",
  leftElement,
  rightElement,
  fullWidth = true,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "py-3 px-5",
    md: "py-4 px-6",
    lg: "py-[18px] px-8",
  }

  const textSizes: Record<ButtonSize, string> = {
    sm: "text-[14px]",
    md: "text-[15px]",
    lg: "text-[16px]",
  }

  const variants: Record<ButtonVariant, { container: string; text: string }> = {
    primary: {
      container: "bg-[#6366F1]", // Indigo primary - more attractive than black
      text: "text-white",
    },
    secondary: {
      container: "bg-[#F1F5F9]",
      text: "text-[#334155]",
    },
    outline: {
      container: "border-[1.5px] border-[#E2E8F0] bg-white",
      text: "text-[#334155]",
    },
    danger: {
      container: "bg-[#EF4444]",
      text: "text-white",
    },
    ghost: {
      container: "bg-transparent",
      text: "text-[#6366F1]",
    },
  }

  const activeVariants: Record<ButtonVariant, string> = {
    primary: "active:bg-[#4F46E5]",
    secondary: "active:bg-[#E2E8F0]",
    outline: "active:bg-[#F8FAFC]",
    danger: "active:bg-[#DC2626]",
    ghost: "active:bg-[#EEF2FF]",
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`
        rounded-xl flex-row items-center justify-center
        ${sizeStyles[size]}
        ${variants[variant].container}
        ${!isDisabled ? activeVariants[variant] : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{
        shadowColor: variant === "primary" ? "#6366F1" : "transparent",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: variant === "primary" && !isDisabled ? 0.25 : 0,
        shadowRadius: 16,
        elevation: variant === "primary" && !isDisabled ? 6 : 0,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "secondary" || variant === "ghost" ? "#6366F1" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftElement && <View>{leftElement}</View>}
          <Text
            className={`
              font-semibold
              ${textSizes[size]}
              ${variants[variant].text}
              ${textClassName}
            `}
          >
            {title}
          </Text>
          {rightElement && <View>{rightElement}</View>}
        </View>
      )}
    </Pressable>
  )
}
