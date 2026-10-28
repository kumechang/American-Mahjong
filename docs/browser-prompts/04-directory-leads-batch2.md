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

# 今回のリスト(ディレクトリにだけ載っている団体。自分のサイトが分かっていない)
New Orleans / Memphis / Hartford / Indianapolis / Louisville の 5 都市、41行。どの都市も公開基準(ACTIVE 5 行)まであと 2 行です。hint は BamBuddies / Mahjong 4 Friends の記述で、日程・場所の手がかりとして使ってよいが、それ自体は根拠にならない。優先順位は New Orleans、Memphis、Hartford の順。

## すでに掲載済み(同じものは DUPLICATE と答える)
- New Orleans: Fleur de Mahj; New Orleans JCC Mah Jongg; Fleur de Mahj / Sheila (instructor)
- Memphis: Emmanuel Mahjong; Vicki Campbell / MahJ Memphis (instructor); Pat Ford / MahJ Squad 901 (instructor)
- Hartford: River Bend Bookshop; Linda Houde (instructor)
- Indianapolis: Fishers Mah Jongg Center; 317 Mahj Collective; Jaime Keith / Meet at Mahj (instructor)
- Louisville: Douglass Community Center American Mah Jongg; Sissy W. (instructor); Mahjong Queens (instructor)

| # | type | name_exact | city | hint |
|---|---|---|---|---|
| 1 | club | Mardijong Mondays (Kaylee Rongey) | New Orleans | Every Monday night (~13 tables, ~50 players), registration required |
| 2 | club | East Bank Regional Library Mah-jong for Fun | New Orleans | Almost every Tuesday, 2:00-4:00pm, free open play/learn |
| 3 | club | New Orleans JCC - Mah Jongg Classes | New Orleans | Six-session beginner series, multiple sessions June-August (Mon-Wed Uptown, Mon-Tue Metairie) |
| 4 | club | NOLA Mahjong Classic (Trinity Episcopal Church) | New Orleans | Annual tournament, Oct 23-24 2026 (2nd annual) |
| 5 | club | Mahj at the Museum (New Orleans Museum of Art) | New Orleans | Annual fundraiser tournament & social play, Sept 27-28 2026 |
| 6 | club | Mahjong for a Mission (Hearts for Healing) | New Orleans | Charity event with open play + beginner lessons, Apr 12 2026 |
| 7 | club | New Orleans Mah-Jongg American Style Meetup | New Orleans | Meetup group (no current events scheduled - confirm before attending) |
| 8 | instructor | Mahjong Orleans | New Orleans | Lessons & events by request (southern-hospitality focus) |
| 9 | instructor | Mahj My Way | New Orleans |  |
| 10 | club | Mahjong Monday at Pike & West | Memphis | Weekly, Mondays 6:30-9:00 PM |
| 11 | club | Memphis Jewish Community Center (Mah Jongg classes) | Memphis | Beginning classes (Melanie Mann) Tue/Thu 6-8 PM; Advanced (Vicki Campbell) Tue 2-4 PM; Senior Game Room Thursdays |
| 12 | club | Beginner Mah Jongg Lessons at Immaculate Conception Cathedral Church | Memphis | Three consecutive Mondays, 6:00-8:00 PM (June series) |
| 13 | club | Mah Jongg Lessons at Memphis Chess Club (MS Mahj / Linda McKnight) | Memphis | Multi-session beginner lessons, 1:00 PM |
| 14 | club | Mahjong Lessons and Open Play at Memphis Brooks Museum of Art (Cassie Lazzo, The Mahjologist) | Memphis | Seasonal beginner lessons + open play series |
| 15 | club | Linda Kerley Senior Center - American Mahjong Group Play (Collierville) | Memphis | Group play and lessons offered throughout the year |
| 16 | club | Bartlett Senior Center - Mah Jongg Thursdays | Memphis | Thursdays 12:30-3:30 PM; Monthly Lunch & Play 3rd Friday |
| 17 | club | Memphis Mahjong Club (@memphismahjong) | Memphis | Monthly socials |
| 18 | club | Officer Geoffrey Redd Library - Mah Jong Club | Memphis | Weekly (Wednesdays 1:00-3:00 PM, 2026) |
| 19 | instructor | Mahj Memphis (Vicki Campbell / Cassie Lazzo) | Memphis | Beginner lessons and events; by registration |
| 20 | instructor | Pamela Cook - American Mah Jongg (OMM Certified Instructor) | Memphis | Lessons by arrangement |
| 21 | instructor | Paula Brown - Mahjong Y'all (OMM Certified Instructor) | Memphis | Lessons by arrangement |
| 22 | instructor | 901bam | Memphis | note: "901bam™ is a children’s Mahjong and events company based in Memphis that teaches American Mahjong through creative camps, leagues, parties, and experiences designed to build confidence, friendships, and a lifelong love o" |
| 23 | club | River Bend Bookshop - Mah Jongg Open Studio & Lessons | Hartford | Recurring Monday evening open play (6-8pm) plus 101/102 courses with Linda Houde |
| 24 | club | East Hartford Senior Center Mahjong | Hartford | Mondays 1-3pm, weekly, free (age 55+) |
| 25 | club | Wethersfield Senior Center Mah Jongg Group | Hartford | Weekly group (call for schedule) |
| 26 | club | Newington Senior & Disabled Center Mahjong | Hartford | Monday & Wednesday mornings 9:30am; beginners and experienced welcome |
| 27 | club | Glastonbury Senior Center - Mahjong Wednesdays | Hartford | Wednesdays 1-3pm, ongoing recurring, free |
| 28 | club | Middletown Recreation - Intermediate American Mahjong | Hartford | Thursdays 6:30-8:30pm (seasonal session, ages 18+) |
| 29 | club | Durham Drop In Mah Jongg | Hartford | Tuesdays 2-4pm, drop-in, no registration |
| 30 | instructor | Susan (Hartford American Mah Jongg Teacher) | Hartford | By arrangement / private instruction |
| 31 | instructor | Linda Houde - Mahjong Instructor (West Hartford) | Hartford | By arrangement; small-group classes |
| 32 | club | Fishers Mah Jongg Center (Let's Play Mah Jongg) | Indianapolis | Multiple open-play sessions weekly; open play Tuesdays, reservation-based play Saturdays |
| 33 | club | Linden Tree (Carmel) | Indianapolis | Hosts American mahjong classes (boutique venue); schedule via shop |
| 34 | club | The Social of Greenwood | Indianapolis | American Mah Jongg play Wednesdays at 1 p.m. (per Modern Mahjong directory listing) |
| 35 | instructor | Meet at Mahj Studio & Boutique | Indianapolis | Mahj 101/102 classes several times monthly plus drop-in open play through the week; leagues |
| 36 | instructor | Lucky Tiles Mahjong & The Atelier | Indianapolis | Open Tue-Thu 11am-4pm & 5-7pm, Mon/Fri 10:30am-2:30pm; lessons, open play by reservation, leagues, tournaments |
| 37 | club | Mahjong Studio 1 | Louisville | Open play, classes, and leagues; open most days (Mon-Thu 9a-9p, Fri-Sun 9a-6p) |
| 38 | club | Gilda's Club Kentuckiana American Mahjong | Louisville | Monthly, second Monday at 12:30 pm; all supplies provided, new and experienced welcome |
| 39 | instructor | Tina Massey (Mahjong Majesty) | Louisville | Lessons, open play and league; teaches by official NMJL rules |
| 40 | instructor | Jennifer Hemsell (Mahj-Jen) | Louisville | Lessons; contact for schedule |
| 41 | instructor | Mahjong Majesty | Louisville | note: "I've been playing Mahjong for over 13yrs & teaching Mahj for the past 3yrs. I teach by the official NMJL rules (which does NOT include blanks). Flexible schedule." |
