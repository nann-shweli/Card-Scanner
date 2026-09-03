import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ScanStatus =
  | 'scanning'
  | 'success'
  | 'failed';

type Props = {
  status: ScanStatus;
  detectedCardNumber?: string | null;

  onClose: () => void;
  onManualPress: () => void;
};

const CardScannerOverlay = ({
  status,
  detectedCardNumber,
  onClose,
  onManualPress,
}: Props) => {
  const isSuccess =
    status === 'success';

  const isFailed =
    status === 'failed';

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
    >
      <View style={styles.topContainer}>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>
            Close
          </Text>
        </TouchableOpacity>
      </View>

      <View
        pointerEvents="none"
        style={styles.centerContainer}
      >
        <View
          style={[
            styles.cardFrame,

            isSuccess &&
              styles.cardFrameSuccess,

            isFailed &&
              styles.cardFrameFailed,
          ]}
        >
          <View style={styles.cornerTopLeft} />

          <View
            style={
              styles.cornerTopRight
            }
          />

          <View
            style={
              styles.cornerBottomLeft
            }
          />

          <View
            style={
              styles.cornerBottomRight
            }
          />

          {isFailed && (
            <View
              style={styles.statusContent}
            >
              <Text
                style={styles.warningIcon}
              >
                △
              </Text>

              <Text
                style={styles.failedTitle}
              >
                Failed to Scan
              </Text>

              <Text
                style={
                  styles.failedDescription
                }
              >
                Please enter manually.
              </Text>
            </View>
          )}

          {isSuccess &&
            detectedCardNumber && (
              <View
                style={
                  styles.successNumberContainer
                }
              >
                <Text
                  style={styles.successNumber}
                >
                  {detectedCardNumber}
                </Text>
              </View>
            )}
        </View>

        <Text style={styles.instruction}>
          {isSuccess
            ? 'Card scanned successfully'
            : 'Scan front of card'}
        </Text>

        <TouchableOpacity
          pointerEvents="auto"
          style={styles.manualButton}
          onPress={onManualPress}
          activeOpacity={0.8}
        >
          <Text
            style={styles.manualButtonText}
          >
            Enter Manually Instead
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CardScannerOverlay;

const CORNER_LENGTH = 24;

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  closeButton: {
    minWidth: 54,
    minHeight: 32,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(20,20,20,0.35)',
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  cardFrame: {
    width: '100%',
    maxWidth: 380,

    /**
     * Payment card ratio:
     * 85.60 / 53.98 ≈ 1.586
     */
    aspectRatio: 1.586,

    borderRadius: 14,

    backgroundColor:
      'rgba(255,255,255,0.04)',

    overflow: 'hidden',
  },

  cardFrameSuccess: {
    borderWidth: 2,
    borderColor: '#36D676',
  },

  cardFrameFailed: {
    borderWidth: 2,
    borderColor: '#E23A31',
    backgroundColor:
      'rgba(50,0,0,0.16)',
  },

  statusContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  warningIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    marginBottom: 5,
  },

  failedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  failedDescription: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 13,
  },

  successNumberContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor:
      'rgba(0,0,0,0.45)',

    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },

  instruction: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  manualButton: {
    minHeight: 42,
    marginTop: 18,
    paddingHorizontal: 20,
    borderRadius: 22,

    backgroundColor:
      'rgba(17,17,17,0.8)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,

    width: CORNER_LENGTH,
    height: CORNER_LENGTH,

    borderTopWidth: 2,
    borderLeftWidth: 2,

    borderColor: '#FFFFFF',

    borderTopLeftRadius: 14,
  },

  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,

    width: CORNER_LENGTH,
    height: CORNER_LENGTH,

    borderTopWidth: 2,
    borderRightWidth: 2,

    borderColor: '#FFFFFF',

    borderTopRightRadius: 14,
  },

  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,

    width: CORNER_LENGTH,
    height: CORNER_LENGTH,

    borderBottomWidth: 2,
    borderLeftWidth: 2,

    borderColor: '#FFFFFF',

    borderBottomLeftRadius: 14,
  },

  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,

    width: CORNER_LENGTH,
    height: CORNER_LENGTH,

    borderBottomWidth: 2,
    borderRightWidth: 2,

    borderColor: '#FFFFFF',

    borderBottomRightRadius: 14,
  },
});