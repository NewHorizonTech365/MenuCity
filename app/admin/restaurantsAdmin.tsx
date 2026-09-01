// app/admin/restaurantsAdmin.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ScrollView,
  Image,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { useData } from "../../providers/DataProvider";
import { useTheme } from "../../styles/theme";
import Icon from "../../components/Icon";
import * as ImagePicker from "expo-image-picker";
import { areMediaUploadsEnabled, uploadMedia } from "../../lib/api";
import StateView from "../../components/ui/StateView";
import AppHeader from "../../components/ui/AppHeader";
import FadeInImage from "../../components/ui/FadeInImage";
import PressableScale from "../../components/ui/PressableScale";
import SearchField from "../../components/ui/SearchField";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Admin - Restaurants manager (ajout Image Picker)
 *
 * Full CRUD for restaurants + basic menu management inline.
 *
 * File: app/admin/restaurantsAdmin.tsx
 */

export default function RestaurantsAdminScreen() {
  const router = useRouter();
  const { isAuthReady, isDevelopmentSession, user, getAuthToken } = useAuth();
  const {
    restaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reload,
    getRestaurant,
  } = useData();
  const { colors, spacing, radius, typography } = useTheme();

  // SECURITY: redirect non-admins
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user || user.role !== "admin") {
      router.replace("/home");
    }
  }, [isAuthReady, router, user]);

  // UI state
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<null | any>(null); // restaurant being edited (or null)
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isMenuModalVisible, setMenuModalVisible] = useState(false);
  const [menuRestaurant, setMenuRestaurant] = useState<any>(null); // restaurant for which menu is open
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null); // editing menu item
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // animate in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Filtered restaurants
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        (r.nom || "").toLowerCase().includes(q) ||
        (r.cuisine || "").toLowerCase().includes(q) ||
        (r.adresse || "").toLowerCase().includes(q)
    );
  }, [restaurants, query]);

  // ---------- Forms state for restaurant add/edit ----------
  const blankRestaurantForm = {
    nom: "",
    cuisine: "",
    adresse: "",
    telephone: "",
    prixMoyen: "",
    description: "",
    horaires: "",
    image: "",
    logo: "",
    photos: [] as string[],
    menu: [] as any[],
    note: 4.0,
    specialites: [] as string[],
  };
  const [form, setForm] = useState<any>(blankRestaurantForm);

  const isLocalImage = (uri?: string) => Boolean(uri && !/^https?:\/\//i.test(uri));
  const uploadImageUri = async (uri: string, scope: string, ownerId: string) => {
    const extension = uri.split("?")[0].toLowerCase();
    const contentType = extension.endsWith(".png") ? "image/png" as const : extension.endsWith(".webp") ? "image/webp" as const : "image/jpeg" as const;
    const blob = await (await fetch(uri)).blob();
    return uploadMedia(`/v1/uploads/${scope}/${ownerId}`, blob, contentType, getAuthToken);
  };

  const openAddModal = () => {
    setEditing(null);
    setForm(blankRestaurantForm);
    setEditModalVisible(true);
  };

  const openEditModal = (r: any) => {
    // shallow copy and ensure arrays exist
    setEditing(r);
    setForm({
      ...r,
      photos: Array.isArray(r.photos) ? r.photos : [],
      menu: Array.isArray(r.menu) ? r.menu : [],
      specialites: Array.isArray(r.specialites) ? r.specialites : [],
    });
    setEditModalVisible(true);
  };

  const commitSaveRestaurant = async () => {
    // basic validation
    if (!form.nom?.trim()) {
      Alert.alert("Erreur", "Le nom est requis");
      return;
    }
    try {
      let saved;
      if (editing) {
        saved = await updateRestaurant(editing.id, {
          nom: form.nom,
          cuisine: form.cuisine,
          adresse: form.adresse,
          telephone: form.telephone,
          prixMoyen: form.prixMoyen,
          description: form.description,
          horaires: form.horaires,
          image: isLocalImage(form.image) && !isDevelopmentSession ? editing.image : form.image,
          logo: isLocalImage(form.logo) && !isDevelopmentSession ? editing.logo : form.logo,
          photos: form.photos,
          specialites: form.specialites,
          note: form.note,
        });
        Alert.alert("Succès", "Restaurant mis à jour");
      } else {
        saved = await addRestaurant({
          ...form,
          image: isLocalImage(form.image) && !isDevelopmentSession ? "" : form.image,
          logo: isLocalImage(form.logo) && !isDevelopmentSession ? "" : form.logo,
        });
        Alert.alert("Succès", "Restaurant ajouté");
      }
      if (!saved) throw new Error("Restaurant introuvable après enregistrement.");
      if (!isDevelopmentSession) {
        if (isLocalImage(form.image)) await uploadImageUri(form.image, "restaurant-main", saved.id);
        if (isLocalImage(form.logo)) await uploadImageUri(form.logo, "restaurant-logo", saved.id);
        for (const photo of form.photos || []) {
          if (isLocalImage(photo)) await uploadImageUri(photo, "restaurant-photo", saved.id);
        }
      }
      await reload();
      setEditModalVisible(false);
    } catch (e) {
      console.error("save restaurant error", e);
      Alert.alert("Erreur", "Impossible d'enregistrer");
    }
  };

  const handleDeleteRestaurant = (r: any) => {
    Alert.alert(
      "Archiver",
      `Voulez-vous archiver "${r.nom}" ? Son historique sera conservé.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Archiver",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRestaurant(r.id);
              Alert.alert("Archivé", "Restaurant archivé");
            } catch (e) {
              console.error("delete error", e);
              Alert.alert("Erreur", "Suppression impossible");
            }
          },
        },
      ]
    );
  };

  // ---------- Menu management ----------
  const openMenuFor = (r: any) => {
    setMenuRestaurant(r);
    setSelectedMenuItem(null);
    setMenuModalVisible(true);
  };

  const openAddMenuItem = () => {
    setSelectedMenuItem({
      id: null,
      nom: "",
      prix: "",
      description: "",
      photosMenu: [] as string[],
    });
  };

  const openEditMenuItem = (mi: any) => {
    setSelectedMenuItem({ ...mi });
  };

  const saveMenuItem = async () => {
    if (!menuRestaurant || !selectedMenuItem) return;
    try {
      let savedItem;
      if (selectedMenuItem.id) {
        savedItem = await updateMenuItem(menuRestaurant.id, selectedMenuItem.id, {
          nom: selectedMenuItem.nom,
          prix: selectedMenuItem.prix,
          description: selectedMenuItem.description,
          photosMenu: isDevelopmentSession
            ? selectedMenuItem.photosMenu || []
            : (selectedMenuItem.photosMenu || []).filter((photo: string) => !isLocalImage(photo)),
        });
        Alert.alert("Succès", "Plat mis à jour");
      } else {
        savedItem = await addMenuItem(menuRestaurant.id, {
          nom: selectedMenuItem.nom,
          prix: selectedMenuItem.prix,
          description: selectedMenuItem.description,
          photosMenu: isDevelopmentSession
            ? selectedMenuItem.photosMenu || []
            : (selectedMenuItem.photosMenu || []).filter((photo: string) => !isLocalImage(photo)),
        });
        Alert.alert("Succès", "Plat ajouté");
      }
      if (!savedItem) throw new Error("Plat introuvable après enregistrement.");
      if (!isDevelopmentSession) {
        for (const photo of selectedMenuItem.photosMenu || []) {
          if (isLocalImage(photo)) await uploadImageUri(photo, "menu-item-photo", savedItem.id);
        }
      }
      await reload();
      setSelectedMenuItem(null);
      const fresh = await getRestaurant(menuRestaurant.id);
      setMenuRestaurant(fresh || null);
    } catch (e) {
      console.error("save menu item error", e);
      Alert.alert("Erreur", "Impossible d'enregistrer le plat");
    }
  };

  const removeMenuItem = (mi: any) => {
    Alert.alert("Supprimer le plat", `Supprimer "${mi.nom}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuItem(menuRestaurant.id, mi.id);
            const fresh = await getRestaurant(menuRestaurant.id);
            setMenuRestaurant(fresh || null);
            Alert.alert("Supprimé", "Plat supprimé");
          } catch (e) {
            console.error("delete menu error", e);
            Alert.alert("Erreur", "Suppression impossible");
          }
        },
      },
    ]);
  };

  // ---------- Image Picker helpers ----------
  // Demande permission et ouvre la galerie ou la caméra selon `mode`
  const requestPermissionAndPick = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert("Permission refusée", "Autorisez l'accès à la caméra.");
          return null;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
        if (res.canceled || !res.assets?.[0]) return null;
        return res.assets[0].uri;
      } else {
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libPerm.granted) {
          Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
          return null;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
        if (res.canceled || !res.assets?.[0]) return null;
        return res.assets[0].uri;
      }
    } catch (e) {
      console.error("ImagePicker error", e);
      Alert.alert("Erreur", "Impossible de récupérer l'image.");
      return null;
    }
  };

  // Pick for restaurant form: type = 'image' | 'logo' | 'photos' (photos appends)
  const pickImageForForm = async (type: "image" | "logo" | "photos") => {
    if (!areMediaUploadsEnabled && !isDevelopmentSession) {
      Alert.alert(
        "Envoi d’images indisponible",
        "Saisissez une URL HTTPS dans les champs image et logo. Le stockage de fichiers est désactivé pour rester sur les offres gratuites.",
      );
      return;
    }
    Alert.alert(
      "Ajouter une image",
      "Choisissez une source",
      [
        {
          text: "Prendre une photo",
          onPress: async () => {
            const uri = await requestPermissionAndPick(true);
            if (!uri) return;
            if (type === "photos") {
              setForm((f: any) => ({ ...f, photos: [...(f.photos || []), uri] }));
            } else {
              setForm((f: any) => ({ ...f, [type]: uri }));
            }
          },
        },
        {
          text: "Galerie",
          onPress: async () => {
            const uri = await requestPermissionAndPick(false);
            if (!uri) return;
            if (type === "photos") {
              setForm((f: any) => ({ ...f, photos: [...(f.photos || []), uri] }));
            } else {
              setForm((f: any) => ({ ...f, [type]: uri }));
            }
          },
        },
        { text: "Annuler", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // Remove photo from form photos by index
  const removeFormPhotoAt = (index: number) => {
    const next = [...(form.photos || [])];
    next.splice(index, 1);
    setForm({ ...form, photos: next });
  };

  // Pick images for a menu item (append)
  const pickImageForMenuItem = async (useCamera = false) => {
    if (!selectedMenuItem) return;
    if (!areMediaUploadsEnabled && !isDevelopmentSession) {
      Alert.alert(
        "Envoi d’images indisponible",
        "Le stockage de fichiers sera activé plus tard si le projet en a besoin.",
      );
      return;
    }
    const uri = await requestPermissionAndPick(useCamera);
    if (!uri) return;
    setSelectedMenuItem((m: any) => ({ ...m, photosMenu: [...(m.photosMenu || []), uri] }));
  };

  const removeMenuItemPhotoAt = (index: number) => {
    if (!selectedMenuItem) return;
    const next = [...(selectedMenuItem.photosMenu || [])];
    next.splice(index, 1);
    setSelectedMenuItem({ ...selectedMenuItem, photosMenu: next });
  };

  // ---------- Render helpers ----------
  const renderRestaurantCard = ({ item }: { item: any }) => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", backgroundColor: "#eee" }}>
            <FadeInImage accessible={false} source={{ uri: item.logo || item.image || undefined }} style={{ width: "100%", height: "100%" }} />
          </View>

          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={{ fontFamily: typography.semiBold, fontSize: 16, color: colors.text }}>{item.nom}</Text>
            <Text style={{ fontFamily: typography.regular, color: colors.textLight, marginTop: 6 }} numberOfLines={2}>
              {item.cuisine} • {item.prixMoyen || "—"} • {item.horaires || "—"}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <PressableScale accessibilityRole="button" accessibilityLabel={`Modifier ${item.nom}`} haptic="selection" onPress={() => openEditModal(item)} style={{ marginRight: 12 }}>
                <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft }}>
                  <Icon name="pencil" size={16} color={colors.primary} />
                </View>
              </PressableScale>

              <PressableScale accessibilityRole="button" accessibilityLabel={`Gérer le menu de ${item.nom}`} haptic="selection" onPress={() => openMenuFor(item)} style={{ marginRight: 12 }}>
                <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.primarySoft }}>
                  <Icon name="fast-food" size={16} color={colors.primary} />
                </View>
              </PressableScale>

              <PressableScale accessibilityRole="button" accessibilityLabel={`Archiver ${item.nom}`} haptic="selection" onPress={() => handleDeleteRestaurant(item)}>
                <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: '#FEECEC' }}>
                  <Icon name="trash" size={16} color={colors.accent} />
                </View>
              </PressableScale>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (!isAuthReady || !user) {
    return <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}><StateView title="Vérification de l’accès…" loading /></View>;
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: spacing.md, paddingTop: 4 }}>
      <AppHeader title="Gérer les restaurants" subtitle={`${filtered.length} adresse${filtered.length > 1 ? 's' : ''} dans le catalogue`} onBack={() => router.replace("/admin")} />

      <View style={{ marginBottom: spacing.md }}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Nom, cuisine ou adresse" />
      </View>

      {/* list */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={renderRestaurantCard}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 96 }}
        ListEmptyComponent={() => (
          <View style={{ padding: spacing.lg, alignItems: "center" }}>
            <Text style={{ color: colors.textLight }}>Aucun restaurant trouvé.</Text>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Ajouter un restaurant"
        haptic="soft"
        onPress={openAddModal}
        style={{
          position: "absolute",
          right: spacing.lg,
          bottom: spacing.lg + (Platform.OS === "ios" ? 20 : 0),
          backgroundColor: colors.primary,
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
        }}
      >
        <Icon name="add" size={28} color="#fff" />
      </PressableScale>

      {/* ---------- EDIT / ADD RESTAURANT MODAL ---------- */}
      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModalVisible(false)}>
        <SafeEditModal
          title={editing ? "Modifier le restaurant" : "Nouveau restaurant"}
          onClose={() => setEditModalVisible(false)}
        >
          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg }}>
            <FormRow label="Nom">
              <TextInput
                value={form.nom}
                onChangeText={(t) => setForm({ ...form, nom: t })}
                placeholder="Nom du restaurant"
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
              />
            </FormRow>

            <FormRow label="Cuisine">
              <TextInput
                value={form.cuisine}
                onChangeText={(t) => setForm({ ...form, cuisine: t })}
                placeholder="Ex: Congolaise, Fusion"
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
              />
            </FormRow>

            <FormRow label="Adresse">
              <TextInput
                value={form.adresse}
                onChangeText={(t) => setForm({ ...form, adresse: t })}
                placeholder="Adresse"
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
              />
            </FormRow>

            <FormRow label="Téléphone">
              <TextInput
                value={form.telephone}
                onChangeText={(t) => setForm({ ...form, telephone: t })}
                placeholder="+243 ..."
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
                keyboardType="phone-pad"
              />
            </FormRow>

            <FormRow label="Prix moyen">
              <TextInput
                value={form.prixMoyen}
                onChangeText={(t) => setForm({ ...form, prixMoyen: t })}
                placeholder="Ex: 10-20 USD"
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
              />
            </FormRow>

            <FormRow label="Horaires">
              <TextInput
                value={form.horaires}
                onChangeText={(t) => setForm({ ...form, horaires: t })}
                placeholder="Ex: 10h - 22h"
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
              />
            </FormRow>

            {/* IMAGE + LOGO with picker */}
            <FormRow label="Image principale">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput
                  value={form.image}
                  onChangeText={(t) => setForm({ ...form, image: t })}
                  placeholder="https://..."
                  placeholderTextColor={colors.textLight}
                  style={[inputStyle(), { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => pickImageForForm("image")} style={styles.smallBtn(colors, radius)}>
                  <Icon name="image-outline" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </FormRow>

            <FormRow label="Logo">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput
                  value={form.logo}
                  onChangeText={(t) => setForm({ ...form, logo: t })}
                  placeholder="https://..."
                  placeholderTextColor={colors.textLight}
                  style={[inputStyle(), { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => pickImageForForm("logo")} style={styles.smallBtn(colors, radius)}>
                  <Icon name="image-outline" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </FormRow>

            {/* Photos gallery UI */}
            <FormRow label="Photos du restaurant">
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <TouchableOpacity onPress={() => pickImageForForm("photos")} style={{ ...styles.actionBtn(colors, radius), marginRight: 8 }}>
                  <Icon name="image-outline" size={18} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: 8 }}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickImageForForm("photos")} style={styles.actionBtnAlt(colors, radius)}>
                  <Text style={{ color: colors.text }}>Galerie / Appareil</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(form.photos || []).map((p: string, idx: number) => (
                  <View key={idx} style={{ marginRight: spacing.md, position: "relative" }}>
                    <Image source={{ uri: p }} style={{ width: 120, height: 80, borderRadius: 8, backgroundColor: "#eee" }} />
                    <TouchableOpacity
                      onPress={() => removeFormPhotoAt(idx)}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Icon name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {(form.photos || []).length === 0 && (
                  <View style={{ padding: 6 }}>
                    <Text style={{ color: colors.textLight }}>Aucune photo</Text>
                  </View>
                )}
              </ScrollView>
            </FormRow>

            <FormRow label="Spécialités (séparées par , )">
              <TextInput
                value={(form.specialites || []).join(",")}
                onChangeText={(t) => setForm({ ...form, specialites: t.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                placeholder="Fufu, Pondu"
                placeholderTextColor={colors.textLight}
                style={inputStyle()}
              />
            </FormRow>

            <View style={{ height: spacing.lg }} />

            <PressableScale accessibilityRole="button" accessibilityLabel={editing ? "Sauvegarder le restaurant" : "Créer le restaurant"} haptic="soft" onPress={commitSaveRestaurant} style={{ backgroundColor: colors.primary, padding: 14, borderRadius: radius.pill, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: typography.semiBold }}>{editing ? "Sauvegarder" : "Créer"}</Text>
            </PressableScale>

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </SafeEditModal>
      </Modal>

      {/* ---------- MENU MODAL ---------- */}
      <Modal visible={isMenuModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMenuModalVisible(false)}>
        <SafeEditModal title={`Menus — ${menuRestaurant?.nom || ""}`} onClose={() => setMenuModalVisible(false)}>
          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg }}>
            <PressableScale accessibilityRole="button" accessibilityLabel="Ajouter un plat" haptic="soft" onPress={openAddMenuItem} style={{ marginBottom: spacing.md, backgroundColor: colors.primary, padding: 12, borderRadius: radius.pill, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: typography.semiBold }}>Ajouter un plat</Text>
            </PressableScale>

            {/* menu list */}
            {(menuRestaurant?.menu || []).length === 0 ? (
              <View style={{ alignItems: "center", padding: spacing.lg }}>
                <Text style={{ color: colors.textLight }}>Aucun plat défini</Text>
              </View>
            ) : (
              (menuRestaurant.menu || []).map((mi: any) => (
                <View key={mi.id} style={{ backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", backgroundColor: "#eee" }}>
                      <Image source={{ uri: (mi.photosMenu && mi.photosMenu[0]) || mi.image || undefined }} style={{ width: "100%", height: "100%" }} />
                    </View>
                    <View style={{ marginLeft: spacing.md, flex: 1 }}>
                      <Text style={{ fontFamily: typography.semiBold }}>{mi.nom}</Text>
                      <Text style={{ color: colors.textLight }}>{mi.prix}</Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity onPress={() => openEditMenuItem(mi)} style={{ marginRight: 10 }}>
                        <Icon name="pencil" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeMenuItem(mi)}>
                        <Icon name="trash" size={18} color={colors.accent} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}

            {/* menu item editor */}
            {selectedMenuItem && (
              <View style={{ marginTop: spacing.md, backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg }}>
                <Text style={{ fontFamily: typography.semiBold, marginBottom: spacing.sm }}>{selectedMenuItem.id ? "Modifier plat" : "Nouveau plat"}</Text>

                <TextInput
                  placeholder="Nom du plat"
                  value={selectedMenuItem.nom}
                  onChangeText={(t) => setSelectedMenuItem({ ...selectedMenuItem, nom: t })}
                  placeholderTextColor={colors.textLight}
                  style={inputStyle()}
                />
                <TextInput
                  placeholder="Prix"
                  value={selectedMenuItem.prix}
                  onChangeText={(t) => setSelectedMenuItem({ ...selectedMenuItem, prix: t })}
                  placeholderTextColor={colors.textLight}
                  style={inputStyle()}
                />
                <TextInput
                  placeholder="Description"
                  value={selectedMenuItem.description}
                  onChangeText={(t) => setSelectedMenuItem({ ...selectedMenuItem, description: t })}
                  placeholderTextColor={colors.textLight}
                  style={[inputStyle(), { height: 80 }]}
                  multiline
                />

                {/* PhotosMenu picker + thumbnails */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}>
                  <TouchableOpacity onPress={() => pickImageForMenuItem(false)} style={{ ...styles.actionBtn(colors, radius), marginRight: 8 }}>
                    <Icon name="image-outline" size={18} color="#fff" />
                    <Text style={{ color: "#fff", marginLeft: 8 }}>Galerie</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => pickImageForMenuItem(true)} style={styles.actionBtnAlt(colors, radius)}>
                    <Text style={{ color: colors.text }}>Prendre photo</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                  {(selectedMenuItem.photosMenu || []).map((p: string, idx: number) => (
                    <View key={idx} style={{ marginRight: spacing.md, position: "relative" }}>
                      <Image source={{ uri: p }} style={{ width: 100, height: 70, borderRadius: 6, backgroundColor: "#eee" }} />
                      <TouchableOpacity
                        onPress={() => removeMenuItemPhotoAt(idx)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          padding: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Icon name="close" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {(selectedMenuItem.photosMenu || []).length === 0 && (
                    <View style={{ padding: 6 }}>
                      <Text style={{ color: colors.textLight }}>Aucune photo</Text>
                    </View>
                  )}
                </ScrollView>

                <TextInput
                  placeholder="Photos (URLs séparées par ,)"
                  value={(selectedMenuItem.photosMenu || []).join(",")}
                  onChangeText={(t) => setSelectedMenuItem({ ...selectedMenuItem, photosMenu: t.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                  placeholderTextColor={colors.textLight}
                  style={inputStyle()}
                />

                <View style={{ flexDirection: "row", marginTop: spacing.md }}>
                  <TouchableOpacity onPress={() => { setSelectedMenuItem(null); }} style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                    <Text style={{ color: colors.text }}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveMenuItem} style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: radius.md, alignItems: "center" }}>
                    <Text style={{ color: "#fff" }}>{selectedMenuItem.id ? "Sauvegarder" : "Ajouter"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeEditModal>
      </Modal>
      </View>
    </SafeAreaView>
  );

  // ---------- small helpers ----------
  function inputStyle() {
    return {
      height: 48,
      backgroundColor: colors.background,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      color: colors.text,
      marginBottom: spacing.md,
    } as any;
  }
}

/* ----------------------
   Small subcomponents used inside file
   - SafeEditModal: wrapper with close header + keyboard avoidance
   - FormRow: label + children
----------------------- */

function SafeEditModal({ children, title, onClose }: any) {
  const { colors, spacing } = useTheme();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={{ paddingHorizontal: spacing.md, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
        <AppHeader title={title} onBack={onClose} />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </KeyboardAvoidingView>
  );
}

function FormRow({ label, children }: any) {
  const { spacing, typography, colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ marginBottom: 6, fontFamily: typography.semiBold, color: colors.text }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = {
  smallBtn: (colors: any, radius: any): any => ({
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  }),
  actionBtn: (colors: any, radius: any): any => ({
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  }),
  actionBtnAlt: (colors: any, radius: any): any => ({
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
    justifyContent: "center",
  }),
};
