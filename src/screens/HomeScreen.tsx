import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../navigation/types';

import {
  formatCardNumber,
  luhnCheck,
  normalizeCardNumber,
} from '../utils/card';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

const HomeScreen = ({
  navigation,
  route,
}: Props) => {
  const [cardNumber, setCardNumber] =
    useState('');

  const [error, setError] =
    useState<string | null>(null);

  const scannedCardNumber =
    route.params?.scannedCardNumber;

  useEffect(() => {
    if (!scannedCardNumber) {
      return;
    }

    setCardNumber(
      formatCardNumber(scannedCardNumber),
    );

    setError(null);

    /**
     * Remove route param after consuming it.
     */
    navigation.setParams({
      scannedCardNumber: undefined,
    });
  }, [
    navigation,
    scannedCardNumber,
  ]);

  const handleChangeCardNumber =
    useCallback((value: string) => {
      const normalized =
        normalizeCardNumber(value);

      /**
       * PAN max length = 19.
       */
      const limited =
        normalized.slice(0, 19);

      setCardNumber(
        formatCardNumber(limited),
      );

      setError(null);
    }, []);

  const handleScan = useCallback(() => {
    navigation.navigate('CardScanner');
  }, [navigation]);

  const handleContinue =
    useCallback(() => {
      const number =
        normalizeCardNumber(cardNumber);

      if (!number) {
        setError(
          'Please enter or scan a card number.',
        );

        return;
      }

      if (!luhnCheck(number)) {
        setError(
          'Please enter a valid card number.',
        );

        return;
      }

      setError(null);

      /**
       * Testing only.
       *
       * Do NOT log real card numbers in production.
       */

      // call your next flow here
    }, [cardNumber]);

  const isValid =
    luhnCheck(cardNumber);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            Add your card
          </Text>

          <Text style={styles.description}>
            Enter your card number manually or
            scan your card.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Card number
            </Text>

            <TextInput
              value={cardNumber}
              onChangeText={
                handleChangeCardNumber
              }
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              maxLength={23}
              style={[
                styles.input,
                error && styles.inputError,
              ]}
              placeholderTextColor="#8E8E93"
              autoCorrect={false}
              autoCapitalize="none"
            />

            {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}
          </View>

          <View style={styles.orRow}>
            <View style={styles.line} />

            <Text style={styles.orText}>
              OR
            </Text>

            <View style={styles.line} />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.scanButton}
            onPress={handleScan}
          >
            <View style={styles.cameraIcon}>
              <View
                style={
                  styles.cameraIconCircle
                }
              />
            </View>

            <Text
              style={styles.scanButtonText}
            >
              Scan Card
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isValid}
          style={[
            styles.continueButton,
            !isValid &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isValid &&
                styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  content: {
    flex: 1,
    paddingTop: 50,
  },

  title: {
    color: '#151515',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },

  description: {
    marginTop: 12,
    color: '#676767',
    fontSize: 15,
    lineHeight: 22,
  },

  inputContainer: {
    marginTop: 40,
  },

  label: {
    marginBottom: 10,
    color: '#282828',
    fontSize: 14,
    fontWeight: '500',
  },

  input: {
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 12,
    color: '#121212',
    fontSize: 17,
    letterSpacing: 0.5,
  },

  inputError: {
    borderColor: '#D92D20',
  },

  errorText: {
    marginTop: 8,
    color: '#D92D20',
    fontSize: 13,
  },

  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },

  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D6D6D6',
  },

  orText: {
    marginHorizontal: 14,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '600',
  },

  scanButton: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIcon: {
    width: 22,
    height: 16,
    marginRight: 10,
    borderWidth: 1.8,
    borderColor: '#222222',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIconCircle: {
    width: 7,
    height: 7,
    borderWidth: 1.5,
    borderColor: '#222222',
    borderRadius: 4,
  },

  scanButtonText: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  continueButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  continueButtonTextDisabled: {
    color: '#9E9E9E',
  },
});