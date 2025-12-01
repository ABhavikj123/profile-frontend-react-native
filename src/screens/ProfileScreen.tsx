import { useEffect } from "react"
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, SafeAreaView } from "react-native"
import { useProfile } from "../hooks/useProfile"
import Button from "../components/Button"
import { useNavigation } from "@react-navigation/native"
import type { AppStackParamList } from "../navigation/AppNavigator"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import ProfileStrengthMeter from "../components/ProfileStrengthMeter"

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()

  const { profile, isLoading, isRefreshing, error, fetchProfile, refreshProfile, clearProfileError } = useProfile()

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleRefresh = async () => {
    try {
      await refreshProfile()
    } catch {}
  }

  const goToEdit = () => {
    navigation.navigate("EditProfile")
  }

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 rounded-2xl bg-blue-500 items-center justify-center mb-4">
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
          <Text className="text-slate-500 text-base">Loading your profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-4">
            <Text className="text-red-500 text-2xl">!</Text>
          </View>
          <Text className="text-slate-800 font-semibold text-lg mb-2 text-center">Unable to load profile</Text>
          <Text className="text-slate-500 text-base text-center mb-6">{error.message}</Text>
          <View className="flex-row gap-3">
            <Button title="Try again" onPress={() => fetchProfile(true)} variant="primary" fullWidth={false} />
            <Button title="Dismiss" onPress={clearProfileError} variant="outline" fullWidth={false} />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center px-4 sm:px-6">
          <View className="w-full max-w-lg">
           
            {error && profile && (
              <View className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex-row items-start gap-3">
                <Text className="text-amber-500 text-sm">⚠</Text>
                <View className="flex-1">
                  <Text className="text-amber-800 text-sm">{error.message}</Text>
                  <Text className="text-amber-600 text-xs font-semibold mt-1" onPress={clearProfileError}>
                    Dismiss
                  </Text>
                </View>
              </View>
            )}

            <View className="bg-white rounded-2xl p-6 sm:p-8 mb-5 items-center border border-slate-200 shadow-sm">
              <View className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-4 shadow-lg">
                <Text className="text-white text-2xl sm:text-3xl font-bold">
                  {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
              <Text className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                {profile?.name || "Your Profile"}
              </Text>
              <Text className="text-sm text-slate-500 mb-4">{profile?.email}</Text>

              {profile?.is_active !== undefined && (
                <View
                  className={`px-4 py-1.5 rounded-full ${profile.is_active ? "bg-emerald-50 border border-emerald-200" : "bg-slate-100 border border-slate-200"}`}
                >
                  <Text
                    className={`text-xs font-semibold ${profile.is_active ? "text-emerald-600" : "text-slate-500"}`}
                  >
                    {profile.is_active ? "● Active" : "● Inactive"}
                  </Text>
                </View>
              )}
            </View>

            <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-200 shadow-sm">
              <ProfileStrengthMeter name={profile?.name} bio={profile?.bio ?? undefined} />
            </View>

            <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-200 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bio</Text>
                {!profile?.bio?.trim() && (
                  <View className="px-2.5 py-1 bg-amber-50 rounded-md border border-amber-200">
                    <Text className="text-[11px] font-semibold text-amber-600">Add bio to improve profile</Text>
                  </View>
                )}
              </View>
              <Text className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {profile?.bio?.trim() || "No bio provided yet. Add one to help others know you better."}
              </Text>
            </View>

            {profile?.created_at && (
              <View className="bg-white rounded-2xl p-5 mb-6 border border-slate-200 shadow-sm">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Member Since</Text>
                <Text className="text-sm sm:text-base text-slate-700">
                  {new Date(profile.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}

            <Button title="Edit Profile" onPress={goToEdit} variant="primary" size="lg" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
