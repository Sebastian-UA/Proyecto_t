// app/_layout.tsx
import { Slot } from 'expo-router';
import { ProfessionalProvider } from '@/context/profesional';
import { PatientProvider } from '@/context/paciente';

export default function RootLayout() {
  return (
    <ProfessionalProvider>
      <PatientProvider>
        <Slot />
      </PatientProvider>
    </ProfessionalProvider>
  );
}
