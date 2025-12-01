# Full-Stack Profile App — Frontend (Expo + React Native + Web)

A production-grade authentication & profile management system built using **Expo**, **React Native**, **React Native Web**, **Zustand**, **React Query**, **Axios**, and **NativeWind** (Tailwind CSS).

**One codebase for Web, Android, and iOS** with secure JWT authentication, automatic token refresh, and a modern, maintainable architecture.

---

## 🚀 Features

### ✅ Authentication
- **Login & Signup screens** with form validation
- **Secure token handling** (access + refresh tokens)
- **Zustand global auth store** for state management
- **Auto-switch navigation** between `AuthNavigator` and `AppNavigator` based on token state
- **Persistent login** using SecureStore (mobile) & localStorage (web)

### ✅ Profile Management
- **Fetch profile** on app load
- **Edit profile** (name + bio)
- **Real-time Profile Strength Meter** with dynamic scoring
- **React Query** for caching + automatic revalidation

### ✅ API Layer
- **Axios client** with advanced features:
  - Auth header injection
  - Auto refresh on 401 Unauthorized
  - Queue-safe refresh handling
  - Retry original request after successful refresh
- **Full error handling** and loading states

### ✅ UI/UX
- Built with **NativeWind** (Tailwind CSS for React Native)
- **Reusable components**: `Input`, `Button`, `ProfileStrengthMeter`
- **Accessible and responsive** (works seamlessly on web and mobile)
- **Consistent design system** with shared theme tokens

---

## 📦 Project Structure

```
src/
├── api/
│   ├── axiosClient.ts      # Axios instance + interceptors + auto refresh
│   ├── auth.ts             # Auth API calls (login, signup, refresh, logout)
│   └── profile.ts          # Profile API calls (get, update)
├── components/
│   ├── Input.tsx           # Reusable text input component
│   ├── Button.tsx          # Reusable button component
│   └── ProfileStrengthMeter.tsx  # Dynamic profile strength indicator
├── hooks/
│   └── useAuth.ts          # Login, logout, session bootstrap logic
├── navigation/
│   ├── AppNavigator.tsx    # Authenticated routes (Profile, Edit Profile)
│   └── AuthNavigator.tsx   # Unauthenticated routes (Login, Signup)
├── screens/
│   ├── LoginScreen.tsx     # Login form
│   ├── SignupScreen.tsx    # Signup form
│   ├── ProfileScreen.tsx   # View user profile
│   └── EditProfileScreen.tsx  # Edit profile form with strength meter
├── store/
│   └── authStore.ts        # Zustand global auth state
├── styles/
│   └── theme.ts            # Shared design tokens (colors, spacing)
├── utils/
│   ├── tokenStorage.ts     # Secure cross-platform token storage
│   └── validators.ts       # Input validation utilities
├── App.tsx                 # Root component, switches navigators
└── global.css              # Tailwind CSS initialization
```

---

## 🛠️ Installation

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Expo CLI** (optional, but recommended)
- **iOS Simulator** (macOS only) or **Android Studio** for mobile development

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd profile-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoint**
   
   Update the API base URL in `src/api/axiosClient.ts`:
   ```typescript
   const API_BASE_URL = "http://YOUR_BACKEND_URL/api";
   ```

---

## 🧪 Running the App

### Start the Expo development server

```bash
npx expo start
```

### Platform-specific commands

Once the development server is running:

#### 🌐 Web
Press `w` or run:
```bash
npx expo start --web
```
Runs at: [http://localhost:8081](http://localhost:8081)

#### 📱 Android
Press `a` or run:
```bash
npx expo start --android
```
*Requires Android Studio and an emulator or physical device*

#### 🍏 iOS
Press `i` or run:
```bash
npx expo start --ios
```
*Requires Xcode (macOS only) and a simulator or physical device*

---

## 🔐 Authentication Flow

### Login Process

1. **User logs in** → Backend returns `accessToken` + `refreshToken`
2. **Tokens are stored securely**:
   - **Mobile**: SecureStore (iOS/Android encrypted storage)
   - **Web**: localStorage
3. **Zustand store is updated** with tokens and user state
4. **App.tsx reacts** to updated store state and switches to `AppNavigator`

### Token Storage Architecture

```typescript
// Mobile (iOS/Android)
import * as SecureStore from 'expo-secure-store';

// Web
localStorage.setItem('accessToken', token);
```

The `tokenStorage.ts` utility provides a unified API across platforms.

---

## 🔄 Automatic Token Refresh

### How it works

When any API call fails with **401 Unauthorized**:

1. **Axios interceptor** detects the error
2. **Checks** if a refresh is already in progress (prevents race conditions)
3. If not in progress → **Calls `/auth/refresh`** endpoint
4. **On success**:
   - Saves new access and refresh tokens
   - Updates Zustand store
   - Retries the original failed request automatically
5. **If refresh fails** → Triggers logout and redirects to login

### Benefits

- ✅ Seamless session continuity
- ✅ No manual token refresh needed
- ✅ Prevents duplicate refresh requests
- ✅ User never sees "session expired" errors unnecessarily

### Implementation

```typescript
// In axiosClient.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
      // Trigger refresh and retry
    }
  }
);
```

---

## 🧩 Profile Strength Meter

The **Profile Strength Meter** dynamically evaluates profile completeness with real-time feedback.

### Scoring Criteria

| Criteria | Points | Description |
|----------|--------|-------------|
| **Name Completeness** | 0-25 | Full name (first + last) scores highest |
| **Bio Length** | 0-30 | Longer bios score better (up to 200 chars) |
| **Bio Quality** | 0-30 | Keywords, sentences, and depth analysis |
| **Completion Bonus** | 0-15 | Bonus for filling all fields completely |

**Total Score**: 0–100

### Visual Feedback

| Score Range | Color | Label |
|-------------|-------|-------|
| 0-39 | 🔴 Red | Weak |
| 40-69 | 🟡 Amber | Good |
| 70-100 | 🟢 Green | Excellent |

### Features

- ✅ **Animated progress bar**
- ✅ **Real-time updates** as user types
- ✅ **Helpful suggestions** for improvement
- ✅ **Accessible** with proper ARIA labels

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Expo SDK 51+** | Cross-platform development framework |
| **React Native** | Mobile UI framework |
| **React Native Web** | Web support from React Native code |
| **TypeScript** | Type safety and better DX |
| **NativeWind** | Tailwind CSS for React Native |
| **Zustand** | Lightweight state management |
| **React Query** | Server state management & caching |
| **Axios** | HTTP client with interceptors |
| **SecureStore** | Encrypted storage for mobile |
| **React Navigation** | Native navigation |

---

## 🔑 Environment Configuration

### Development

Create a `.env` file (optional, for web builds):

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

### Production

Update the API base URL for your production backend:

```typescript
// src/api/axiosClient.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.yourapp.com/api";
```

---

## 🧼 Code Quality & Architecture

This project follows industry best practices:

### ✔ Clean Architecture

```
UI Layer (Screens)
    ↓
Hooks Layer (useAuth, useProfile)
    ↓
State Layer (Zustand Stores)
    ↓
API Layer (Axios Client)
    ↓
Backend
```

### ✔ Separation of Concerns

- **Screens** focus only on UI rendering
- **Hooks** contain business logic
- **Stores** manage global state
- **API layer** encapsulates all HTTP communication
- **Components** are reusable and composable

### ✔ Maintainability

- ✅ **Shared theme** for consistent design
- ✅ **Reusable components** with props interfaces
- ✅ **Strong typing** everywhere with TypeScript
- ✅ **Easy to extend** (add more screens, fields, roles, etc.)
- ✅ **Modular structure** for easy navigation

### ✔ Type Safety

```typescript
// Example: Typed API responses
interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
```

---

## 📱 Platform-Specific Features

### iOS
- Face ID / Touch ID integration (via SecureStore)
- Native keyboard avoiding behavior
- Safe area handling

### Android
- Biometric authentication support
- Back button handling
- Status bar theming

### Web
- Responsive design
- SEO-friendly metadata
- Progressive Web App (PWA) ready

---

## 🧪 Testing

### Run tests

```bash
npm test
# or
yarn test
```

### Test coverage

```bash
npm run test:coverage
```

### Testing utilities included

- Jest for unit testing
- React Native Testing Library
- Mock Axios responses
- Mock SecureStore

---

## 🚀 Building for Production

### Android APK

```bash
npx expo build:android
```

### iOS IPA

```bash
npx expo build:ios
```

### Web Build

```bash
npx expo export:web
```

Output will be in the `web-build/` directory, ready to deploy to any static hosting service.

---

## 📝 API Integration

This frontend expects the following endpoints from your backend:

### Auth Endpoints

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| POST | `/api/auth/signup` | `{ name, email, password }` | `{ id, name, email, ... }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token, refresh_token }` |
| POST | `/api/auth/refresh` | N/A (uses refresh token) | `{ access_token, refresh_token }` |
| POST | `/api/auth/logout` | N/A | `{ message }` |

### Profile Endpoints

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| GET | `/api/profile/me` | N/A | `{ id, name, email, bio, ... }` |
| PUT | `/api/profile/me` | `{ name?, bio? }` | `{ id, name, email, bio, ... }` |

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write TypeScript (no `any` types)
- Add tests for new features
- Update documentation as needed
- Keep components small and focused

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Unable to resolve module"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

**Issue**: Tokens not persisting
- Check SecureStore permissions on mobile
- Verify localStorage is enabled in browser

**Issue**: API connection failed
- Verify backend is running
- Check API_BASE_URL configuration
- Ensure CORS is configured on backend

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


