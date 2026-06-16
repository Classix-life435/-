/* =====================================================================
 *  設定ファイル（ここだけ書き換えればOK）
 *  ---------------------------------------------------------------------
 *  SNS / LINE のリンク先が決まったら、下の値を差し替えてください。
 *  それ以外のファイルは触らなくて大丈夫です。
 * ===================================================================== */

window.APP_CONFIG = {
  /* このアプリを公開するURL（シェア用リンクに使われます）。
     例: "https://classix-life435.github.io/-/"
     未設定（""）の場合は、開いているページのURLを自動で使います。 */
  shareBaseUrl: "",

  /* LINE 公式アカウントの「友だち追加」URL
     例: "https://lin.ee/xxxxxxx" や "https://line.me/R/ti/p/@xxxxxxx" */
  lineAddUrl: "https://lin.ee/your-line-id",

  /* X（旧Twitter）アカウントのURL（プロフィールへのリンク用） */
  xAccountUrl: "https://x.com/your_account",

  /* Instagram アカウントのURL */
  instagramUrl: "https://www.instagram.com/your_account/",

  /* シェアするときの文言（{sign} は星座名に置き換わります） */
  shareText: "私の星座は「{sign}」でした✨ あなたの星座も占ってみてね🌙",

  /* 「一人に一度だけ」をオフにしてテストしたいときは false にします（本番は true） */
  oncePerPerson: true,
};
