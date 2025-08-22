'use client';

import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <html lang="zh-CN">
      <head>
        <title>电商AI自动化平台</title>
        <meta name="description" content="智能电商自动化管理平台" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <MainLayout>
            {children}
          </MainLayout>
        </QueryClientProvider>
      </body>
    </html>
  );
}
