#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./android-build-local.sh        # incremental build (no Gradle clean)
#   ./android-build-local.sh -c     # clean build (runs Gradle clean)

CLEAN_BUILD=false

if [[ "${1-}" == "-c" ]]; then
  CLEAN_BUILD=true
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$APP_ROOT"

echo "🔧 Running Expo prebuild for Android (sync native project)..."
npx expo prebuild --platform android --non-interactive

echo "🚀 Building Android release (APK + AAB)..."
cd android

if [[ "$CLEAN_BUILD" == true ]]; then
  echo "🧹 Running Gradle clean (clean build)..."
  ./gradlew clean
fi

./gradlew assembleRelease
./gradlew bundleRelease

APK_PATH="app/build/outputs/apk/release/app-release.apk"
AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

BUILDS_DIR="$APP_ROOT/builds"
mkdir -p "$BUILDS_DIR"
cp "$APK_PATH" "$BUILDS_DIR/app-release.apk"
cp "$AAB_PATH" "$BUILDS_DIR/app-release.aab"

echo ""
echo "✅ Android release build finished."
echo "   APK (for emulator / direct install): ${APK_PATH}"
echo "   AAB (Play Store upload):            ${AAB_PATH}"
echo "   Copies in festo-mobile/builds/:     app-release.apk, app-release.aab"

