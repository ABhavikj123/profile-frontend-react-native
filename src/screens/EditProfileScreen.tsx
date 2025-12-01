"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from "react-native"
import Input from "../components/Input"
import Button from "../components/Button"
import ProfileStrengthMeter from "../components/ProfileStrengthMeter"
import { useProfile } from "../hooks/useProfile"
import { validateName, validateBio } from "../utils/validators"
import { useNavigation } from "@react-navigation/native"

export default function EditProfileScreen() {
  const navigation = useNavigation()
  const { profile, error, isUpdating, isLoading, updateProfileData, clearProfileError } = useProfile()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; bio?: string }>({})

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setBio(profile.bio || "")
    }
  }, [profile])

  useEffect(() => {
    setFieldErrors({})
  }, [name, bio])

  function validate() {
    const errs: { name?: string; bio?: string } = {}

    const n = validateName(name)
    if (n) errs.name = n

    const b = validateBio(bio)
    if (b) errs.bio = b

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleUpdate = async () => {
    clearProfileError()
    if (!validate()) return

    if (name === profile?.name && bio === (profile?.bio || "")) {
      Alert.alert("No Changes", "You haven't made any changes.")
      return
    }

    const payload: { name?: string; bio?: string | null } = {}
    if (name !== profile?.name) payload.name = name.trim()
    if (bio !== (profile?.bio || "")) payload.bio = bio.trim() || null

    try {
      await updateProfileData(payload)
      Alert.alert("Success", "Your profile has been updated.", [{ text: "OK" }])
    } catch {}
  }

  const hasChanges = name !== profile?.name || bio !== (profile?.bio || "")

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center px-5 py-6">
            <View className="w-full max-w-[520px]">
              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="w-11 h-11 rounded-xl bg-white items-center justify-center border border-gray-200 shadow-sm"
                >
                  <Text className="text-gray-800 text-lg">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">Edit Profile</Text>
                <View className="w-11" />
              </View>

              <View className="bg-white rounded-2xl p-6 mb-6 items-center shadow-lg border border-gray-100">
                <View className="w-24 h-24 rounded-3xl bg-blue-500 items-center justify-center mb-4 shadow-lg">
                  <Text className="text-white text-3xl font-bold">
                    {name?.charAt(0)?.toUpperCase() || profile?.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <TouchableOpacity className="px-4 py-2 rounded-lg bg-gray-100">
                  <Text className="text-sm text-gray-600 font-medium">Change photo</Text>
                </TouchableOpacity>
              </View>

              {error && (
                <View className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <View className="flex-row items-start gap-3">
                    <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center mt-0.5">
                      <Text className="text-white text-xs font-bold">!</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-red-800 font-semibold text-sm mb-1">Update failed</Text>
                      <Text className="text-red-600 text-sm">{error.message}</Text>
                    </View>
                  </View>
                  {!isUpdating && (
                    <Text className="text-red-500 text-xs font-semibold mt-3" onPress={clearProfileError}>
                      Dismiss
                    </Text>
                  )}
                </View>
              )}

              <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm">
                <ProfileStrengthMeter name={name} bio={bio} />
              </View>

              <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
                <View className="gap-5">
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    editable={!isUpdating && !isLoading}
                    error={fieldErrors.name ?? null}
                    showClear
                  />

                  <Input
                    label="Bio"
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Write something about yourself..."
                    multiline
                    numberOfLines={5}
                    editable={!isUpdating && !isLoading}
                    error={fieldErrors.bio ?? null}
                  />
                </View>
              </View>

              <View className="bg-blue-50 rounded-2xl p-5 mb-8 border border-blue-100">
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-xl bg-blue-500 items-center justify-center">
                    <Text className="text-white text-sm">💡</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-800 font-semibold text-sm mb-1">Pro tip</Text>
                    <Text className="text-blue-700 text-sm leading-relaxed">
                      Include your skills, experience, or interests to stand out and make meaningful connections.
                    </Text>
                  </View>
                </View>
              </View>

              <View className="gap-3">
                <Button
                  title={isUpdating ? "Saving changes..." : "Save changes"}
                  onPress={handleUpdate}
                  loading={isUpdating}
                  disabled={isUpdating || isLoading || !hasChanges}
                  variant="primary"
                  size="lg"
                />

                <Button
                  title="Reset to original"
                  onPress={() => {
                    if (profile) {
                      setName(profile.name)
                      setBio(profile.bio || "")
                    }
                  }}
                  disabled={isUpdating || isLoading || !hasChanges}
                  variant="ghost"
                  size="md"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
