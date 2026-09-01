// app/restaurant/[id].tsx — Page détails restaurant (données centralisées)

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Modal } from "react-native";
import { useData } from "../../providers/DataProvider";
import RestaurantDetails from "../../components/RestaurantDetails";
import InviteFriendSheet, { type InvitePayload } from "../../components/InviteFriendSheet";
import { useTheme } from "../../styles/theme";
import { useAuth } from "../../providers/AuthProvider";
import type { Restaurant } from "../../types/Restaurant";
import StateView from "../../components/ui/StateView";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { restaurants, getRestaurant, createInvitation } = useData();
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();               // ⬅️ thème modernisé

  const restaurantId = String(id || "");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => restaurants.find((r) => r.id === restaurantId) || null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void getRestaurant(restaurantId).then((result) => {
      if (active) setRestaurant(result);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [getRestaurant, restaurantId]);

  const openInvite = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setShowInvite(true);
  };

  const saveInvitation = async (payload: InvitePayload) => {
    await createInvitation(payload);
  };

  if (isLoading && !restaurant) {
    return <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}><StateView title="Chargement du restaurant…" loading /></View>;
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <StateView title="Restaurant introuvable" message="Cette adresse n’est plus disponible dans le catalogue." actionLabel="Retour" onAction={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* DETAILS DU RESTAURANT */}
      <RestaurantDetails
        restaurant={restaurant}
        onInvite={openInvite}
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
          onSendInvitation={saveInvitation}
        />
      </Modal>
    </View>
  );
}
