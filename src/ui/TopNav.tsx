import type { Href } from "expo-router";
import { router, usePathname } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, MD3Theme, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDogCounts } from "../state/DogCountsProvider";
import { logEvent } from "../utils/logger";

type NavKey = "home" | "new" | "list" | "my";

export const ROUTES = {
  home: "/" as Href,
  new: "/new-dog" as Href,
  list: "/dogs-list" as Href,
  my: "/my-dogs-list" as Href,
  me: "/me" as Href,
} as const;

function keyFromPathname(pathname: string): NavKey {
  if (pathname === "/" || pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/new-dog")) return "new";
  if (pathname.startsWith("/my-dogs-list")) return "my";
  if (pathname.startsWith("/dogs") || pathname.startsWith("/dog-profile"))
    return "list";
  return "home";
}

export function TopNav() {
  const theme = useTheme<MD3Theme>();
  const insets = useSafeAreaInsets();

  const pathname = usePathname();
  const activeKey = useMemo(() => keyFromPathname(pathname ?? "/"), [pathname]);

  const { myDogsCount } = useDogCounts();
  const myDogsLabel = myDogsCount === 1 ? "My Dog" : "My Dogs";

  const go = (key: NavKey) => {
    const to = ROUTES[key];
    if (!to) {
      console.error("TopNav missing route for key:", key, ROUTES);
      return;
    }
    logEvent(`Nav:top:${key}`, { to });
    router.replace(to);
  };

  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 6 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Button
          mode={activeKey === "home" ? "contained-tonal" : "outlined"}
          onPress={() => go("home")}
          compact
          style={[
            styles.button,
            activeKey === "home" ? styles.buttonActive : null,
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Home
        </Button>
        <Button
          mode="contained"
          onPress={() => go("new")}
          compact
          style={[
            styles.button,
            styles.newButton,
            activeKey === "new" ? styles.buttonActive : null,
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          New Dog
        </Button>

        <Button
          mode={activeKey === "list" ? "contained-tonal" : "outlined"}
          onPress={() => go("list")}
          compact
          style={[
            styles.button,
            activeKey === "list" ? styles.buttonActive : null,
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          All Dogs
        </Button>

        <Button
          mode={activeKey === "my" ? "contained-tonal" : "outlined"}
          onPress={() => go("my")}
          compact
          style={[
            styles.button,
            activeKey === "my" ? styles.buttonActive : null,
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {myDogsLabel}
        </Button>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: MD3Theme) {
  const border = theme.colors.outlineVariant ?? theme.colors.outline;
  const surface = theme.colors.surface;

  return StyleSheet.create({
    wrapper: {
      backgroundColor: surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
      paddingHorizontal: 12,
      // paddingTop is now dynamic via safe-area inset
      paddingBottom: 8,
    },
    row: {
      alignItems: "center",
      gap: 8,
    },
    homeWrap: {
      borderRadius: 12,
      overflow: "hidden",
    },
    homeButton: {
      margin: 0,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      width: 40,
      height: 40,
    },
    homeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    button: {
      borderRadius: 12,
    },
    buttonContent: {
      height: 40,
      paddingHorizontal: 10,
    },
    buttonLabel: {
      fontSize: 12,
      letterSpacing: 0,
    },
    newButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonActive: {
      borderColor: theme.colors.primary,
    },
  });
}
