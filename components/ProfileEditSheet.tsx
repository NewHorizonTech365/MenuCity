
// ProfileEditSheet
// Petit composant utilisé dans un bottom sheet qui permet de modifier
// les informations de l'utilisateur (nom, email, téléphone).
// Il envoie les modifications via `onUpdate` puis ferme le sheet.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { User } from '../types/User';

interface ProfileEditSheetProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
  onClose: () => void;
}

export default function ProfileEditSheet({ user, onUpdate, onClose }: ProfileEditSheetProps) {
  const [nom, setNom] = useState(user.nom);
  const [email, setEmail] = useState(user.email);
  const [telephone, setTelephone] = useState(user.telephone);

  const handleSave = () => {
    if (!nom || !email || !telephone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    onUpdate({ nom, email, telephone });
    onClose();
    Alert.alert('Succès', 'Profil mis à jour avec succès');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={[commonStyles.title, { fontSize: 20, marginBottom: 20 }]}>
        Modifier le profil
      </Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Nom complet"
        value={nom}
        onChangeText={setNom}
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Numéro de téléphone"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
          onPress={onClose}
        >
          <Text style={buttonStyles.textSecondary}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          onPress={handleSave}
        >
          <Text style={buttonStyles.text}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
