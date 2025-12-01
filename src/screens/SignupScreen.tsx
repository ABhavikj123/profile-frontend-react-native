import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, Platform, KeyboardAvoidingView, SafeAreaView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Input from "../components/Input"
import Button from "../components/Button"
import { useAuth } from "../hooks/useAuth"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../navigation/AuthNavigator"
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateBio,
} from "../utils/validators"
import ProfileStrengthMeter from "../components/ProfileStrengthMeter"

export default function SignupScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { signup, error: authError, isLoading, clearError } = useAuth()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    bio: "",
    email: "",
    password: "",
    confirm: "",
  })

  useEffect(() => {
    setFieldErrors({ name: "", bio: "", email: "", password: "", confirm: "" })
  }, [name, bio, email, password, confirm])

  function validate(): boolean {
    const errs: any = {}
    const e1 = validateName(name)
    if (e1) errs.name = e1
    const e2 = validateBio(bio)
    if (e2) errs.bio = e2
    const e3 = validateEmail(email)
    if (e3) errs.email = e3
    const e4 = validatePassword(password)
    if (e4) errs.password = e4
    const e5 = validateConfirmPassword(password, confirm)
    if (e5) errs.confirm = e5
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSignup = async () => {
    clearError()
    if (!validate()) return

    try {
      const user = await signup(name.trim(), email.trim(), bio.trim(), password)
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      }
    } catch (err) {
      setName("")
      setBio("")
      setEmail("")
      setPassword("")
      setConfirm("")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center px-5 py-8">
            <View className="w-full max-w-[480px]">
              <View className="mb-8">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="w-11 h-11 rounded-xl bg-white items-center justify-center mb-6 border border-gray-200 shadow-sm"
                >
                  <Text className="text-gray-800 text-lg">←</Text>
                </TouchableOpacity>
                <Text className="text-blue-500 text-sm font-semibold mb-2 tracking-wide">GET STARTED</Text>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Create your account</Text>
                <Text className="text-base text-gray-500">Fill in your details to get started</Text>
              </View>

              <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm">
                <ProfileStrengthMeter name={name} bio={bio} compact />
              </View>

              <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
              
                {authError && (
                  <View className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                    <View className="flex-row items-start gap-3">
                      <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center mt-0.5">
                        <Text className="text-white text-xs font-bold">!</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-red-800 font-semibold text-sm mb-1">Signup failed</Text>
                        <Text className="text-red-600 text-sm">{authError.message}</Text>
                      </View>
                    </View>
                  </View>
                )}

                
                <View className="gap-5 mb-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    error={fieldErrors.name || null}
                    showClear
                    editable={!isLoading}
                  />

                  <Input
                    label="Bio (optional)"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={3}
                    placeholder="Tell us about yourself..."
                    error={fieldErrors.bio || null}
                    editable={!isLoading}
                  />

                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="name@example.com"
                    error={fieldErrors.email || null}
                    showClear
                    editable={!isLoading}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="At least 8 characters"
                    error={fieldErrors.password || null}
                    editable={!isLoading}
                  />

                  <Input
                    label="Confirm Password"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    placeholder="Re-enter password"
                    error={fieldErrors.confirm || null}
                    editable={!isLoading}
                  />
                </View>

                <Button
                  title={isLoading ? "Creating account..." : "Create account"}
                  onPress={handleSignup}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  size="lg"
                />
              </View>

              <View className="flex-row justify-center items-center py-2">
                <Text className="text-gray-500 text-sm">Already have an account? </Text>
                <Text
                  className="text-blue-500 font-semibold text-sm"
                  onPress={() => !isLoading && navigation.navigate("Login")}
                >
                  Sign in
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
