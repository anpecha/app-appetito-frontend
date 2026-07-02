'use client';

import { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4">
      <Card className="w-full max-w-sm border-0 shadow-card">
        <CardHeader className="items-center pb-2 pt-8">
          <div className="mb-2 flex items-center justify-center">
            <Image
              src="/img/Logo Appetito.png"
              alt="Appetito"
              width={180}
              height={80}
              className="object-contain w-auto h-auto"
              priority
            />
          </div>
          <CardDescription className="text-center font-medium text-[#666666]">
            Acesse o painel do seu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-6">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#202020]" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="border-[#D1D1D1] focus-visible:ring-[#DA291C]/30 focus-visible:border-[#DA291C] h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#202020]" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="pr-10 border-[#D1D1D1] focus-visible:ring-[#DA291C]/30 focus-visible:border-[#DA291C] h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#202020] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <Button
              variant="primary"
              type="submit"
              className="w-full h-11 text-base font-bold bg-[#FFC72E] text-[#202020] hover:bg-[#E5B329] active:bg-[#CC9F24] shadow-button-primary"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-[#E8E8E8] pt-6 pb-8">
          <p className="text-xs text-[#999999]">
            &copy; {new Date().getFullYear()} Appetito. Todos os direitos reservados.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
