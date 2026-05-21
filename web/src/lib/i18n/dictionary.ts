/**
 * Translation tables. Nested by feature/section.
 *
 * Add string keys flat enough that the same path resolves in both locales —
 * `resolve()` in locale.ts falls back to `en` if a key is missing in `ja`.
 */

export const en = {
  common: {
    appName: 'dexkepo',
    backToMap: 'Back to the map',
    goBack: 'Go back',
    loading: 'Loading…',
    save: 'Save',
    cancel: 'Cancel',
    clear: 'Clear',
    copy: 'Copy link',
    copied: 'Copied!',
  },
  header: {
    tagline: 'Pokémon manhole-cover dex',
    publicProfile: 'Public profile',
    profile: 'Profile',
    login: 'Log in',
    register: 'Sign up',
    logout: 'Log out',
    language: 'Language',
  },
  landing: {
    hero: {
      title: 'Find every Pokémon manhole cover in Japan.',
      tagline: '470 hand-painted poké-fúta. One personal dex. Track what you\'ve visited.',
      openMap: 'Open the map ↓',
      signUp: 'Sign up — track your dex',
      scrollCue: 'Scroll down',
    },
    features: {
      heading: 'What you can do',
      browse: {
        title: 'Browse all 470',
        body: 'Filter the map by prefecture or Pokémon.',
      },
      mark: {
        title: 'Mark visits as you go',
        body: 'Sign up, tap a cover, done.',
      },
      achieve: {
        title: 'Earn achievements',
        body: 'Streaks, regions, legendaries.',
      },
    },
    how: {
      heading: 'How it works',
      step1Title: 'Find a cover.',
      step1Body: 'Open the map, click any pin to see its Pokémon and address.',
      step2Title: 'Visit it.',
      step2Body: 'Tap "Open in Google Maps" for directions. Real-world step.',
      step3Title: 'Mark it.',
      step3Body: 'Tap "Mark as visited" — confetti, the marker glows green, your profile updates.',
    },
    footer: {
      product: 'dexkepo · personal Pokémon manhole-cover dex',
      attribution: 'Manhole imagery © The Pokémon Company · Tiles © OpenStreetMap / CARTO',
    },
  },
  map: {
    loaderCaption: 'Catching pokémon covers…',
    errorTitle: 'Could not load covers',
    retry: 'Try again',
  },
  error: {
    route: 'Route {status}',
    headline404: "It's not very effective…",
    headlineCrash: 'Critical hit!',
    sub404: "Wild {mascot} blocks your path. There's nothing on this route.",
    run: '← Run',
  },
};

export type Dictionary = typeof en;

export const ja: Dictionary = {
  common: {
    appName: 'dexkepo',
    backToMap: 'マップに戻る',
    goBack: '戻る',
    loading: '読み込み中…',
    save: '保存',
    cancel: 'キャンセル',
    clear: 'クリア',
    copy: 'リンクをコピー',
    copied: 'コピーしました！',
  },
  header: {
    tagline: 'ポケモンマンホール図鑑',
    publicProfile: '公開プロフィール',
    profile: 'プロフィール',
    login: 'ログイン',
    register: '新規登録',
    logout: 'ログアウト',
    language: '言語',
  },
  landing: {
    hero: {
      title: '日本中のポケモンマンホールをすべて見つけよう。',
      tagline: '手描きのポケふた470枚。あなただけの図鑑で、訪れた場所を記録しよう。',
      openMap: 'マップを開く ↓',
      signUp: '登録して図鑑を作る',
      scrollCue: '下にスクロール',
    },
    features: {
      heading: 'できること',
      browse: {
        title: '470枚すべてを見る',
        body: '都道府県やポケモンで絞り込めます。',
      },
      mark: {
        title: '訪問を記録',
        body: '登録して、マンホールをタップするだけ。',
      },
      achieve: {
        title: '実績を解除',
        body: '連続記録、地方、伝説のポケモン。',
      },
    },
    how: {
      heading: '使い方',
      step1Title: 'マンホールを探す。',
      step1Body: 'マップを開き、ピンをタップしてポケモンと住所を確認。',
      step2Title: '実際に訪れる。',
      step2Body: '「Google マップで開く」で道順を表示。現地に行こう。',
      step3Title: '記録する。',
      step3Body: '「訪問済みにする」をタップ — 紙吹雪が舞い、ピンが緑に光り、プロフィールが更新されます。',
    },
    footer: {
      product: 'dexkepo · ポケモンマンホール個人図鑑',
      attribution: 'マンホール画像 © 株式会社ポケモン · タイル © OpenStreetMap / CARTO',
    },
  },
  map: {
    loaderCaption: 'マンホールを集めています…',
    errorTitle: 'マンホールを読み込めませんでした',
    retry: '再試行',
  },
  error: {
    route: 'ルート {status}',
    headline404: 'こうかは いまひとつの ようだ…',
    headlineCrash: 'きゅうしょに あたった！',
    sub404: '野生の{mascot}が立ちふさがる。このルートには何もない。',
    run: '← にげる',
  },
};

export const dict: Record<'en' | 'ja', Dictionary> = { en, ja };
