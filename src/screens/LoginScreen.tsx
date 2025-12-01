import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, Platform, ScrollView, SafeAreaView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Input from "../components/Input"
import Button from "../components/Button"
import { useAuth } from "../hooks/useAuth"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AuthStackParamList } from "../navigation/AuthNavigator"
import { validateEmail, validatePassword } from "../utils/validators"

export default function LoginScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { login, error: authError, isLoading, clearError } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    setFieldErrors({})
  }, [email, password])

  function validate(): boolean {
    const errs: typeof fieldErrors = {}
    const emailError = validateEmail(email)
    if (emailError) errs.email = emailError
    const passwordError = validatePassword(password)
    if (passwordError) errs.password = passwordError
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogin = async () => {
    clearError()
    if (!validate()) return

    try {
      await login(email.trim(), password)
      if (Platform.OS === "web") {
        window.location.reload()
      }
    } catch {}
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center px-5 py-10">
          <View className="w-full max-w-[420px]">
            <View className="mb-10">
              <Text className="text-blue-500 text-sm font-semibold mb-3 tracking-wide">WELCOME BACK</Text>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Sign in to your{"\n"}account</Text>
              <Text className="text-base text-gray-500">Enter your credentials to continue</Text>
            </View>

            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
              
              {authError && (
                <View className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <View className="flex-row items-start gap-3">
                    <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center mt-0.5">
                      <Text className="text-white text-xs font-bold">!</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-red-800 font-semibold text-sm mb-1">Unable to sign in</Text>
                      <Text className="text-red-600 text-sm">{authError.message}</Text>
                    </View>
                  </View>
                  {!isLoading && (
                    <Text className="text-red-500 text-xs font-semibold mt-3" onPress={() => clearError()}>
                      Dismiss
                    </Text>
                  )}
                </View>
              )}

              <View className="gap-5 mb-6">
                <Input
                  label="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  error={fieldErrors.email ?? null}
                  showClear
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                  error={fieldErrors.password ?? null}
                />
              </View>

              <Button
                title={isLoading ? "Signing in..." : "Sign in"}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="lg"
              />
            </View>

            <View className="flex-row items-center justify-center py-4 px-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-gray-400 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <Button
              title="Create an account"
              onPress={() => !isLoading && navigation.navigate("Signup")}
              variant="outline"
              size="lg"
              disabled={isLoading}
            />

            <View className="mt-8 items-center">
              <Text className="text-xs text-gray-400 text-center leading-5">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
