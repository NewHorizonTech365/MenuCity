// app/admin/_layout.tsx
// Layout pour les écrans admin
import { Stack } from "expo-router";
import React from "react";

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        />
    );
}   