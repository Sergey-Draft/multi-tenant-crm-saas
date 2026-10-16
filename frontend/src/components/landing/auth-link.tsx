/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Вынесена в 'use client', чтобы серверный
 * HomePage не читал cookies() и оставался статическим (ISR), а не
 * рендерился динамически на каждый запрос ради одной кнопки.
 */
function useHasAccessToken() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(
      document.cookie.split("; ").some((c) => c.startsWith("accessToken="))
    );
  }, []);

  return hasToken;
}

export function AuthLink({
  authedHref,
  authedLabel,
  guestHref,
  guestLabel,
  className,
  children,
}: {
  authedHref: string;
  authedLabel: React.ReactNode;
  guestHref: string;
  guestLabel: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const hasToken = useHasAccessToken();

  return (
    <Link href={hasToken ? authedHref : guestHref} className={className}>
      {hasToken ? authedLabel : guestLabel}
      {children}
    </Link>
  );
}
