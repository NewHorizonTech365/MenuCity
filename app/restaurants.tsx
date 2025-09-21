
// Restaurants screen: liste des restaurants et recherche
// - Charge un ensemble de restaurants depuis `data/restaurants`
// - Permet d'ouvrir un panneau de détails ou le sheet d'invitation
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles, colors } from '../styles/commonStyles';
import { restaurantsLubumbashi } from '../data/restaurants';
import { Restaurant } from '../types/Restaurant';
import BottomNavigation from '../components/BottomNavigation';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantDetails from '../components/RestaurantDetails';
import InviteFriendSheet from '../components/InviteFriendSheet';
import Icon from '../components/Icon';

export default function RestaurantsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantsLubumbashi);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée de l'écran
    Animated.stagger(150, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Animation de recherche
    Animated.sequence([
      Animated.timing(cardsAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Si la recherche est vide, on restaure la liste complète
    if (query.trim() === '') {
      setFilteredRestaurants(restaurantsLubumbashi);
    } else {
      const filtered = restaurantsLubumbashi.filter(restaurant =>
        restaurant.nom.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.specialites.some(spec => spec.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredRestaurants(filtered);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    console.log('Restaurant sélectionné:', restaurant.nom);
    setSelectedRestaurant(restaurant);
    setShowDetails(true);
  };

  const handleInvitePress = (restaurant: Restaurant) => {
    console.log('Invitation pour:', restaurant.nom);
    setSelectedRestaurant(restaurant);
    setShowInviteSheet(true);
  };

  const handleSendInvitation = (inviteData: any) => {
    console.log('Invitation envoyée:', inviteData);
    // Ici, vous pourriez envoyer l'invitation via email ou SMS
    // Pour l'instant, on simule juste l'envoi
  };

  const closeModals = () => {
    setShowDetails(false);
    setShowInviteSheet(false);
    setSelectedRestaurant(null);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={commonStyles.gradientHeader}
        >
          <Text style={[commonStyles.title, { color: colors.textWhite, marginBottom: 5 }]}>
            Restaurants de Lubumbashi
          </Text>
          <Text style={[commonStyles.text, { color: colors.textWhite, marginBottom: 0 }]}>
            Découvrez les meilleurs restaurants et invitez vos amis
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View 
        style={{ 
          paddingHorizontal: 20, 
          marginBottom: 20,
          opacity: searchAnim,
          transform: [
            {
              scale: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }
          ],
        }}
      >
        <View style={commonStyles.searchBar}>
          <Icon name="search" size={20} color={colors.textLight} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder="Rechercher un restaurant, cuisine..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.View
        style={{
          flex: 1,
          opacity: cardsAnim,
          transform: [{ scale: cardsAnim }],
        }}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {filteredRestaurants.length === 0 ? (
            <Animated.View 
              style={{ 
                alignItems: 'center', 
                marginTop: 50,
                opacity: fadeAnim,
              }}
            >
              <Icon name="restaurant-outline" size={60} color={colors.textLight} />
              <Text style={[commonStyles.subtitle, { marginTop: 20, color: colors.textLight }]}>
                Aucun restaurant trouvé
              </Text>
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>
                Essayez de modifier votre recherche
              </Text>
            </Animated.View>
          ) : (
            filteredRestaurants.map((restaurant, index) => (
              <Animated.View
                key={restaurant.id}
                style={{
                  opacity: cardsAnim,
                  transform: [
                    {
                      translateY: cardsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }
                  ],
                }}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  onPress={() => handleRestaurantPress(restaurant)}
                  onInvite={() => handleInvitePress(restaurant)}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>
      </Animated.View>

      <BottomNavigation currentRoute="restaurants" />

      {/* Modal pour les détails du restaurant */}
      {/* Utilise un Modal natif pour afficher RestaurantDetails */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedRestaurant && (
          <RestaurantDetails
            restaurant={selectedRestaurant}
            onClose={closeModals}
            onInvite={() => {
              setShowDetails(false);
              setShowInviteSheet(true);
            }}
          />
        )}
      </Modal>

      {/* Modal pour inviter un ami */}
      <Modal
        visible={showInviteSheet}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedRestaurant && (
          <InviteFriendSheet
            restaurant={selectedRestaurant}
            onClose={closeModals}
            onSendInvitation={handleSendInvitation}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}
