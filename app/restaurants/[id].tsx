// app/restaurant/[id].tsx — Page détails restaurant (données centralisées)

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useData } from "../../providers/DataProvider";
import RestaurantDetails from "../../components/RestaurantDetails";
import InviteFriendSheet from "../../components/InviteFriendSheet";
import { useTheme } from "../../styles/theme";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { restaurants } = useData();            // ⬅️ DONNÉES CENTRALISÉES
  const { colors } = useTheme();               // ⬅️ thème modernisé

  const restaurant = restaurants.find((r) => r.id === id);
  const [showInvite, setShowInvite] = useState(false);

  // Si l'ID n'existe pas
  if (!restaurant) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Restaurant introuvable
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 20,
            backgroundColor: colors.primary,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* DETAILS DU RESTAURANT */}
      <RestaurantDetails
        restaurant={restaurant}
        onInvite={() => setShowInvite(true)}
      />

      {/* MODAL INVITATION */}
      <Modal
        visible={showInvite}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvite(false)}
      >
        <InviteFriendSheet
          restaurant={restaurant}
          onClose={() => setShowInvite(false)}
          onSendInvitation={(data: any) => {
            console.log("Invitation envoyée:", data);
            setShowInvite(false);
          }}
        />
      </Modal>
    </View>
  );
}