# Communication Cards

An Expo-managed React Native TypeScript app for managing communication cards with groups, favorites, and import/export functionality.

## Features

- **Cards**: Create, edit, and delete communication cards with title, optional text, and optional image
- **Groups**: Organize cards into multiple groups with optional color coding
- **Favorites**: Mark cards as favorites for quick access
- **Search**: Filter cards by title and text content
- **Filtering**: Filter cards by group or favorites
- **Image Support**: Attach images to cards using expo-image-picker
- **Data Persistence**: All data is automatically saved to AsyncStorage
- **Export/Import**: Export all data as JSON and import from text or clipboard
- **Reset**: Complete data reset with strong confirmation

## Persistence

- **Storage Key**: `communication_cards_v1`
- **Debounce**: Data is persisted 300ms after any state change to optimize performance
- **Error Handling**: If loading fails, the app starts with empty data and displays a non-blocking warning banner

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator, Android Emulator, or Expo Go app

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd papu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to open on iOS Simulator
- Press `a` to open on Android Emulator
- Scan the QR code with Expo Go on your device
- Press `w` to open in a web browser

### Other Commands

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type check the codebase
npm run typecheck
```

## Project Structure

```
src/
├── App.tsx                    # Main app bootstrap
├── models/
│   └── types.ts               # TypeScript interfaces (Card, Group, AppData)
├── storage/
│   └── storage.ts             # AsyncStorage operations
├── hooks/
│   └── useDebouncedEffect.ts  # Debounced effect hook
├── utils/
│   └── format.ts              # Formatting utilities
├── contexts/
│   └── AppDataContext.tsx     # State management with reducer
├── navigation/
│   └── index.tsx              # React Navigation stack
├── components/
│   ├── FAB.tsx                # Floating action button
│   ├── GroupPill.tsx          # Group selector chip
│   └── CardRow.tsx            # Card list item
└── screens/
    ├── HomeScreen.tsx         # Main card list screen
    ├── CardEditScreen.tsx     # Create/edit card screen
    ├── GroupsScreen.tsx       # Group management screen
    └── SettingsScreen.tsx     # Export/import/reset screen
```

## Dependencies

### Runtime Dependencies

- `expo` - Expo SDK
- `react` / `react-native` - React Native framework
- `@react-native-async-storage/async-storage` - Persistent storage
- `@react-navigation/native` / `@react-navigation/native-stack` - Navigation
- `react-native-safe-area-context` / `react-native-screens` - Navigation helpers
- `expo-image-picker` - Image selection
- `expo-clipboard` - Clipboard access for import
- `expo-status-bar` - Status bar management
- `uuid` - UUID generation for entity IDs

### Dev Dependencies

- `typescript` - TypeScript compiler
- `@types/react` / `@types/uuid` - TypeScript definitions

## Acceptance Checklist

- [ ] Cards can be created with title (required), text (optional), and image (optional)
- [ ] Cards can be edited and deleted with confirmation
- [ ] Cards can be marked as favorites
- [ ] Groups can be created with name (required) and color (optional hex)
- [ ] Groups can be edited (name) and deleted with confirmation
- [ ] Deleting a group removes its ID from all associated cards
- [ ] Cards can be assigned to multiple groups
- [ ] Home screen shows cards sorted by updatedAt (newest first)
- [ ] Home screen supports filtering by group and favorites
- [ ] Home screen supports search by title and text
- [ ] Long-press on card shows action sheet with Toggle Favorite and Delete
- [ ] Data persists across app restarts
- [ ] Export shares data as JSON
- [ ] Import from text or clipboard with Merge and Replace options
- [ ] Reset requires typing "RESET" and confirmation
- [ ] Loading state shown during initial data load
- [ ] Error banner shown if loading fails
- [ ] All touch targets are at least 44x44 points
- [ ] All actionable elements have accessibility labels

## Notes

- CI/GitHub Actions are intentionally omitted per specification
- Images are stored as URIs from expo-image-picker (not copied to app storage)
- The app uses functional components and hooks exclusively
