# 役割
あなたは American Mahjong Guide(mahjong-map.com、米国向け英語サイト)の調査担当です。実際の Chrome を操作して、下のリストの各団体・講師について「American Mahjong(NMJL ルール)をやっているか」「今後参加できる日程があるか」を、その団体自身のページで確認し、結果を決まった形式で返してください。サイトの掲載ルールは「American Mahjong であることが団体自身の言葉で確認できること」です。推測では ACTIVE にしません。

# やること(各行について)
1. 団体名と都市・州で Google 検索(または名前で Instagram / Facebook / Eventbrite / Meetup を検索)して、**その団体自身のページ**を探す(公式サイト、Instagram、公開の Facebook ページ、予約ページ、会場のイベントページ)。ディレクトリ(BamBuddies、Mahjong 4 Friends、Bam Good Time の一覧)は根拠にならない。
2. そのページで次を確認する。
   - **American / NMJL / National Mah Jongg League / "the card" の明記**があるか。あれば、その一文を**一字一句そのまま**引用する(日本語に訳さない)。「mahjong」とだけ書いてあるものは確認できたことにしない。riichi / Hong Kong / Chinese / Taiwanese だけのものは INACTIVE(別の種類)。
   - 参加できるか(会員限定・招待制・閉鎖していない。個人宅だけで開催していない)。
   - **今日以降の日付・開始時刻・会場名(住所)** のあるセッション。年が書かれていないものは、曜日と日付が合う年(2026 か 2027)で判断し、確信がなければ書かない。
3. 会場が公開の場所か(図書館、店、レストラン、ブルワリー、寺院・教会・JCC、公民館)。**個人宅・非公開の住所は書かない**(venue_is_public=N、住所欄は空)。

# 守ること
- ログインしない。アカウントを作らない。Facebook グループには参加しない(公開で見える範囲だけ)。問い合わせフォームの送信、メッセージ、コメント、フォローは**しない**。
- 個人の電話番号・メールアドレス・個人の SNS アカウント名は結果に書かない(団体・店・施設の公式サイトの URL は書いてよい)。
- 1 行あたり長くても 5 分程度で切り上げる。見つからなければ UNCONFIRMED として、調べたページを notes に書く。ページが読めない(ログイン壁・ブロック)ときもそう書く。
- 同じ団体が別名で複数ある場合は、リストの name をそのまま使って各行に答える(統合は私がやる)。
- 都市はリストの metro 名のまま(郊外の会場でも city 列は変えない)。実際の町名は venue に書く。

# 返す形式
CSV を 1 つのコードブロックで返す(ヘッダーあり、値にカンマや改行があるときは二重引用符で囲む)。列は次のとおり。

name_exact,type,city,state,verdict,evidence_quote,evidence_url,own_website,venue_name_and_address,venue_is_public,beginner_friendly,next_sessions,notes

- name_exact: リストの name をそのままコピー
- verdict: ACTIVE(American を団体自身の言葉で確認、参加できる) / INACTIVE(別の種類・閉鎖・会員限定・個人宅のみ) / UNCONFIRMED(確認できない)
- next_sessions: `YYYY-MM-DD HH:MM|セッション名|会場名|URL` を `;` でつなぐ(なければ空)
- notes: 調べたページ、迷った点、リストにない新しい団体を見つけたらその名前と URL(新しい団体は別の行 `NEW:` で書いてよい)
CSV のあとに、日本語で 5 行以内の要約(ACTIVE にできた数、詰まった理由)を付ける。

# 今回のリスト(Eventbrite に出ていた主催者。イベントページに American の記載が見つかっていない)
25行。known URL は Eventbrite のイベントページ。まずそのイベントページと**主催者ページ(Organizer のリンク)**を開き、説明文・FAQ・画像内の文字まで読む。次に主催者名で検索して公式サイト・Instagram・公開 Facebook を探す。書店・店・病院・教会など会場そのものが主催者のものは、**その会場が定期的に American のゲームを開催しているか**を確認する(単発のイベントだけなら UNCONFIRMED)。

| # | type | name_exact | city | state | known URL | hint from our database |
|---|---|---|---|---|---|---|
| 1 | club | Shannon DiBiasi | Gilbert | AZ | https://www.eventbrite.com/e/mahjong-101-at-garage-east-tickets-2002238286614 | Eventbrite organiser; e.g. Mahjong 101 at Garage East (2026-11-05) at Garage-East Wine and Coffee, 3000 East Ray Road, Gilbert, AZ |
| 2 | club | Mahjong  Los Angeles | Los Angeles | CA | https://www.eventbrite.com/e/american-mahjong-open-play-at-homestate-sherman-oaks-x-mahj-los-angeles-tickets-1998311437302 | Eventbrite organiser; e.g. American Mahjong Open Play at Homestate Sherman Oaks x Mahj Los Angeles (2026-11-03) at HomeState, 13424 Ventura Boulevard, Los Angeles, CA |
| 3 | club | Clifton's DTLA | Los Angeles | CA | https://www.eventbrite.com/e/dtla-mahjong-social-tickets-2002481637483 | Eventbrite organiser; e.g. DTLA Mahjong Social (2026-11-01) at Clifton's DTLA, 648 South Broadway, Los Angeles, CA |
| 4 | club | SoCalMoms.com | Los Angeles | CA | https://www.eventbrite.com/e/holiday-mahj-mingle-with-socalmoms-mahjong-los-angeles-tickets-2003575542382 | Eventbrite organiser; e.g. Holiday Mahj & Mingle with SoCalMoms & Mahjong Los Angeles (2026-12-04) at Bacari Sherman Oaks, 14106 Ventura Boulevard, Los Angeles, CA |
| 5 | club | Cal Poly Experience Industry Management Team | San Luis Obispo | CA | https://www.eventbrite.com/e/light-up-the-night-american-mahjong-fundraiser-tickets-2003025990658 | Eventbrite organiser; e.g. Light up the Night American Mahjong Fundraiser (2026-11-09) at 2990 Dairy Creek Rd, San Luis Obispo, CA |
| 6 | club | Mahjong  Los Angeles | Santa Monica | CA | https://www.eventbrite.com/e/mahjong-open-play-at-homestate-santa-monica-x-mahjong-los-angeles-tickets-1998312475407 | Eventbrite organiser; e.g. Mahjong Open Play at HomeState Santa Monica  x Mahjong Los Angeles (2026-11-18) at HomeState, 720 Wilshire Boulevard, Santa Monica, CA |
| 7 | club | Santa Monica Public Library | Santa Monica | CA | https://www.eventbrite.com/e/mahjong-at-main-november-2026-tickets-1999306839577 | Eventbrite organiser; e.g. Mahjong at Main November 2026 (2026-11-18) at Santa Monica Public Library, 601 Santa Monica Boulevard, Santa Monica, CA |
| 8 | club | flor. coffee + books | Washington | DC | https://www.eventbrite.com/e/analog-dinner-nights-mahjong-tickets-1994586969318 | Eventbrite organiser; e.g. Analog Dinner Nights: Mahjong! (2026-11-12) at Flor Coffee + Books, 1220 31st Street Northwest, Washington, DC |
| 9 | club | KAMA DC Team | Washington | DC | https://www.eventbrite.com/e/tiles-and-taps-mahjong-101-with-jennie-mak-tickets-2003713013562 | Eventbrite organiser; e.g. Tiles and Taps: Mahjong 101 with Jennie Mak! (2026-11-11) at Lost Generation Brewing Company, 327 S Street Northeast, Washington, DC |
| 10 | club | CAMDC | Washington | DC | https://www.eventbrite.com/e/friday-night-mahjong-club-fall-edition-nov-7th-originally-on-nov-6-th-tickets-2002971296065 | Eventbrite organiser; e.g. Friday Night Mahjong Club FALL EDITION - Nov 7th (Originally on Nov 6 th) (2026-11-07) at 729 15th St NW, Washington, DC |
| 11 | club | The Stacks | Washington | DC | https://www.eventbrite.com/e/mahjong-at-the-stacks-tickets-1998493476787 | Eventbrite organiser; e.g. Mahjong at The Stacks (2026-10-28) at The Stacks, 101 V Street Southwest, Washington, DC |
| 12 | club | Magie Wine Bar | Miami | FL | https://www.eventbrite.com/e/mahjong-at-magie-wine-bar-presented-by-tyku-sake-tickets-2003417897863 | Eventbrite organiser; e.g. Mahjong at Magie Wine Bar Presented by TYKU Sake (2026-11-10) at Magie, 8281 Northeast 2nd Avenue, Miami, FL |
| 13 | club | Mahjong Club Miami | Miami | FL | https://www.eventbrite.com/e/mahjong-club-miami-tickets-2003470869302 | Eventbrite organiser; e.g. MAHJONG CLUB MIAMI (2026-11-02) at Zoko collective, 728 NW 29th St,, Miami, FL |
| 14 | club | The Pink House Events | Havre De Grace | MD | https://www.eventbrite.com/e/masquerade-mah-jongg-tickets-2003309069354 | Eventbrite organiser; e.g. Masquerade Mah Jongg (2026-10-28) at Battery Island Brewing Company, 101a North Washington Street, Havre de Grace, MD |
| 15 | club | House of the Redeemer | New York | NY | https://www.eventbrite.com/e/carnegie-hill-mahjong-tickets-1999784261559 | Eventbrite organiser; e.g. CARNEGIE HILL MAHJONG (2026-11-19) at House of the Redeemer, 7 East 95th Street, New York, NY |
| 16 | club | sotrudles mahjong | Cincinnati | OH | https://www.eventbrite.com/e/mahjong-101-with-sotrudles-at-jackie-os-tickets-1995470144920 | Eventbrite organiser; e.g. Mahjong 101 with sotrudles at Jackie O's (2026-11-14) at Jackie O's Needlepoint, 3914 Oak Street, Cincinnati, OH |
| 17 | club | LAVA HOUSTON | Houston | TX | https://www.eventbrite.com/e/lava-friendsgiving-mahjong-luncheon-tickets-2003578972642 | Eventbrite organiser; e.g. Lava / Friendsgiving Mahjong Luncheon (2026-11-11) at 9705 Westheimer Rd, Houston, TX |
| 18 | club | Sunday Press | Houston | TX | https://www.eventbrite.com/e/mahjong-monday-every-first-monday-of-the-month-tickets-1981385057043 | Eventbrite organiser; e.g. Mahjong Monday!  Every first Monday of the Month! (2026-11-02) at Sunday Press, 3315 Ella Boulevard, Houston, TX |
| 19 | club | Texas Medical Center | Houston | TX | https://www.eventbrite.com/e/mahjong-margaritas-tickets-1990907259206 | Eventbrite organiser; e.g. Mahjong & Margaritas (2026-12-08) at TMC3 Collaborative Building, 7255 Helix Park Avenue, Houston, TX |
| 20 | club | Young Professionals in Energy (YPE) | Houston | TX | https://www.eventbrite.com/e/ype-houston-ladies-happy-hour-mahjong-mingle-tickets-2003022415966 | Eventbrite organiser; e.g. YPE Houston Ladies Happy Hour: Mahjong & Mingle! ️ (2026-11-19) at BASH, 6203 Edloe Street, Houston, TX |
| 21 | club | Auntie Up Program | Houston | TX | https://www.eventbrite.com/e/dim-sum-and-democracy-tickets-2003840017434 | Eventbrite organiser; e.g. Dim Sum and Democracy (2026-11-02) at Golden Dim Sum, 10600 Bellaire Boulevard, Houston, TX |
| 22 | club | White House Winery | Hye | TX | https://www.eventbrite.com/e/mahj-high-tea-tickets-2003115870491 | Eventbrite organiser; e.g. Mahj & High Tea (2026-10-31) at White House Winery, 11247 US Hwy 290, Hye, TX |
| 23 | club | Cancer StrongHER | Keller | TX | https://www.eventbrite.com/e/cancer-strongher-mahjong-open-play-october-28-2026-tickets-2002486348574 | Eventbrite organiser; e.g. Cancer StrongHER Mahjong Open Play — October 28,  2026 (2026-10-28) at Cancer StrongHER, 10349 Alta Vista Road, Keller, TX |
| 24 | club | Peacock & Palm | Alexandria | VA | https://www.eventbrite.com/e/midday-mahj-beginners-table-tickets-2003883816438 | Eventbrite organiser; e.g. Midday Mahj! Beginner's Table (2026-10-27) at Ada's on the River, 3 Pioneer Mill Way, Alexandria, VA |
| 25 | club | Woodhouse Day Spa - Gainesville | Gainesville | VA | https://www.eventbrite.com/e/mahj-mingle-give-thanks-tickets-2003596805982 | Eventbrite organiser; e.g. Mahj, Mingle, & Give Thanks (2026-11-17) at Woodhouse Spa - Gainesville, Stonewall Shops Square, Gainesville, VA, USA, 8114 Stonewall Shops Square, Gainesville, VA |
