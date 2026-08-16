export const shellCardClass =
  'rounded-2xl bg-[var(--shell-surface)] shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)]'

export const shellCardInteractiveClass =
  `${shellCardClass} transition hover:shadow-[var(--shell-shadow)] hover:ring-[var(--shell-accent)]/20`

export const shellPageEyebrowClass = 'text-sm font-bold text-[var(--shell-accent)]'

export const shellPageTitleClass = 'font-extrabold text-[var(--shell-text)]'

export const shellPageSubtitleClass = 'text-sm leading-7 text-[var(--shell-text-muted)]'

export const shellSectionTitleClass = 'text-base font-extrabold text-[var(--shell-text)]'

export const shellBodyTextClass = 'text-sm text-[var(--shell-text-muted)]'

export const shellSubtleTextClass = 'text-xs text-[var(--shell-text-subtle)]'

export const shellInputClass =
  'rounded-xl bg-[var(--shell-input-bg)] text-[var(--shell-text)] outline-none placeholder:text-[var(--shell-text-subtle)] focus:ring-2 focus:ring-[var(--shell-accent)]/30'

export const shellSearchInputClass = `h-11 w-full ${shellInputClass} pr-10 pl-4 text-sm`

export const shellAccentButtonClass =
  'inline-flex items-center gap-2 rounded-xl bg-[var(--shell-accent)] px-5 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] shadow-[var(--shell-shadow-accent)] transition hover:brightness-110'

/** Same size as accent; border + accent text (secondary CTA). */
export const shellOutlineButtonClass =
  'inline-flex items-center gap-2 rounded-xl border border-[var(--shell-accent)] bg-transparent px-5 py-3 text-sm font-bold text-[var(--shell-accent)] transition hover:bg-[var(--shell-accent-bg)]'

export const shellGhostButtonClass =
  'rounded-xl bg-[var(--shell-input-bg)] px-4 py-2 text-xs font-bold text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)]'

export const shellAccentSoftButtonClass =
  'inline-flex items-center gap-1.5 rounded-xl bg-[var(--shell-accent-bg)] px-4 py-2 text-xs font-bold text-[var(--shell-accent)] transition hover:bg-[var(--shell-accent-bg-strong)]'

export const shellTabsBarClass = 'flex items-center gap-6 border-b border-[var(--shell-border)]'

export const shellTabButtonClass = (active) =>
  `relative pb-3 text-sm font-bold transition ${
    active ? 'text-[var(--shell-accent)]' : 'text-[var(--shell-text-muted)] hover:text-[var(--shell-text)]'
  }`

export const shellTabIndicatorClass =
  'absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--shell-accent)]'

export const shellModalPanelClass =
  'my-auto w-full max-h-[min(90dvh,920px)] overflow-y-auto rounded-2xl bg-[var(--shell-surface)] p-6 shadow-[var(--shell-shadow)] ring-1 ring-[var(--shell-border)]'

export const shellModalOverlayClass =
  'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/60 p-4 backdrop-blur-[2px]'

/** Legacy/custom modal overlays (non-shell token panels). */
export const customModalOverlayClass =
  'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/45 p-4'

export const customModalOverlayMutedClass =
  'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/40 p-4'

/** Keep custom white panels inside the viewport; scroll inside the panel. */
export const customModalPanelSafeClass = 'my-auto max-h-[min(90dvh,920px)] overflow-y-auto'

/**
 * Horizontal scroll for wide tables only.
 * Requires a width-bounded ancestor (min-w-0 / overflow-hidden host).
 */
export const shellTableScrollClass =
  'min-w-0 w-full max-w-full overflow-x-auto overscroll-x-contain'

/** Outer host for a scrollable table (card/section). */
export const shellTableHostClass = 'min-w-0 max-w-full overflow-hidden'

export const shellIconWrapClass =
  'flex items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]'

export const shellDividerClass = 'border-[var(--shell-border)]'
