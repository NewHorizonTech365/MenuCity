// app/restaurant/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { restaurantsLubumbashi } from "../../data/restaurants";
import RestaurantDetails from "../../components/RestaurantDetails";
import InviteFriendSheet from "../../components/InviteFriendSheet";
import { colors } from "../../styles/commonStyles";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const restaurant = restaurantsLubumbashi.find(r => r.id === id);

  const [showInvite, setShowInvite] = useState(false);

  if (!restaurant) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <Text style={{color: colors.text}}>Restaurant introuvable</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{marginTop:15, padding:12, backgroundColor:colors.primary, borderRadius:25}}
        >
          <Text style={{color:"#fff"}}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* DETAILS */}
      <RestaurantDetails
        restaurant={restaurant}
        onInvite={() => setShowInvite(true)}
      />

      {/* INVITER UN AMI SHEET */}
      <Modal
        visible={showInvite}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvite(false)}
      >
        <InviteFriendSheet
          restaurant={restaurant}
          onClose={() => setShowInvite(false)}
          onSendInvitation={(data:any)=>{
            console.log("Invitation envoyée:", data)
            setShowInvite(false)
          }}
        />
      </Modal>

    </View>
  );
}