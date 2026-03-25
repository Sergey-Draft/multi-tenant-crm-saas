"use client"

import * as React from "react"
import Link from "next/link"

export type DashboardCrumb = { label: string; href?: string }

const DASHBOARD_HREF = "/dashboard"
const SETTINGS_HREF = "/settings"
const SECTION_SYSTEM = "Система/Backend"
const SECTION_DOCS = "Документация"

/** Подписи страниц `/dashboard/*` — совпадают с PAGE_TITLES в топбаре. */
const DASHBOARD_NESTED_TITLES: Record<string, string> = {
  "/dashboard/clients": "Клиенты",
  "/dashboard/users": "Пользователи",
  "/dashboard/leads": "Лиды",
  "/dashboard/audit-logs": "Журнал аудита",
}

function crumbsDashboard(pathname: string): DashboardCrumb[] | null {
  if (pathname === DASHBOARD_HREF) {
    return [{ label: "Дашборд" }]
  }
  const nestedTitle = DASHBOARD_NESTED_TITLES[pathname]
  if (nestedTitle) {
    return [{ label: "Дашборд", href: DASHBOARD_HREF }, { label: nestedTitle }]
  }
  return null
}

function crumbsSettings(pathname: string): DashboardCrumb[] | null {
  if (pathname === SETTINGS_HREF) {
    return [{ label: SECTION_SYSTEM }, { label: "Настройки" }]
  }
  if (pathname === "/settings/user") {
    return [
      { label: SECTION_SYSTEM },
      { label: "Настройки", href: SETTINGS_HREF },
      { label: "Профиль" },
    ]
  }
  if (pathname === "/settings/backend-api") {
    return [
      { label: SECTION_SYSTEM },
      { label: "Настройки", href: SETTINGS_HREF },
      { label: "Backend API" },
    ]
  }
  return null
}

function crumbsDocumentation(pathname: string): DashboardCrumb[] | null {
  if (pathname === "/documentation") {
    return [{ label: SECTION_DOCS }, { label: "API Docs" }]
  }
  return null
}

/**
 * Цепочка для маршрутов с общим shell (дашборд, настройки, документация).
 * `null` — путь без конфига (заголовок только из fallback в топбаре).
 */
export function getDashboardCrumbs(pathname: string): DashboardCrumb[] | null {
  if (pathname.startsWith("/dashboard")) {
    return crumbsDashboard(pathname)
  }
  if (pathname.startsWith("/settings")) {
    return crumbsSettings(pathname)
  }
  return crumbsDocumentation(pathname)
}

/**
 * Один заголовок зоны: при ≥2 сегментах — крошки + название текущей страницы в одной строке (последний сегмент = h1).
 * Промежуточный сегмент без `href` — текст (название раздела).
 */
export function DashboardTitleArea({
  pathname,
  fallbackTitle,
}: {
  pathname: string
  fallbackTitle: string
}) {
  const items = getDashboardCrumbs(pathname)

  if (items && items.length >= 2) {
    return (
      <nav
        aria-label="Хлебные крошки"
        className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1"
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          const parentClass =
            "text-sm font-normal text-muted-foreground shrink-0"
          return (
            <React.Fragment key={`${item.label}-${i}`}>
              {i > 0 ? (
                <span
                  className="text-sm font-normal text-muted-foreground/40 select-none"
                  aria-hidden
                >
                  /
                </span>
              ) : null}
              {isLast ? (
                <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
                  {item.label}
                </h1>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={`${parentClass} hover:text-foreground transition-colors`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={parentClass}>{item.label}</span>
              )}
            </React.Fragment>
          )
        })}
      </nav>
    )
  }

  return (
    <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
      {fallbackTitle}
    </h1>
  )
}
