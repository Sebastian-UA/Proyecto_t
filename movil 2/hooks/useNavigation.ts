import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ROUTES } from '@/config/routes';

export const useNavigation = () => {
  const router = useRouter();

  const navigateToLogin = useCallback(() => {
    try {
      // Usar replace para evitar que el usuario pueda volver atrás
      router.replace(ROUTES.HOME);
    } catch (error) {
      console.error('❌ Error en navegación:', error);
      // Fallback: intentar con push si replace falla
      router.push(ROUTES.HOME);
    }
  }, [router]);

  const navigateToHome = useCallback(() => {
    try {
      router.replace(ROUTES.HOME);
    } catch (error) {
      console.error('❌ Error en navegación:', error);
      router.push(ROUTES.HOME);
    }
  }, [router]);

  const navigateToLoginPage = useCallback(() => {
    try {
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      console.error('❌ Error en navegación:', error);
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  const goBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('❌ Error al volver atrás:', error);
    }
  }, [router]);

  return {
    navigateToLogin,
    navigateToHome,
    navigateToLoginPage,
    goBack,
    router
  };
}; 