import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { appStyles } from '../styles/appStyles';

interface UserHeaderProps {
  email: string;
  domain: string;
  onLogout: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ email, domain, onLogout }) => {
  const username = email.split('@')[0];

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.label}>Connecté en tant que</Text>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.domain}>@{domain}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>↪️ Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  domain: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginLeft: 12,
  },
  logoutText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
});
