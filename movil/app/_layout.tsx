// app/_layout.tsx
import { Stack } from 'expo-router';
import { ProfessionalProvider } from '@/context/profesional';
import { PatientProvider } from '@/context/paciente'; // si también usas esto

export default function RootLayout() {
  return (
    <ProfessionalProvider>
      <PatientProvider>
        <Stack />
      </PatientProvider>
    </ProfessionalProvider>
  );
}
