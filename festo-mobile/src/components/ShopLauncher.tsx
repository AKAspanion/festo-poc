import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
  StyleSheet,
  ToastAndroid,
  Alert,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { logger } from "../utils/logger";

WebBrowser.maybeCompleteAuthSession();

export const ShopLauncher: React.FC = () => {
  const [shopToken, setShopToken] = React.useState("123");
  const [isOpeningShop, setIsOpeningShop] = React.useState(false);

  const showToast = (message: string) => {
    if (!message) {
      return;
    }

    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }

    Alert.alert("Shop", message);
  };

  const shopReturnUrl = AuthSession.makeRedirectUri({
    scheme: "festo-mobile",
    path: "shop-complete",
  });

  const shopBaseUrl =
    process.env.EXPO_PUBLIC_SHOP_BASE_URL ||
    (Platform.OS === "android"
      ? "http://192.168.1.14:8081"
      : "http://localhost:8081");

  const buildShopAuthUrl = () => {
    const token = shopToken.trim() || "123";
    return `${shopBaseUrl}/shop?token=${encodeURIComponent(token)}`;
  };

  const currentShopUrl = buildShopAuthUrl();

  const handleOpenShop = async () => {
    try {
      setIsOpeningShop(true);
      const shopUrl = buildShopAuthUrl();
      logger.info("ShopLauncher", "Open shop button pressed", {
        url: shopUrl,
      });

      const result = (await WebBrowser.openAuthSessionAsync(
        shopUrl,
        shopReturnUrl,
      )) as WebBrowser.WebBrowserAuthSessionResult;

      logger.info("ShopLauncher", "Shop auth session result", {
        type: result.type,
        url: "url" in result ? (result.url ?? null) : null,
      });

      if (result.type === "success" && "url" in result && result.url) {
        try {
          const parsedUrl = new URL(result.url);
          const status = parsedUrl.searchParams.get("status");
          const message = parsedUrl.searchParams.get("message");
          const orderId = parsedUrl.searchParams.get("orderId");

          logger.info("ShopLauncher", "Parsed shop result", {
            status,
            hasMessage: Boolean(message),
            orderId,
          });

          if (status === "success") {
            const successText = orderId
              ? `Shop completed successfully. Order ID: ${orderId}`
              : "Shop completed successfully.";
            showToast(successText);
          } else if (status === "error") {
            showToast(message || "Shop failed. Please try again.");
          } else {
            showToast("Shop flow completed.");
          }
        } catch (parseError) {
          logger.error("ShopLauncher", "Failed to parse shop result URL", {
            error: String(parseError),
          });
          showToast("Shop completed, but response could not be read.");
        }
      } else if (result.type === "dismiss") {
        showToast("Shop flow cancelled.");
      }
    } catch (error) {
      logger.error("ShopLauncher", "Failed to open shop URL", {
        error: String(error),
      });
      showToast("Could not open shop. Please try again.");
    } finally {
      setIsOpeningShop(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.shopTokenContainer}>
        <Text style={styles.shopTokenLabel}>Shop token</Text>
        <TextInput
          style={styles.shopTokenInput}
          value={shopToken}
          onChangeText={setShopToken}
          placeholder="Enter shop token"
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.shopUrlContainer}>
        <Text style={styles.shopUrlLabel}>Shop URL</Text>
        <Text style={styles.shopUrlValue}>
          {currentShopUrl}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.shopButton, isOpeningShop && styles.shopButtonDisabled]}
        onPress={handleOpenShop}
        disabled={isOpeningShop}
      >
        {isOpeningShop ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.shopButtonText}>Open Shop</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  shopUrlContainer: {
    width: "100%",
    marginBottom: 16,
  },
  shopUrlLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontWeight: "500",
  },
  shopUrlValue: {
    fontSize: 12,
    color: "#555",
  },
  shopButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  shopButtonDisabled: {
    opacity: 0.7,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  shopTokenContainer: {
    width: "100%",
    marginBottom: 16,
  },
  shopTokenLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  shopTokenInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
    minHeight: 80,
  },
});
