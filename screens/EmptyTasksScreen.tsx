import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

// TODO: i18n - extract strings into translation files in a future pass.

export type EmptyTasksScreenProps = {
  onSpeak?: () => void;
  onOpenCamera?: () => void;
  onOpenChat?: () => void;
  onStartFirstTask?: () => void;
  theme?: {
    background?: string; // default: '#F8FAFC' (light background)
    surface?: string; // default: '#FFFFFF'
    textPrimary?: string; // default: '#111827'
    textSecondary?: string; // default: '#6B7280'
    accent?: string; // default: '#3B82F6'
    outline?: string; // default: '#E5E7EB'
    shadow?: string; // default: 'rgba(0,0,0,0.06)'
  };
  testID?: string; // default: 'empty-tasks-screen'
};

type CapabilityCardProps = {
  testID: string;
  headline: string;
  subtext: string;
  icon: React.ReactNode;
  chipLabel: string;
  onPress?: () => void;
  onChipPress?: () => void;
  colors: Required<NonNullable<EmptyTasksScreenProps['theme']>>;
};

// Spacing scale and radii
const SPACING = { xxs: 6, xs: 8, sm: 12, md: 16, lg: 24, xl: 32 } as const;
const RADII = { sm: 12, md: 14, lg: 16 } as const;

const DEFAULT_THEME: Required<NonNullable<EmptyTasksScreenProps['theme']>> = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#3B82F6',
  outline: '#E5E7EB',
  shadow: 'rgba(0,0,0,0.06)',
};

// Inline icons (react-native-svg), monoline 1.5px stroke
type IconProps = { size?: number; color?: string };

const MicIcon = memo(({ size = 28, color = DEFAULT_THEME.textPrimary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M19 11a7 7 0 0 1-14 0" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    <Path d="M12 18v3" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
));

const CameraIcon = memo(({ size = 28, color = DEFAULT_THEME.textPrimary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 8.5a2.5 2.5 0 0 1 2.5-2.5h2l1.4-2.1A2 2 0 0 1 11.9 3h.2a2 2 0 0 1 1.7.9L15.3 6h2.2A2.5 2.5 0 0 1 20 8.5V17a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17V8.5Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
    <Circle cx={12} cy={12.5} r={3.5} stroke={color} strokeWidth={1.5}/>
  </Svg>
));

const SparkleIcon = memo(({ size = 28, color = DEFAULT_THEME.textPrimary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
    <Path d="M19 4l.9 2.1L22 7l-2.1.9L19 10l-.9-2.1L16 7l2.1-.9L19 4Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
    <Path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
  </Svg>
));

// Subtle hero illustration: notepad morphing into speech bubble + camera corner + sparkle, with radial glow
const NotepadHero = memo(({ size = 120, accent = DEFAULT_THEME.accent }: { size?: number; accent?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs>
      <RadialGradient id="heroGlow" cx="50%" cy="45%" r="60%">
        <Stop offset="0%" stopColor={accent} stopOpacity={0.12} />
        <Stop offset="100%" stopColor={accent} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Rect x={0} y={0} width={120} height={120} fill="url(#heroGlow)" />
    <G fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {/* Notepad body */}
      <Rect x={28} y={26} width={52} height={60} rx={8} />
      {/* Notepad lines */}
      <Path d="M36 40h36M36 48h28M36 56h32M36 64h24" />
      {/* Speech bubble tail */}
      <Path d="M80 72c8 0 14 5.5 14 12.5S88 97 80 97c-2.4 0-4.7-.5-6.6-1.4L64 100l3.5-7.1c-1.1-1.8-1.8-3.9-1.8-6 0-7 6-12.5 14-12.5Z" />
      {/* Camera corner */}
      <Path d="M74 24l5-7 5 7h8" />
      {/* Sparkle */}
      <Path d="M24 80l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2 2.2-5Z" />
    </G>
  </Svg>
));

const CapabilityCard = memo((props: CapabilityCardProps) => {
  const { testID, headline, subtext, icon, chipLabel, onPress, onChipPress, colors } = props;

  const onChipPressInternal = useCallback(
    (e: any) => {
      if (e?.stopPropagation) e.stopPropagation();
      onChipPress && onChipPress();
    },
    [onChipPress]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${headline}. ${subtext}. Action: ${chipLabel}.`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outline,
          shadowColor: colors.shadow,
        },
        pressed && styles.cardPressed,
      ]}
      testID={testID}
      hitSlop={4}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardIcon}>{icon}</View>
        <View style={styles.cardContentWrap}>
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {headline}
            </Text>
            <Text style={[styles.cardSubtext, { color: colors.textSecondary }]} numberOfLines={3}>
              {subtext}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={chipLabel}
            onPress={onChipPressInternal}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: colors.accent,
                shadowColor: colors.shadow,
              },
              pressed && { opacity: 0.9 },
            ]}
            testID={`chip-${testID.replace('-card', '')}`}
            hitSlop={4}
          >
            <Text style={[styles.chipLabel]}>{chipLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

export const EmptyTasksScreen: React.FC<EmptyTasksScreenProps> = ({
  onSpeak,
  onOpenCamera,
  onOpenChat,
  onStartFirstTask,
  theme,
  testID = 'empty-tasks-screen',
}) => {
  const colors = useMemo(() => ({ ...DEFAULT_THEME, ...(theme || {}) }), [theme]);

  // Reduced motion preference
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((res) => {
      if (mounted) setReduceMotion(Boolean(res));
    });
    const sub = AccessibilityInfo.addEventListener
      ? AccessibilityInfo.addEventListener('reduceMotionChanged', (res: boolean) => setReduceMotion(Boolean(res)))
      : undefined as any;
    return () => {
      mounted = false;
      // @ts-ignore - RN older versions use remove()
      if (sub && sub.remove) sub.remove();
      // @ts-ignore - RN newer versions return unsubscribe function
      if (typeof sub === 'function') sub();
    };
  }, []);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current; // hero + title
  const cardAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    if (reduceMotion) {
      headerAnim.setValue(1);
      cardAnims.forEach((a) => a.setValue(1));
      return;
    }

    headerAnim.setValue(0);
    cardAnims.forEach((a) => a.setValue(0));

    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.stagger(60, cardAnims.map((a) => Animated.timing(a, { toValue: 1, duration: 220, useNativeDriver: true }))),
    ]).start();
  }, [reduceMotion, headerAnim, cardAnims]);

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const cardTransforms = cardAnims.map((a) => a.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }));

  // Handlers (noop-safe)
  const handleSpeak = useCallback(() => onSpeak && onSpeak(), [onSpeak]);
  const handleCamera = useCallback(() => onOpenCamera && onOpenCamera(), [onOpenCamera]);
  const handleChat = useCallback(() => onOpenChat && onOpenChat(), [onOpenChat]);
  const handleStart = useCallback(() => onStartFirstTask && onStartFirstTask(), [onStartFirstTask]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xl }]}
        bounces
        alwaysBounceVertical={false}
        testID={testID}
      >
        {/* Hero */}
        <Animated.View style={{ alignItems: 'center', opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }}>
          <NotepadHero size={120} accent={colors.accent} />
          <View style={{ height: SPACING.md }} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>No tasks yet</Text>
          <View style={{ height: SPACING.xs }} />
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start faster with voice, your camera, or AI.</Text>
        </Animated.View>

        <View style={{ height: SPACING.lg }} />

        {/* Capability Cards */}
        <Animated.View style={{ opacity: cardAnims[0], transform: [{ translateY: cardTransforms[0] }] }}>
          <CapabilityCard
            testID="speak-card"
            headline="Talk it out"
            subtext="Say what needs to be done — we’ll turn your words into organized tasks or a checklist instantly."
            icon={<MicIcon color={colors.textPrimary} size={30} />}
            chipLabel="Speak"
            onPress={handleSpeak}
            onChipPress={handleSpeak}
            colors={colors}
          />
        </Animated.View>

        <View style={{ height: SPACING.md }} />

        <Animated.View style={{ opacity: cardAnims[1], transform: [{ translateY: cardTransforms[1] }] }}>
          <CapabilityCard
            testID="camera-card"
            headline="Snap and convert"
            subtext="Take a photo of notes, plans, or any document — we’ll transform it into actionable items."
            icon={<CameraIcon color={colors.textPrimary} size={30} />}
            chipLabel="Open camera"
            onPress={handleCamera}
            onChipPress={handleCamera}
            colors={colors}
          />
        </Animated.View>

        <View style={{ height: SPACING.md }} />

        <Animated.View style={{ opacity: cardAnims[2], transform: [{ translateY: cardTransforms[2] }] }}>
          <CapabilityCard
            testID="chat-card"
            headline="Just chat"
            subtext="Tell AI what you need, and it will create the perfect task list for you."
            icon={<SparkleIcon color={colors.textPrimary} size={30} />}
            chipLabel="Chat with AI"
            onPress={handleChat}
            onChipPress={handleChat}
            colors={colors}
          />
        </Animated.View>

        <View style={{ height: SPACING.xl }} />

        {/* Footer CTA */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start your first task"
          onPress={handleStart}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: colors.accent,
              shadowColor: colors.shadow,
            },
            pressed && { opacity: 0.95 },
          ]}
          testID="cta-start-first-task"
        >
          <Text style={styles.ctaLabel}>Start your first task</Text>
        </Pressable>

        <View style={{ height: SPACING.xs }} />
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>Try speaking, snapping, or chatting to get started.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: Platform.select({ ios: '600', android: '600', default: '600' }) as any,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    // Very subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardContentWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // chips can wrap under text on narrow widths
  },
  cardTextWrap: {
    flex: 1,
    minWidth: '60%',
    paddingRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: Platform.select({ ios: '600', android: '700', default: '600' }) as any,
    marginBottom: SPACING.xs,
  },
  cardSubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  chip: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle shadow for chip
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    marginTop: SPACING.xs, // margin when wrapping
  },
  chipLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Platform.select({ ios: '600', android: '600', default: '600' }) as any,
  },
  ctaButton: {
    height: 50,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Platform.select({ ios: '600', android: '700', default: '600' }) as any,
  },
  helperText: {
    marginTop: SPACING.xs,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default EmptyTasksScreen;

/*
Example usage:

import EmptyTasksScreen from './EmptyTasksScreen';

export function TodosScreen() {
  return (
    <EmptyTasksScreen
      onSpeak={() => console.log('Speak pressed')}
      onOpenCamera={() => console.log('Open camera pressed')}
      onOpenChat={() => console.log('Chat with AI pressed')}
      onStartFirstTask={() => console.log('Start first task pressed')}
      theme={{
        // Optional: override to match your app theme
        accent: '#2563EB',
      }}
    />
  );
}
*/


