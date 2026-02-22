// profile.tsx (NOUVELLE VERSION MODERNE)
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../styles/theme";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../providers/AuthProvider";
import BottomNavigation from "../components/BottomNavigation";
import ProfileEditSheet from "../components/ProfileEditSheet";
import SimpleBottomSheet from "../components/BottomSheet";
import Icon from "../components/Icon";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);

  const pickImage = async (type: "profile" | "cover") => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      updateUser({
        ...(type === "profile"
          ? { photoProfil: res.assets[0].uri }
          : { photoCouverture: res.assets[0].uri }),
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <Icon name="person-circle-outline" size={80} color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 20, fontFamily: typography.bold, marginTop: 20 }}>
          Connexion requise
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: 30,
            borderRadius: radius.pill,
          }}
        >
          <Text style={{ color: "#fff", fontFamily: typography.semiBold, fontSize: 16 }}>Se connecter</Text>
        </TouchableOpacity>
        <BottomNavigation currentRoute="profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* COVER */}
        <View style={{ height: 200, width: "100%", position: "relative" }}>
          {user.photoCouverture ? (
            <Image source={{ uri: user.photoCouverture }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View style={{ width: "100%", height: "100%", backgroundColor: colors.card, justifyContent: "center", alignItems: "center" }}>
              <Icon name="image-outline" size={40} color={colors.textLight} />
            </View>
          )}

          <TouchableOpacity
            style={{
              position: "absolute",
              top: 22,
              right: 18,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 8,
              borderRadius: 20,
            }}
            onPress={() => pickImage("cover")}
          >
            <Icon name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PROFILE BLOCK */}
        <View style={{ alignItems: "center", marginTop: -50 }}>
          <TouchableOpacity onPress={() => pickImage("profile")}>
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 60,
                borderWidth: 4,
                borderColor: colors.background,
                overflow: "hidden",
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {user.photoProfil ? (
                <Image source={{ uri: user.photoProfil }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Text style={{ color: "#fff", fontSize: 38, fontFamily: typography.bold }}>
                  {user.nom.charAt(0)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={{ marginTop: 12, color: colors.text, fontFamily: typography.bold, fontSize: 26 }}>{user.nom}</Text>

          <Text style={{ marginTop: 4, color: colors.textLight, fontFamily: typography.regular, textAlign: "center", paddingHorizontal: 20 }}>
            {user.bio || "Aucune bio pour le moment"}
          </Text>
        </View>

        {/* COMPONENTS INFOS (email / tel / ville) */}
        <View style={{ marginTop: 30, paddingHorizontal: spacing.lg }}>
          {[
            { icon: "mail", label: "Email", value: user.email },
            { icon: "call", label: "Téléphone", value: user.telephone },
            { icon: "location", label: "Ville", value: "Lubumbashi - RDC" },
          ].map((item, i) => (
            <View key={i} style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Icon name={item.icon} size={20} color={colors.primary} />
                <Text style={{ color: colors.text, fontFamily: typography.semiBold, marginLeft: 10 }}>
                  {item.label}
                </Text>
              </View>
              <Text style={{ marginLeft: 30, color: colors.textLight }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* BUTTONS */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: 30 }}>
          {user.role === "admin" ? (
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                paddingVertical: 14,
                borderRadius: radius.pill,
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={() => router.push("/admin")}
            >
              <Text style={{ color: colors.text, fontFamily: typography.semiBold, fontSize: 16 }}>
                Ouvrir le panel admin
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: radius.pill,
              alignItems: "center",
              marginBottom: 10,
            }}
            onPress={() => setIsEditSheetVisible(true)}
          >
            <Text style={{ color: "#fff", fontFamily: typography.semiBold, fontSize: 16 }}>Modifier le profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderColor: colors.primary,
              borderWidth: 2,
              paddingVertical: 14,
              borderRadius: radius.pill,
              alignItems: "center",
            }}
            onPress={logout}
          >
            <Text style={{ color: colors.primary, fontFamily: typography.semiBold, fontSize: 16 }}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <BottomNavigation currentRoute="profile" />

      {/* EDIT SHEET */}
      <SimpleBottomSheet isVisible={isEditSheetVisible} onClose={() => setIsEditSheetVisible(false)}>
        <ProfileEditSheet user={user} onUpdate={updateUser} onClose={() => setIsEditSheetVisible(false)} />
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
