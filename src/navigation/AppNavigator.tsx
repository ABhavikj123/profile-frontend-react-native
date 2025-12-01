
import type React from "react"
import { useCallback } from "react"
import { Platform, View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ProfileScreen from "../screens/ProfileScreen"
import EditProfileScreen from "../screens/EditProfileScreen"
import { useAuth } from "../hooks/useAuth"
import { useProfile } from "../hooks/useProfile"


export type AppStackParamList = {
  Profile: undefined
  EditProfile: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export default function AppNavigator(): React.ReactElement {
  const { logout, user, isLoading: authIsLoading } = useAuth()
  const { clearProfileData } = useProfile()

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      clearProfileData()
    } catch (err) {
      if (__DEV__) {
        console.error("[AppNavigator] Logout error:", err)
      }
    }
  }, [logout, clearProfileData])

  const ProfileHeaderLeft = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginLeft: Platform.OS === "web" ? 16 : 4,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: "#3B82F6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: 11, fontWeight: "500", color: "#94A3B8", letterSpacing: 0.3 }}>Welcome back</Text>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#1E293B" }}>{user?.name?.split(" ")[0] || "User"}</Text>
      </View>
    </View>
  )

  const ProfileHeaderRight = () =>
    authIsLoading ? (
      <View style={{ marginRight: Platform.OS === "web" ? 16 : 4 }}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    ) : (
      <TouchableOpacity
        onPress={handleLogout}
        disabled={authIsLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 8,
          marginRight: Platform.OS === "web" ? 16 : 4,
          borderRadius: 10,
          backgroundColor: "#FEF2F2",
          borderWidth: 1,
          borderColor: "#FECACA",
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#DC2626" }}>Sign Out</Text>
      </TouchableOpacity>
    )

  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerBackVisible: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F8FAFC" },
        headerTintColor: "#3B82F6",
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: () => null,
          headerLeft: ProfileHeaderLeft,
          headerRight: ProfileHeaderRight,
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
          presentation: "card",
          headerBackVisible: true,
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "600",
            color: "#1E293B",
          },
        }}
      />
    </Stack.Navigator>
  )
}
