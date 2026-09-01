import { useSSO } from "@clerk/expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";

export const useGoogleAuth = () => {
  const { startSSOFlow } = useSSO();
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const signInWithGoogle = async (): Promise<{ ok: boolean; error?: string }> => {
    if (isExpoGo) {
      return {
        ok: false,
        error:
          "La connexion Google native sera activée lors du development build Android. Dans Expo Go, utilisez provisoirement l’e-mail et le mot de passe.",
      };
    }

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("auth/sso-callback", { scheme: "menucity" }),
      });
      if (!createdSessionId || !setActive) return { ok: false, error: "La connexion Google n’a pas été finalisée." };
      await setActive({ session: createdSessionId });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Connexion Google impossible." };
    }
  };

  return {
    isGoogleAvailable: !isExpoGo,
    signInWithGoogle,
    signUpWithGoogle: signInWithGoogle,
  };
};
