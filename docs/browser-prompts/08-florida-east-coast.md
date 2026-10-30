# 役割
あなたは American Mahjong Guide(mahjong-map.com、米国向け英語サイト)の調査担当です。実際の Chrome を操作して、下のリストの各団体・講師について「American Mahjong(NMJL ルール)をやっているか」「今後参加できる日程があるか」を、その団体自身のページで確認し、結果を決まった形式で返してください。サイトの掲載ルールは「American Mahjong であることが団体自身の言葉で確認できること」です。推測では ACTIVE にしません。

# やること(各行について)
1. 下の表の名前とヒントで、Facebook のページ(About・イベント・投稿)と Instagram のアカウント(プロフィール文・直近の投稿のキャプション・ハイライト)を探して読む。見つからなければ Google で団体名+都市を検索して、**その団体自身のページ**(公式サイト、予約ページ、会場のイベントページ)を探す。ディレクトリ(BamBuddies、Mahjong 4 Friends)と、Bam Good Time が団体に用意するページそのもの(`*.bamgoodtime.com`)は、American / NMJL の**明記が書かれていない限り**根拠にならない。
2. そのページで次を確認する。
   - **American / NMJL / National Mah Jongg League / "the card" の明記**があるか。あれば、その一文を**一字一句そのまま**引用する(日本語に訳さない)。「mahjong」とだけ書いてあるものは確認できたことにしない。riichi / Hong Kong / Chinese / Taiwanese だけのものは INACTIVE(別の種類)。
   - 参加できるか(会員限定・招待制・閉鎖していない。個人宅だけで開催していない)。
   - **今日以降の日付・開始時刻・会場名(住所)** のあるセッション。年が書かれていないものは、曜日と日付が合う年(2026 か 2027)で判断し、確信がなければ書かない。
3. 会場が公開の場所か(図書館、店、レストラン、ブルワリー、寺院・教会・JCC、公民館)。**個人宅・非公開の住所は書かない**(venue_is_public=N、住所欄は空)。

# 守ること
- **Facebook と Instagram には、すでにログイン済みの私のアカウントで見てよい。ただし読むだけ**: 「いいね」「フォロー」「コメント」「投稿」「メッセージ」「友達申請」「グループへの参加申請」「イベントの参加表明(行く/興味あり)」は**一切しない**。参加していないグループは中身を読まず、「非公開グループ」と書く。
- 見るのは**団体・店・施設のページ/アカウント**だけ。個人のタイムライン、個人のプロフィール、コメント欄の個人名は見ない・書かない。
- 1 つのページにつき、About(概要)、イベント(Events)、直近の投稿 10 件までを、人が読む速さでゆっくり見る。大量に連続で開かない。ログイン確認、CAPTCHA、「不審なアクティビティ」の警告が出たら**その場で止めて**、止まった所までの結果を返す。
- 個人の電話番号・メールアドレス・個人の SNS アカウント名は結果に書かない(団体・店・施設の公式サイト、ページ、アカウントの URL は書いてよい)。
- 1 行あたり長くても 5 分程度で切り上げる。見つからなければ UNCONFIRMED として、調べたページを notes に書く。ページが読めない(ログイン壁・ブロック)ときもそう書く。
- **同じ団体が下の「すでに掲載済み」にもある場合は DUPLICATE と答える**(前回、こちらにすでにある団体を別名で答え直したものが 4 件あった)。会場だけの店(レストランなど)が、巡回してくる別のクラブの会場になっているだけのときも、そのクラブ名を DUPLICATE_OF に書く。
- 同じ団体が別名で複数ある場合は、リストの name をそのまま使って各行に答える(統合は私がやる)。
- 都市はリストの metro 名のまま(郊外の会場でも city 列は変えない)。実際の町名は venue に書く。

# 返す形式
CSV を 1 つのコードブロックで返す(ヘッダーあり、値にカンマや改行があるときは二重引用符で囲む)。列は次のとおり。

name_exact,type,city,state,verdict,evidence_quote,evidence_url,own_website,venue_name_and_address,venue_is_public,beginner_friendly,next_sessions,notes

- name_exact: リストの name をそのままコピー
- verdict: ACTIVE(American を団体自身の言葉で確認、参加できる) / INACTIVE(別の種類・閉鎖・会員限定・個人宅のみ) / UNCONFIRMED(確認できない) / DUPLICATE(下の「すでに掲載済み」のどれかと同じ団体・同じ会場。notes に `DUPLICATE_OF: <掲載済みの名前>` と書く)
- next_sessions: `YYYY-MM-DD HH:MM|セッション名|会場名|URL` を `;` でつなぐ(なければ空)
- notes: 調べたページ、迷った点、リストにない新しい団体を見つけたらその名前と URL(新しい団体は別の行 `NEW:` で書いてよい)
CSV のあとに、日本語で 5 行以内の要約(ACTIVE にできた数、詰まった理由)を付ける。



# 今回のリスト(フロリダ東海岸と The Villages の新しい都市。32 件)
これらの町はサイトに載っていない新しい都市です。**どの団体も、まだ American / NMJL かどうかを確認できていません**(手がかりはディレクトリや図書館・センターの掲載だけ)。Google 検索に加えて、ログイン済みの Facebook / Instagram で、団体・施設自身のページ(図書館や JCC、コミュニティセンターのイベントページも可)を読んでください。投稿の引用は原文のまま、その URL を evidence_url に入れます。**必ず開いた本文から引用**し、ハッシュタグだけは UNCONFIRMED 寄りで答えてください。

The Villages は退職者向けの大きなコミュニティで、Villages Recreation の講座やクラブは**住民・会員向けの可能性**があります。一般の人が参加できるか(居住者限定か)を必ず書いてください(居住者限定なら verdict=INACTIVE)。

## すでに掲載済み(同じものは DUPLICATE と答える)
- West Palm Beach: Boca Raton History Museum Mahjong (club) など。この一覧の Boca Raton の行が同じ団体なら DUPLICATE_OF に書く。

| # | type | name_exact | city | state | 既知のURL | 手がかり |
|---|---|---|---|---|---|---|
| 1 | club | American Mahjong in The Villages, Florida | The Villages | FL | - | Recurring group; schedule not published (contact host to confirm) |
| 2 | club | Mah Jongg 101: Beginners (Villages Recreation) | The Villages | FL | - | Beginner class via The Villages Recreation & Parks (district gov registration) |
| 3 | club | Mah-Jongg - Meet Others Open House Socials (Truman Rec Center) | The Villages | FL | - | Open-house socials at Truman Recreation Center (Villages district gov) |
| 4 | club | Mah-Jongg groups at Villages Recreation Centers (Canal St / Laurel Manor / Colony Cottage / Fish Hawk) | The Villages | FL | - | Recurring resident play; Tuesdays at multiple rec centers; beginners group Thursday mornings at Fish Hawk |
| 5 | club | Mahjong in The Villages, FL (Facebook group) | The Villages | FL | - | Community group for finding/organizing local mahjong play |
| 6 | instructor | School of American Mah Jongg (Debbie Barnett) | The Villages | FL | - | By scheduled class / online interactive lessons; beginner & advanced |
| 7 | club | Levis JCC Phyllis & Harvey Sandler Center - Beginner Mah Jongg | Boca Raton | FL | - | Beginner lessons (Deborah Aronstam), Mondays & Wednesdays 10:00am-12:00pm; 2-week sessions |
| 8 | club | Patch Reef Park Community Center - Mah Jongg & Canasta | Boca Raton | FL | - | Open games Mondays 10:30am-1:30pm, $20/person (listed as on hold - confirm) |
| 9 | club | Temple Beth El of Boca Raton - Mah Jongg Day Circle | Boca Raton | FL | - | Mah Jongg Day Circle (advanced players); recurring temple program |
| 10 | club | American Mahjong Boca Raton group (directory) | Boca Raton | FL | - | Beginner classes Boca Raton (player-listed group) |
| 11 | instructor | Mahj on the Beach (Kari Long) | Boca Raton | FL | - | Beginner lessons, parties, and casual social meetups across South Florida; booked on-demand |
| 12 | instructor | Intro to the School of American Mahj Jongg Boca Raton (AMJA directory) | Boca Raton | FL | - | Beginner classes (4 classes x 2 hours), advanced beginner-intermediate; sign up via mahjongteacher.com |
| 13 | instructor | Mahjong Lessons East To West Boca Raton | Boca Raton | FL | - | All-levels private and group lessons, flexible hours/places |
| 14 | instructor | Set The Mahj | Boca Raton | FL | - |  |
| 15 | instructor | Robin Tartarkin | Boca Raton | FL | - |  |
| 16 | club | Mandel JCC Boynton Beach - American Mah Jongg classes | Boynton Beach | FL | - | American Mah Jongg classes Fridays from 9-10am; series $175; no experience needed |
| 17 | club | American Mahjong Boynton Beach (directory) | Boynton Beach | FL | - | Listed mahjong group; schedule not specified (contact via directory) |
| 18 | instructor | Pam Anderson | Boynton Beach | FL | - |  |
| 19 | club | Delray Beach Public Library - Mahjong Club Open Play | Delray Beach | FL | - | Open play Fridays 10am-12pm (June/July 2026 dates); knowledge encouraged; registration required |
| 20 | club | Delray Beach Public Library - Mahjong Instructional Play (Instructor Eileen) | Delray Beach | FL | - | Thursdays 10am-12pm (instructional, all levels); registration required |
| 21 | club | American Mah Jongg Delray Beach group | Delray Beach | FL | - | Established home group seeking additional players for game of 14 |
| 22 | instructor | Diane Engel | Delray Beach | FL | - |  |
| 23 | instructor | Judy Levine-Maizels | Delray Beach | FL | - | Directory note: "I have been teaching American Mah Jongg to both small and large groups for many years in Virginia, and I recently relocated to Florida. I would love to t |
| 24 | club | Jupiter Community Center Mah Jongg group (Nancy Z) | Jupiter | FL | - | Fridays 12:30-3:00pm; new mahjong group at 200 Military Trail |
| 25 | club | American Mahjong Jupiter (directory) | Jupiter | FL | - | Listed mahjong group; schedule not specified |
| 26 | instructor | MissionMahj | Jupiter | FL | https://www.missionmahj.com |  |
| 27 | club | Lake Worth Beach Public Library - Mah Jongg (Lesley) | Lake Worth | FL | - | 2nd and 4th Thursdays 12:30-4:00pm |
| 28 | club | American Mah Jongg Lake Worth monthly group | Lake Worth | FL | - | 1st Thursday of every month |
| 29 | club | Palm Beach Mahjong (Giuliana Sisk) - Open Play @ DU Home Collection | Palm Beach Gardens | FL | - | Open Play alternating Fridays & Saturdays 11am-1pm at DU Home Collection (a home-decor shop; not yet in our database, so treat as a new lead) |
| 30 | club | Burns Road Community Center - Mah Jongg social play (PBG Senior Programs) | Palm Beach Gardens | FL | - | Mah Jongg social play Tue/Thu/Fri 12:00-4:00pm; ages 50+; all levels (instructor Sarah Brodie for classes) |
| 31 | club | Mandel JCC Palm Beach Gardens - American Mah Jongg classes | Palm Beach Gardens | FL | - | American Mah Jongg classes Fridays; series $175; Mah Jongg & Canasta open play |
| 32 | club | American Mahjong Palm Beach Gardens (directory) | Palm Beach Gardens | FL | - | Listed mahjong group; schedule not specified |
