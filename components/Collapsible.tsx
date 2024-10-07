<<<<<<< HEAD
<<<<<<< HEAD
import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";
=======
=======
>>>>>>> origin/main
import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';
<<<<<<< HEAD
>>>>>>> origin/main
=======
>>>>>>> origin/main

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
<<<<<<< HEAD
<<<<<<< HEAD
        activeOpacity={0.8}
      >
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-forward-outline"}
          size={18}
          color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen ? (
        <ThemedView style={styles.content}>{children}</ThemedView>
      ) : null}
=======
=======
>>>>>>> origin/main
        activeOpacity={0.8}>
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward-outline'}
          size={18}
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
<<<<<<< HEAD
>>>>>>> origin/main
=======
>>>>>>> origin/main
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
<<<<<<< HEAD
<<<<<<< HEAD
    flexDirection: "row",
    alignItems: "center",
=======
    flexDirection: 'row',
    alignItems: 'center',
>>>>>>> origin/main
=======
    flexDirection: 'row',
    alignItems: 'center',
>>>>>>> origin/main
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
