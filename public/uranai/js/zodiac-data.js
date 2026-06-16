/* =====================================================================
 *  12星座データ
 *  各星座の名前・英名・期間・キャッチコピー・画像パスを定義します。
 *  画像は assets/zodiac/<slug>.png を参照します。
 * ===================================================================== */

window.ZODIAC_DATA = [
  { slug: "aries",       jp: "牡羊座", en: "Aries",       symbol: "♈",
    from: [3, 21], to: [4, 19],  catch: "情熱と行動力で、未来を切り開く人。" },
  { slug: "taurus",      jp: "牡牛座", en: "Taurus",      symbol: "♉",
    from: [4, 20], to: [5, 20],  catch: "穏やかな心と揺るがぬ意志で、自分らしい価値を育む人。" },
  { slug: "gemini",      jp: "双子座", en: "Gemini",      symbol: "♊",
    from: [5, 21], to: [6, 21],  catch: "好奇心にあふれ、知性と会話で世界を広げる人。" },
  { slug: "cancer",      jp: "蟹座",   en: "Cancer",      symbol: "♋",
    from: [6, 22], to: [7, 22],  catch: "優しさと共感力で、大切な人を守る人。" },
  { slug: "leo",         jp: "獅子座", en: "Leo",         symbol: "♌",
    from: [7, 23], to: [8, 22],  catch: "自分らしく輝き、みんなを照らす人。" },
  { slug: "virgo",       jp: "乙女座", en: "Virgo",       symbol: "♍",
    from: [8, 23], to: [9, 22],  catch: "小さな気づきと工夫で、未来を整える人。" },
  { slug: "libra",       jp: "天秤座", en: "Libra",       symbol: "♎",
    from: [9, 23], to: [10, 23], catch: "美しさと調和を求め、心をつなぐ人。" },
  { slug: "scorpio",     jp: "蠍座",   en: "Scorpio",     symbol: "♏",
    from: [10, 24], to: [11, 22], catch: "深い愛情と直感で、本質を見抜く人。" },
  { slug: "sagittarius", jp: "射手座", en: "Sagittarius", symbol: "♐",
    from: [11, 23], to: [12, 21], catch: "自由を愛し、世界を広げていく人。" },
  { slug: "capricorn",   jp: "山羊座", en: "Capricorn",   symbol: "♑",
    from: [12, 22], to: [1, 19],  catch: "努力と責任感で、理想の未来を築く人。" },
  { slug: "aquarius",    jp: "水瓶座", en: "Aquarius",    symbol: "♒",
    from: [1, 20], to: [2, 18],  catch: "独創的な発想で、未来に希望をもたらす人。" },
  { slug: "pisces",      jp: "魚座",   en: "Pisces",      symbol: "♓",
    from: [2, 19], to: [3, 20],  catch: "優しさと直感で、夢のような世界を生きる人。" },
];

/* 月日（month, day）から星座を判定して返す */
window.getZodiacByDate = function (month, day) {
  for (const z of window.ZODIAC_DATA) {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (fm <= tm) {
      // 同年内に収まる期間
      if ((month === fm && day >= fd) || (month === tm && day <= td) ||
          (month > fm && month < tm)) {
        return z;
      }
    } else {
      // 年をまたぐ期間（山羊座 12/22〜1/19）
      if ((month === fm && day >= fd) || (month === tm && day <= td) ||
          (month > fm) || (month < tm)) {
        return z;
      }
    }
  }
  return null;
};
