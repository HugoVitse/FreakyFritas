import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { appStyles } from '../styles/appStyles';
import { Mode, FlashMode } from '../types';

interface BottomControlsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  flash: FlashMode;
  onFlashChange: () => void;
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  error: string | null;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  mode,
  onModeChange,
  flash,
  onFlashChange,
  collapsed,
  onCollapseChange,
  error,
}) => {
  return (
    <View style={appStyles.bottomPanel}>
      <TouchableOpacity
        style={appStyles.bottomPanelHeader}
        onPress={() => onCollapseChange(!collapsed)}
      >
        <Text style={appStyles.bottomPanelHeaderText}>
          {collapsed ? '▶ Paramètres' : '▼ Paramètres'}
        </Text>
      </TouchableOpacity>

      {!collapsed && (
        <>
          <View style={appStyles.row}>
            <Text style={appStyles.label}>Mode</Text>
            <View style={appStyles.modeSwitch}>
              <TouchableOpacity
                style={[
                  appStyles.modeChip,
                  mode === 'bl' && appStyles.modeChipActive,
                ]}
                onPress={() => onModeChange('bl')}
              >
                <Text style={[
                  appStyles.modeChipText,
                  mode === 'bl' && { color: 'white' }
                ]}>Bon de livraison</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  appStyles.modeChip,
                  mode === 'labels' && appStyles.modeChipActive,
                ]}
                onPress={() => onModeChange('labels')}
              >
                <Text style={[
                  appStyles.modeChipText,
                  mode === 'labels' && { color: 'white' }
                ]}>Étiquettes</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={appStyles.row}>
            <Text style={appStyles.label}>Lampe</Text>
            <TouchableOpacity
              style={[
                appStyles.chip,
                flash === 'on' && appStyles.chipActive,
              ]}
              onPress={onFlashChange}
            >
              <Text style={[
                appStyles.chipText,
                flash === 'on' && { color: 'white' }
              ]}>
                {flash === 'on' ? 'Allumée' : 'Éteinte'}
              </Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={appStyles.error}>{error}</Text>}

          <View style={appStyles.separator} />
        </>
      )}
    </View>
  );
};
