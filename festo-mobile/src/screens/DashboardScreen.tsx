import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../context/useAuth";
import { logger } from "../utils/logger";

export const DashboardScreen: React.FC = () => {
  const auth = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      logger.info("DashboardScreen", "Logout button pressed");
      await auth.logout();
    } catch (error) {
      logger.error("DashboardScreen", "Logout failed", {
        error: String(error),
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (auth.state.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const user = auth.state.user;
  const primaryEmail =
    user?.email ||
    user?.emails?.find((emailItem) => emailItem.primary)?.value ||
    user?.emails?.[0]?.value ||
    "Not provided";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome!</Text>
        <Text style={styles.headerSubtitle}>Your Profile</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        {/* Profile Picture */}
        {user?.picture && (
          <Image
            source={{ uri: user.picture }}
            style={styles.profileImage}
            onError={() => console.warn("Failed to load profile image")}
          />
        )}
        {!user?.picture && (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>
              {(user?.givenName?.[0] || user?.name?.[0] || "U").toUpperCase()}
            </Text>
          </View>
        )}

        {/* User Details */}
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{user?.name || "Not provided"}</Text>
          </View>

          {user?.givenName && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>First Name</Text>
              <Text style={styles.value}>{user.givenName}</Text>
            </View>
          )}

          {user?.familyName && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Last Name</Text>
              <Text style={styles.value}>{user.familyName}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{primaryEmail}</Text>
          </View>

          {user?.locale && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Locale</Text>
              <Text style={styles.value}>{user.locale}</Text>
            </View>
          )}

          {user?.id && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>User ID</Text>
              <Text style={[styles.value, styles.userId]}>
                {user.id.substring(0, 20)}...
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Additional Info */}
      {(user?.phoneNumbers || user?.addresses) && (
        <View style={styles.additionalInfoCard}>
          <Text style={styles.cardTitle}>Additional Information</Text>

          {user?.phoneNumbers && user.phoneNumbers.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Phone Numbers</Text>
              {user.phoneNumbers.map((phone, index) => (
                <Text key={index} style={styles.infoText}>
                  {phone.type && `${phone.type}: `}
                  {phone.value}
                </Text>
              ))}
            </View>
          )}

          {user?.addresses && user.addresses.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Addresses</Text>
              {user.addresses.map((address, index) => (
                <View key={index}>
                  {address.streetAddress && (
                    <Text style={styles.infoText}>{address.streetAddress}</Text>
                  )}
                  <Text style={styles.infoText}>
                    {address.locality && `${address.locality}, `}
                    {address.region && `${address.region} `}
                    {address.postalCode && address.postalCode}
                  </Text>
                  {address.country && (
                    <Text style={styles.infoText}>{address.country}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          isLoggingOut && styles.logoutButtonDisabled,
        ]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secured with PingOne Authentication
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  userDetails: {
    width: "100%",
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  userId: {
    fontFamily: "Courier New",
    fontSize: 12,
  },
  additionalInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
