
// RestaurantDetails
// Écran affichant les informations détaillées d'un restaurant.
// - Affiche photo, note, description, horaires, coordonnées, etc.
// - Expose un bouton pour inviter un ami (callback onInvite)
import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Restaurant } from '../types/Restaurant';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
  onClose: () => void;
  onInvite: () => void;
}

export default function RestaurantDetails({ restaurant, onClose, onInvite }: RestaurantDetailsProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={20} color={colors.gold} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={20} color={colors.gold} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-outline" size={20} color={colors.grey} />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du Restaurant</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        
        <View style={styles.info}>
          <Text style={styles.name}>{restaurant.nom}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(restaurant.note)}
            </View>
            <Text style={styles.rating}>{restaurant.note}/5</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="restaurant-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{restaurant.cuisine}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{restaurant.adresse}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{restaurant.telephone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{restaurant.horaires}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Prix moyen: {restaurant.prixMoyen}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spécialités</Text>
            <View style={styles.specialitiesContainer}>
              {restaurant.specialites.map((specialite, index) => (
                <View key={index} style={styles.specialityTag}>
                  <Text style={styles.specialityText}>{specialite}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.inviteButton} onPress={onInvite}>
          <Icon name="person-add" size={24} color={colors.textWhite} />
          <Text style={styles.inviteButtonText}>Inviter un ami</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  info: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.textLight,
    marginLeft: 12,
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  specialitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialityTag: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  specialityText: {
    fontSize: 14,
    color: colors.textWhite,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inviteButton: {
    ...buttonStyles.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  inviteButtonText: {
    ...buttonStyles.text,
    marginLeft: 8,
    fontSize: 18,
  },
});
