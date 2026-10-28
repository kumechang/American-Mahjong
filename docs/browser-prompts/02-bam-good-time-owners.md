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

# 今回のリスト(Bam Good Time のページだけがある団体。American の記載が見つかっていない)
34行(Fort Worth、Downers Grove、Aurora、Little Rock、Alexandria、Cumming、Fredericksburg、Marietta、Sarasota、Birmingham、New Orleans ほか)。known URL は Bam Good Time のページで、中身(説明文・イベント詳細)は JavaScript で出るため機械では読めていない。**まずその Bam Good Time ページを Chrome で開き**、クラブの説明文、イベント一覧の各イベントを開いて説明文に American / NMJL / "card" の語があるかを読む。それでも分からなければ、団体名で検索して Instagram・公式サイト・会場のイベントページを探す。イベントの詳細が 2〜3 件読めたら、同じクラブの他の日程は省略してよい(next_sessions は直近 5 件まで)。

| # | type | name_exact | city | state | known URL | hint from our database |
|---|---|---|---|---|---|---|
| 1 | club | Del Ray Mahjong | Alexandria | VA | https://del-ray-mah-jongg.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 2 | club | Westgrove Mahjong Club | Alexandria | VA | https://westgrove-mahjing-club.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 3 | club | Mama Behr Mahj | Aurora | CO | https://mama-behr-mahj.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 4 | club | TriSARAtop Mahj | Aurora | CO | https://trisaratop.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 5 | club | Meet Me For Mahj | Aurora | CO | https://meetmeformahj.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 6 | club | Bakersfield Mah Jongg Group | Bakersfield | CA | https://bakersfield.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 7 | club | Four Winds Mah Jongg Birmingham | Birmingham | AL | https://four-winds-mah-jongg-birmingham.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 8 | club | One Bam Bourbon | Birmingham | AL | https://one-bam-bourbon.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 9 | club | The Mahj Table | Birmingham | AL | https://mahjtable.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 10 | club | CaryCracks | Cary | NC | https://carycracks.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 11 | club | Alpine Mahjong | Colorado Springs | CO | https://alpinemahjong.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 12 | club | Pine + Pigment | Cumming | GA | https://pineandpigment.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 13 | club | KS Tile Society | Downers Grove | IL | https://kstilesociety.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 14 | club | Tile GGirls | Downers Grove | IL | https://tile-ggirls.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 15 | club | Lamb & Co. | Downers Grove | IL | https://lamb.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 16 | club | Lucky Tiles League | Downers Grove | IL | https://lucky-tiles-league.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 17 | club | Bam Good Time Fort Worth | Fort Worth | TX | https://bamgoodtimefw.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 18 | club | Mahj Gone Wild! | Fort Worth | TX | https://mahjgonewild.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 19 | club | The Fort Mahj club | Fort Worth | TX | https://the-fort-mahj-society.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 20 | club | Vickie Charm's Mahjong Social Parlor | Fort Worth | TX | https://vickiecharm-fwtx-mahjongsocialparlor.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 21 | club | Dragón 152 Club | Fredericksburg | VA | https://drag-n-152-club.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 22 | club | Mum and Me Mahjong | Georgetown | TX | https://mum-and-me-mahjong.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 23 | club | Devine Mahjong | Little Rock | AR | https://devine-mahjong-little-rock-ar.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 24 | club | Little Rock Mahj Club | Little Rock | AR | https://little-rock-mahj-club.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 25 | club | Mahjong Fun | Little Rock | AR | https://mahjongfun.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 26 | club | Mahj and Mingle | Marietta | GA | https://mahj-and-mingle.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 27 | club | MahjMarine | New Orleans | LA | https://mahjmarine.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 28 | club | NOLA Mahj | New Orleans | LA | https://nola-mahj.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 29 | club | Peachtree Mahjong Club/ Open Hand Mahjong | Newnan | GA | https://open-hand-mahjong.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 30 | club | Mahj & Mingle SRQ | Sarasota | FL | https://mahjminglesrq.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 31 | club | Mahj Girl Society | Sarasota | FL | https://mahjgirlsocietylwr.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 32 | club | Srq MahJongg | Sarasota | FL | https://srq-mahjongg.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 33 | club | Tiles and Tones Mahjong | Wayzata | MN | https://tiles-and-tones-mahjong.bamgoodtime.com | American/NMJL not stated on the club's page. |
| 34 | instructor | Karen Kent | Sarasota | FL | - | Directory listing only: certified teacher; small groups 4 weeks / 2 hours each. American/NMJL not verified; no website or public contact. |
