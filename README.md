```markdown
# Communication Cards (Expo Prototype)

Minimal Expo-managed React Native + TypeScript prototype for creating, editing, and deleting communication cards and groups.

Features
- Create/Edit/Delete communication cards
- Create/Edit/Delete groups
- Assign cards to multiple groups
- Optional image attachment stored as the URI returned by expo-image-picker (no file copying)
- Local-only persistence with AsyncStorage (single key)
- Export / Import JSON via native share & paste/clipboard
- No accounts, no network sync, no analytics

Important constraints
- Exact libraries used: expo, @react-navigation/native, @react-navigation/native-stack, @react-native-async-storage/async-storage, expo-image-picker, uuid, @react-native-clipboard/clipboard
- State management: React Context + useReducer
- Persistence key: `communication_cards_v1`
- Debounce persistence: 300ms
- Load once on startup; in-memory state is single source of truth
- Confirmations before destructive actions
- Title required when saving a card

Getting started (local development)
1. Install Expo CLI (if needed):
   ```bash
   npm install -g expo-cli
   ```

2. Initialize project (if you haven't already):
   ```bash
   expo init communication-cards --template expo-template-blank-typescript
   cd communication-cards
   ```

3. Install dependencies (exact commands):
   ```bash
   npm install @react-navigation/native @react-navigation/native-stack
   npm install @react-native-async-storage/async-storage uuid
   expo install react-native-gesture-handler react-native-safe-area-context expo-image-picker
   npm install @react-native-clipboard/clipboard
   ```

4. Copy the `src/` folder files included in this PR into the project.

5. Start the app:
   ```bash
   expo start
   ```
   Open in simulator or device via QR.

Manual acceptance checklist
- App launches and displays Home with "All" selected.
- Create a group and see it in Groups and the Home selector.
- Create a card (title required) and see it in Home.
- Edit a card; changes appear immediately.
- Delete a card with confirmation.
- Assign a card to multiple groups and filter Home by group.
- Data persists across app restarts.
- Export opens native share sheet with valid JSON.
- Import valid exported JSON (Replace) overwrites data after confirmation.
- Deleting a group removes it and strips its id from cards.

Notes
- AsyncStorage errors on load fall back to empty state and show a non-blocking message on Home: “Failed to load local data — starting fresh”.
- Images stored exactly as URIs returned by expo-image-picker.
- CI is intentionally omitted per spec. If you want CI added later, confirm and specify which checks you want.
```