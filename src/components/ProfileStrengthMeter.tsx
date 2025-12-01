"use client"

import { useEffect, useRef, useMemo } from "react"
import { View, Text, Animated, Easing } from "react-native"

type StrengthLabel = "Getting Started" | "Good Progress" | "Excellent"

export interface ProfileStrengthMeterProps {
  score?: number
  name?: string
  bio?: string
  className?: string
  showLabel?: boolean
  compact?: boolean
}

export function calculateProfileStrength(name?: string | null, bio?: string | null): number {
  const n = (name ?? "").trim()
  const b = (bio ?? "").trim()

  let nameScore = 0
  if (n.length === 0) nameScore = 0
  else if (n.length <= 4) nameScore = 10
  else if (n.length <= 10) nameScore = 20
  else nameScore = 30

  let bioScore = 0
  if (b.length === 0) bioScore = 0
  else if (b.length < 20) bioScore = 10
  else if (b.length <= 60) bioScore = 20
  else bioScore = 40

  const completionBonus = n.length > 0 && b.length > 0 ? 10 : 0

  const keywords = [
    "experience",
    "engineer",
    "developer",
    "manager",
    "skill",
    "skilled",
    "expert",
    "specialist",
    "lead",
    "worked",
    "projects",
    "achieved",
    "passionate",
    "motivat",
  ]
  const lower = b.toLowerCase()
  const containsKeyword = keywords.some((k) => lower.includes(k))
  const multipleSentences = b.split(/[.!?]/).filter(Boolean).length >= 2
  const comma = b.includes(",")

  const qualityBonus = b.length > 60 && (containsKeyword || multipleSentences || comma) ? 20 : 0

  const raw = nameScore + bioScore + completionBonus + qualityBonus
  return Math.max(0, Math.min(100, Math.round(raw)))
}

function resolveLabelAndColor(score: number): { label: StrengthLabel; color: string; bgColor: string } {
  if (score < 40) return { label: "Getting Started", color: "#F59E0B", bgColor: "#FFFBEB" }
  if (score < 70) return { label: "Good Progress", color: "#6366F1", bgColor: "#EEF2FF" }
  return { label: "Excellent", color: "#10B981", bgColor: "#ECFDF5" }
}

export default function ProfileStrengthMeter({
  score,
  name,
  bio,
  className = "",
  showLabel = true,
  compact = false,
}: ProfileStrengthMeterProps) {
  const computed = typeof score === "number" ? score : calculateProfileStrength(name, bio)
  const clamped = Math.max(0, Math.min(100, Math.round(computed)))

  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [clamped])

  const { label, color, bgColor } = useMemo(() => resolveLabelAndColor(clamped), [clamped])

  const widthInterp = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  })

  const segments = [
    { threshold: 33, filled: clamped >= 33 },
    { threshold: 66, filled: clamped >= 66 },
    { threshold: 100, filled: clamped >= 90 },
  ]

  if (compact) {
    return (
      <View className={`${className}`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <Text className="text-[14px] font-semibold text-[#334155]">Profile Strength</Text>
          </View>
          <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: bgColor }}>
            <Text className="text-[12px] font-bold" style={{ color }}>
              {clamped}%
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          {segments.map((seg, i) => (
            <View
              key={i}
              className="flex-1 h-2 rounded-full"
              style={{ backgroundColor: seg.filled ? color : "#E2E8F0" }}
            />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View
      className={`w-full ${className}`}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
    >
      {showLabel && (
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <Text className="text-[15px] font-semibold text-[#1E293B]">Profile Strength</Text>
          </View>
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: bgColor }}>
            <Text className="text-[12px] font-bold" style={{ color }}>
              {label}
            </Text>
          </View>
        </View>
      )}

      <View className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
        <Animated.View
          style={{
            width: widthInterp,
            backgroundColor: color,
            height: "100%",
            borderRadius: 999,
          }}
        />
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-[13px] text-[#64748B]">
          {clamped < 100 ? "Add more details to improve your profile" : "Your profile looks great!"}
        </Text>
        <Text className="text-[16px] font-bold" style={{ color }}>
          {clamped}%
        </Text>
      </View>
    </View>
  )
}
