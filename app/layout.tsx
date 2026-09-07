import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Пашенька, это всё тебе ♡', description: 'Маленькое письмо о большом чувстве. Только для тебя, Пашенька.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
