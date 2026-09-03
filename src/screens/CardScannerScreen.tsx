import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';

import {
  performOcr,
} from '@bear-block/vision-camera-ocr';

import {
  Worklets,
} from 'react-native-worklets-core';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../navigation/types';

import CardScannerOverlay from '../components/CardScannerOverlay';

import {
  extractCardNumber,
  formatCardNumber,
} from '../utils/card';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CardScanner'
>;

type ScanStatus =
  | 'scanning'
  | 'success'
  | 'failed';

const SCAN_TIMEOUT_MS = 15_000;

const REQUIRED_SAME_RESULTS = 2;

const CardScannerScreen = ({
  navigation,
}: Props) => {
  const device = useCameraDevice('back');

  const {
    hasPermission,
    requestPermission,
  } = useCameraPermission();

  const [permissionRequested, setPermissionRequested] =
    useState(false);

  const [scanStatus, setScanStatus] =
    useState<ScanStatus>('scanning');

  const [
    detectedCardNumber,
    setDetectedCardNumber,
  ] = useState<string | null>(null);

  /**
   * Helps prevent OCR reading one bad frame
   * and instantly accepting it.
   */
  const lastCandidateRef =
    useRef<string | null>(null);

  const sameCandidateCountRef =
    useRef(0);

  const completedRef =
    useRef(false);

  const timeoutRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  useEffect(() => {
    const preparePermission =
      async () => {
        if (hasPermission) {
          setPermissionRequested(true);

          return;
        }

        await requestPermission();

        setPermissionRequested(true);
      };

    preparePermission();
  }, [
    hasPermission,
    requestPermission,
  ]);

  const clearScanTimeout =
    useCallback(() => {
      if (!timeoutRef.current) {
        return;
      }

      clearTimeout(
        timeoutRef.current,
      );

      timeoutRef.current = null;
    }, []);

  useEffect(() => {
    if (
      !hasPermission ||
      scanStatus !== 'scanning'
    ) {
      return;
    }

    clearScanTimeout();

    timeoutRef.current = setTimeout(
      () => {
        if (completedRef.current) {
          return;
        }

        setScanStatus('failed');
      },
      SCAN_TIMEOUT_MS,
    );

    return clearScanTimeout;
  }, [
    clearScanTimeout,
    hasPermission,
    scanStatus,
  ]);

  useEffect(() => {
    return clearScanTimeout;
  }, [clearScanTimeout]);

  /**
   * Called on normal JS thread.
   */
  const processOcrText =
    useCallback((text: string) => {
      if (
        completedRef.current ||
        scanStatus !== 'scanning'
      ) {
        return;
      }

      const candidate =
        extractCardNumber(text);

      if (!candidate) {
        return;
      }

      if (
        lastCandidateRef.current ===
        candidate
      ) {
        sameCandidateCountRef.current += 1;
      } else {
        lastCandidateRef.current =
          candidate;

        sameCandidateCountRef.current =
          1;
      }

      /**
       * Need same valid card number
       * from multiple OCR frames.
       */
      if (
        sameCandidateCountRef.current <
        REQUIRED_SAME_RESULTS
      ) {
        return;
      }

      completedRef.current = true;

      clearScanTimeout();

      setDetectedCardNumber(candidate);

      setScanStatus('success');

      /**
       * Display the green success
       * frame briefly before returning.
       */
      setTimeout(() => {
        navigation.navigate('Home', {
          scannedCardNumber: candidate,
        });
      }, 900);
    }, [
      clearScanTimeout,
      navigation,
      scanStatus,
    ]);

  /**
   * Send data from worklet thread
   * back to JS.
   */
  const onOcrTextJS =
    useMemo(
      () =>
        Worklets.createRunOnJS(
          processOcrText,
        ),
      [processOcrText],
    );

  const frameProcessor =
    useFrameProcessor(
      frame => {
        'worklet';

        const result = performOcr(
          frame,
          {
            includeBoxes: false,
            includeConfidence: false,

            /**
             * iOS uses this.
             */
            recognitionLevel:
              'accurate',

            recognitionLanguages: [
              'en-US',
            ],

            usesLanguageCorrection:
              false,
          },
        );

        if (!result?.text) {
          return;
        }

        onOcrTextJS(result.text);
      },
      [onOcrTextJS],
    );

  const handleClose =
    useCallback(() => {
      navigation.goBack();
    }, [navigation]);

  const handleManual =
    useCallback(() => {
      navigation.navigate('Home');
    }, [navigation]);

  const handleRetry =
    useCallback(() => {
      completedRef.current = false;

      lastCandidateRef.current = null;

      sameCandidateCountRef.current =
        0;

      setDetectedCardNumber(null);

      setScanStatus('scanning');
    }, []);

  const formattedDetectedNumber =
    detectedCardNumber
      ? formatCardNumber(
          detectedCardNumber,
        )
      : undefined;

  if (!permissionRequested) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />

        <Text style={styles.loadingText}>
          Preparing camera...
        </Text>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView
        style={
          styles.permissionContainer
        }
      >
        <Text
          style={styles.permissionTitle}
        >
          Camera permission required
        </Text>

        <Text
          style={
            styles.permissionDescription
          }
        >
          Please allow camera access to
          scan your card.
        </Text>

        <TouchableOpacity
          style={
            styles.permissionButton
          }
          onPress={requestPermission}
        >
          <Text
            style={
              styles.permissionButtonText
            }
          >
            Allow Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualOnlyButton}
          onPress={handleManual}
        >
          <Text
            style={
              styles.manualOnlyButtonText
            }
          >
            Enter Manually
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>
          Back camera not available.
        </Text>

        <TouchableOpacity
          style={styles.manualOnlyButton}
          onPress={handleManual}
        >
          <Text
            style={
              styles.manualOnlyButtonText
            }
          >
            Enter Manually
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}

        /**
         * Stop processing after
         * success/failure.
         */
        isActive={
          scanStatus === 'scanning'
        }

        frameProcessor={
          scanStatus === 'scanning'
            ? frameProcessor
            : undefined
        }
      />

      <View
        pointerEvents="none"
        style={styles.cameraDim}
      />

      <CardScannerOverlay
        status={scanStatus}
        detectedCardNumber={
          formattedDetectedNumber
        }
        onClose={handleClose}
        onManualPress={handleManual}
      />

      {scanStatus === 'failed' && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Text
            style={styles.retryButtonText}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CardScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  cameraDim: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(18,14,11,0.18)',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 15,
  },

  permissionContainer: {
    flex: 1,
    paddingHorizontal: 28,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },

  permissionDescription: {
    marginTop: 12,
    color: '#BBBBBB',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  permissionButton: {
    minWidth: 200,
    height: 50,
    marginTop: 30,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionButtonText: {
    color: '#161616',
    fontSize: 15,
    fontWeight: '600',
  },

  manualOnlyButton: {
    height: 48,
    marginTop: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#777777',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  manualOnlyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  retryButton: {
    position: 'absolute',

    alignSelf: 'center',

    bottom: 55,

    minWidth: 120,
    height: 44,

    paddingHorizontal: 24,

    borderRadius: 22,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  retryButtonText: {
    color: '#181818',
    fontSize: 14,
    fontWeight: '600',
  },
});