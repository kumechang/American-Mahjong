# 役割
あなたは American Mahjong Guide(mahjong-map.com、米国向け英語サイト)の調査担当です。実際の Chrome を操作して、下のリストの各団体・講師について「American Mahjong(NMJL ルール)をやっているか」「今後参加できる日程があるか」を、その団体自身のページで確認し、結果を決まった形式で返してください。サイトの掲載ルールは「American Mahjong であることが団体自身の言葉で確認できること」です。推測では ACTIVE にしません。

# やること(各行について)
1. 団体名と都市・州で Google 検索(または名前で Instagram / Facebook / Eventbrite / Meetup を検索)して、**その団体自身のページ**を探す(公式サイト、Instagram、公開の Facebook ページ、予約ページ、会場のイベントページ)。ディレクトリ(BamBuddies、Mahjong 4 Friends)と、Bam Good Time が団体に用意するページそのもの(`*.bamgoodtime.com`)は、American / NMJL の**明記が書かれていない限り**根拠にならない。
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

# 今回のリスト(Bam Good Time のページだけがある団体と、確認待ちの手がかり)
Bam Good Time が団体ごとに作るページ(`*.bamgoodtime.com`)は、American / NMJL かどうかを書いていないものが多く、機械では「どの種類か」が分からないままです。**やってほしいのは、団体自身の言葉でルールの種類を確認すること**です。順番は次のとおり。
1. その Bam Good Time ページを Chrome で開き、団体の説明文(About)と、イベントを 2〜3 件開いた説明文に、American / NMJL / "card" の語があるかを読む(ページの下の方・Contact ページ・FAQ も)。
2. なければ、団体名で検索して公式サイト、Instagram(公開の範囲)、公開 Facebook ページ、会場のイベントページを探して同じ確認をする。
3. 会場が個人宅や「支払い後に連絡」の非公開住所だけなら、venue_is_public=N、verdict=INACTIVE(理由を notes に)。

各団体には今後のセッションがすでに Bam Good Time に載っているので、next_sessions は**ここで確認できた分を 3 件まで**で足ります(Bam Good Time 以外のページに書かれた日程があれば、それを優先)。

## すでに掲載済み(同じものは DUPLICATE と答える)
- Downers Grove, IL: Colleen Loftus | Mariposa Mahjong
- Fort Worth, TX: The Mahj Clubhouse; American Mah Jongg
- New Orleans, LA: Fleur de Mahj; New Orleans JCC Mah Jongg; Fleur de Mahj / Sheila (instructor)
- Newnan, GA: Newnan Carnegie Library
- Marietta, GA: Black Girls Mahjong, Too!- ATL Community; East Wind Social Club
- Ocean Springs, MS: OS Mahj Club
- Johns Creek, GA: Johns Creek Mahjong League
- Orlando, FL: Orlando Mah Jongg Club; Mahj & Away; My Mahjong Room
- Portsmouth, NH: Bird Bam Mahjong

## A. 確認待ちの団体(名前の列はそのままコピー)
| # | type | name_exact | city | state | Bam Good Time ページ | 直近のセッション(参考) |
|---|---|---|---|---|---|---|
| 1 | club | KS Tile Society | Downers Grove | IL | https://kstilesociety.bamgoodtime.com | 2026-11-02 11:00 5120 Belmont Road, Suite B., Downers Grove; 2026-11-03 19:00 5120 Belmont Road., Suite B., Downers Grove |
| 2 | club | Vickie Charm's Mahjong Social Parlor | Fort Worth | TX | https://vickiecharm-fwtx-mahjongsocialparlor.bamgoodtime.com | 2026-10-31 13:00 Private address provided via text or email af; 2026-11-02 19:00 Address provided via email and/or text messag |
| 3 | club | MahjMarine | New Orleans | LA | https://mahjmarine.bamgoodtime.com | 2026-10-30 17:00 The Rink 2727 Prytania St, New Orleans; 2026-11-03 17:00 The Rink 2727 Prytania St |
| 4 | club | Peachtree Mahjong Club/ Open Hand Mahjong | Newnan | GA | https://open-hand-mahjong.bamgoodtime.com | 2026-11-02 14:00 Chicken Salad Chick, Newnan GA; 2026-11-02 17:30 Chicken Salad Chick, 214 Newnan Crossing Bypa |
| 5 | club | Mahj and Mingle | Marietta | GA | https://mahj-and-mingle.bamgoodtime.com | 2026-11-12 17:00 Glory Haus 1045 Cobb Pkwy N, Marietta, GA |
| 6 | club | The Tile Parlour | Ocean Springs | MS | https://thetileparlour.bamgoodtime.com | 2026-11-08 10:00 Common Ground Cafe |
| 7 | club | Eshelman Creative Co | Lincolnton | GA | https://eshelman.bamgoodtime.com | 2026-11-04  Dust & Grace; 2026-11-09  Dust & Grace |
| 8 | club | Mahjong at Deena’s, San Diego and North County Coastal | Carlsbad | CA | https://mahjongatdeenas.bamgoodtime.com | 2026-11-02 10:30 Cape Rey Carlsbad Beach Hilton, 1 Ponto Rd.,; 2026-11-03 14:30 Chauncey's Pizza & Bar 221 N Hwy 101, Solana |
| 9 | club | Norfork Lake Mahjong Club | Mountain Home | AR | https://norfork-lake-mahjong-club.bamgoodtime.com | 2026-11-03 18:00 Fish & Fiddle Resort - 880 Fish & Fiddle Road; 2026-11-05 16:30 Fish & Fiddle Resort - 880 Fish & Fiddle Road |
| 10 | club | Montana Mahj | Billings | MT | https://montana-mahj.bamgoodtime.com | 2026-10-31 09:00 Montana Mahj Tile House, 2528 Grand Ave; 2026-10-31  Montana Mahj Tile House 2528 Grand Avenue in |
| 11 | club | Spring River Mahjong | Cherokee Village | AR | https://spring-river-mahjong.bamgoodtime.com | 2026-10-30  Highland Supply 1922 US-62, Highland AR; 2026-11-06  Highland Supply 1922 US-62, Highland AR |
| 12 | club | Mah Jongg with Madelaine | Williston | SC | https://madmahjongg.bamgoodtime.com | 2026-11-09 18:00 12927 Main St Williston SC; 2026-11-23 18:00 12927 Main St Williston SC |
| 13 | club | Bird Bam Cheers | Cherry Hill | NJ | https://bird-bam-cheers.bamgoodtime.com | 2026-11-09 18:30 22 N Centre Street, Merchantville NJ; 2026-11-16 18:30 22 N Centre Street, Merchantville NJ |
| 14 | club | Play Mahj | Simpsonville | SC | https://play-mahj-sc.bamgoodtime.com | 2026-11-03  Moretti's Pizzeria & Bar 783 E Butler Rd, Mau; 2026-11-12  Moretti's Pizzeria & Bar 783 E Butler Rd, Mau |
| 15 | club | Mahjong at The Hearth | Wilmington | MA | https://thehearth01887.bamgoodtime.com | 2026-11-01  Mahjong Room; 2026-11-02  Mahjong Room |
| 16 | club | Bams and Bubbles 251 | Daphne | AL | https://bamsandbubbles251.bamgoodtime.com | 2026-11-01  Bams and bubbles 251; 2026-12-06  Bams and bubbles 251 |
| 17 | club | The Mahj-On Society | Mont Belvieu | TX | https://the-mahj-on-society.bamgoodtime.com | 2026-11-02 18:00 Casa Julia; 2026-11-09 18:00 Casa Julia |
| 18 | club | The Jaded Dragon Mahjong Club | Moreland | GA | https://the-jaded-dragon-mahjong-club.bamgoodtime.com | 2026-11-04 17:30 7 Main St Moreland GA; 2026-11-11 17:30 7 Main St Moreland GA |
| 19 | club | Southern Specialty Mahjong Social | Navarre | FL | https://southern-specialty-mahjong-social.bamgoodtime.com | 2026-11-03 18:00 Southern Specialty Boutique; 2026-11-10 18:00 Southern Specialty Boutique |
| 20 | club | Palmetto Mahj | Palmetto | GA | https://palmettomahj.bamgoodtime.com | 2026-11-11 11:30 Partners II Pizza, Arbor Spgs Ter, Newnan, GA; 2026-11-25 11:30 Partners II Pizza, Arbor Spgs Ter, Newnan, GA |
| 21 | club | Two Bamboo Mahjong | Fort Wayne | IN | https://two-bamboo-mahjong.bamgoodtime.com | 2026-10-30 12:00 Two Bamboo; 2026-10-31 12:00 Two Bamboo |
| 22 | club | Moon River Mahjong | Savannah | GA | https://moon-river-mahjong.bamgoodtime.com | 2026-11-09 18:00 714 Mall Blvd. Sav., Ga.; 2026-12-07 18:00 714 Mall Blvd. Sav., Ga. |
| 23 | club | Let's Go Mahjong! | Shreveport | LA | https://lgm.bamgoodtime.com | 2026-11-02 12:30 7607 Fern Avenue, Suite 904 Shreveport, LA 71; 2026-11-04 12:30 7607 Fern Avenue, Suite 904 Shreveport, LA 71 |
| 24 | club | Maryland House of Mahjong | Elkridge | MD | https://maryland-house-of-mahjong.bamgoodtime.com | 2026-11-12  340 E Patrick St Frederick, MD; 2026-11-12  340 E Patrick St. Frederick, MD 21701 |
| 25 | club | SipGirl Living Mahjong | Madison | MS | https://sipgirl-living-mahjong.bamgoodtime.com | 2026-10-30  350 Edgewood Terrace; 2026-11-01  350 Edgewood Terrace |
| 26 | club | Crak Bam Co | Winter Garden | FL | https://crak-bam-co.bamgoodtime.com | 2026-11-10  Hawkers Asian Street Food 9100 Conroy Winderm; 2026-11-17  Hawkers Asian Street Food 9100 Conroy Winderm |
| 27 | club | Delmarva Mahjong Club | Berlin | MD | https://delmarva-mahjong.bamgoodtime.com | 2026-11-11  10:00 AM - 2:30 PM |
| 28 | club | The Mahjong Social | Cherry Hill | NJ | https://tmscherryhill.bamgoodtime.com | 2026-11-15 10:30 To be announced to attendees |
| 29 | club | Off the Green Societe | Amarillo | TX | https://off-the-green-societe.bamgoodtime.com | 2026-11-11  inside the TGC Tennis Center |
| 30 | club | Tiles With Trish | Norfolk | VA | https://tileswithtrish.bamgoodtime.com | 2026-11-05  6464 Hampton Blvd Norfolk VA |
| 31 | club | Mahj Mahal Social Club | Union City | TN | https://mahjmahalsocialclub.bamgoodtime.com | 2026-11-15  Mahj Mahal Social Club 603 E. Reelfoot Ave. U |
| 32 | club | Mid-Atlantic Mahjong | Wilmington | DE | https://midatlanticmahjong.bamgoodtime.com | 2026-11-17  Sew Another Stitch |
| 33 | club | Two Dot Mahjongg Community | Auburn | AL | https://2dot.bamgoodtime.com | 2026-11-05  231 Carter St |
| 34 | club | Charlestown Mahjong Club | Charlestown | MA | https://charlestown-mahjong-club.bamgoodtime.com | 2026-11-12  1 Church Court Chalestown MA |
| 35 | club | La La's Mahjong Room | Marion | IL | https://lalas-mahjong-room.bamgoodtime.com | 2026-11-19  305 W Main Street, Marion, IL |

## B. 新しい手がかり(まだ掲載にない。name_exact は下の名前をそのまま使い、type=club で答える)
| # | name_exact | city | state | 探してほしいこと |
|---|---|---|---|---|
| 36 | City of Johns Creek - Mahjong Mondays | Johns Creek | GA | 市主催の月曜 13:00-15:00 の麻雀(Northeast Spruill Oaks Library, 9560 Spruill Rd)。市のイベントページ(johnscreekga.gov/events/mahjong-mondays-…)に American / NMJL の明記と、11 月以降の日付があるか。 |
| 37 | Holland Center - Beginner Guided Open Play (American Mah Jongg) | Johns Creek | GA | Holland Center の "Beginner Guided Open Play – American Mah Jongg"($25、2026 NMJL カード持参)。所在地(市内か)と今後の日付。 |
| 38 | Ellora Mahjong | Orlando | FL | "East Winds at the East End"(East End Market, Audubon Room)の次回開催と、Ellora Mahjong 自身のページの American の明記。 |
| 39 | Diversions Puzzles & Games - Learn to Play Mahjong | Portsmouth | NH | 123 Congress St の店。American スタイルの 3 週間講座($75)の次回の日付(秋〜冬)と、店のページに American の明記があるか。 |
