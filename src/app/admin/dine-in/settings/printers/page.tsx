'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrintersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/settings/printer');
  }, [router]);
  return null;
}
