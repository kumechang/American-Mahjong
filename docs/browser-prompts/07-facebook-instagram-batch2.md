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


# 今回のリスト(Facebook / Instagram で読む必要がある団体。2 回目の 18 件)
団体自身の投稿・プロフィール文に American / NMJL / "the card" の語があるか、今後の日付・時刻・会場があるかを読んでください。投稿の引用は原文のまま、その投稿の URL を evidence_url に入れます(日付が分かる投稿を優先)。前回、検索結果の抜粋にだけあった引用が実際のページにはなかった例があったので、**必ず開いた投稿・ページの本文から引用**してください。ハッシュタグだけ(#AmericanMahjong など)は、その旨を notes に書いて UNCONFIRMED 寄りで答えてください。

## すでに掲載済み(同じものは DUPLICATE と答える)
- Birmingham: O'Neal Library Mah Jongg Meetup; Levite JCC Mahjong; Riverchase United Methodist Church — Mah Jongg Lessons; Aldridge Gardens — Mahjong Classes & Open Play (Cynde Morgan); Katie Moellering (instructor); All About Mahj Bham, KandB Mahj (instructor); Tapping Mahjette, Tapping Mahjette LLC, The Tapping Mahjette OMM teacher, The Tapping Mahjette (instructor)
- Jacksonville: Mahjong Social Club Jax
- Milwaukee: Harry & Rose Samson Family JCC — Mah Jongg; American Mah Jongg at Whole Foods Market; MKE Mahjong; City of Waukesha 55+ — American Mahjong Class & Meet-Ups (Schuetze Rec Center); Julie Littman / MKE Mahjong (instructor)
- Sarasota: Selby Library Mah Jongg for Experienced Players; Jewish Federation of Sarasota-Manatee - Mah Jongg 101
- Cleveland: Southwest Cleveland Mahjong; Mahjong IRL - By Erini Heffernan; Mahjong Maison (instructor)
- Nashville: Gordon Jewish Community Center Mah Jongg; The Mahjong Club; Brentwood Mah Jongg Club; Williamson County Enrichment Center American Mahjong; Mahj House Society at Fork of the South; Mahjong Night at The Regal Room; So Bam Fun (instructor); Joy Marini (instructor); Laura Johnson / Mama Mahjong (instructor); Janelle Kraemer / Mahjong with Janelle (instructor); Robin / Learn to Play MahJongg (instructor); Liza Gaston / Mahj Madness (instructor)
- Marietta: Black Girls Mahjong, Too!- ATL Community; East Wind Social Club
- Cherokee Village: Spring River Mahjong

| # | type | name_exact | city | state | 確認すること |
|---|---|---|---|---|---|
| 1 | instructor | Magic City Mahj (Robyn Henderson) | Birmingham | AL | FB ページ/IG。American/NMJL の記載、Hoover Steaks & Wines の開催日。 |
| 2 | instructor | The Marvelous Mrs. Mazer (Rachel Mazer) | Birmingham | AL | IG。American/NMJL の記載と今後の教室。 |
| 3 | instructor | Katedotbham | Birmingham | AL | Mahjong 4 Friends に "NMJL ルールで教える"。IG の本人の言葉と日程。 |
| 4 | instructor | 904 Mahj (Susan Katz) | Jacksonville | FL | IG/FB に "Mahjong lessons. Parties."。American/NMJL の記載。 |
| 5 | instructor | Jacksonville Mahj (The Mahjong Line) | Jacksonville | FL | The Mahjong Line の Jacksonville。IG の記載。 |
| 6 | club | Coastal Elements - Mahjong Lessons | Jacksonville | FL | Ponte Vedra Beach の店の FB(Mahjong 101/102)。種類の記載と日程。 |
| 7 | club | Mahjong in the Sun - Friday Club | Jacksonville | FL | 自サイトは毎週金曜 12-3 PM(Really Good Beer Stop Nocatee)で種類の記載なし。IG/FB の記載。 |
| 8 | club | The Sassy Sparrow Mahjong | Milwaukee | WI | 自分のページ未特定。IG/FB を探し、American の記載と日程。 |
| 9 | instructor | MKE Mahjong Social Group | Milwaukee | WI | IG と FB グループ。種類の記載(グループは非公開なら「非公開」)。 |
| 10 | instructor | Candace Burrows | Milwaukee | WI | 団体のページ(個人の連絡先は書かない)。American の記載と教室。 |
| 11 | instructor | Iris Pressman (Hi Mahj) | Sarasota | FL | himahj.com の本文が読めない。IG/FB で American/NMJL の記載。 |
| 12 | instructor | Mahjong IRL (Erini Heffernan) | Cleveland | OH | IG/FB。American の記載と今後の教室(Avon / Lakewood など)。 |
| 13 | instructor | Missy Mahjong LLC | Nashville | TN | 以前、対面レッスンを 2026 年 7 月で終了と自サイトにあった。現在の活動(対面か)を FB/IG で。 |
| 14 | club | Mahj and Mingle | Marietta | GA | FB "Mahj & Mingle Events"。会場 Glory Haus (1045 Cobb Pkwy N)。種類の記載。 |
| 15 | club | SipGirl Living Mahjong | Madison | MS | FB/IG に初心者・カップルレッスン。American/NMJL の記載。会場が個人宅でないか(350 Edgewood Terrace)。 |
| 16 | club | Let's Go Mahjong! | Shreveport | LA | 自サイト letsgomahjong.com に種類の記載なし。IG/FB の投稿に American/NMJL があるか。 |
| 17 | club | Play Mahj | Simpsonville | SC | BGT に "the big card and blanks" とだけ。Simpsonville の IG/FB 「Palmetto Mahjong Social」が同じ団体か。会場 Moretti's (Mauldin)。 |
| 18 | club | Norfork Lake Mahjong Club | Mountain Home | AR | FB の "Mountain Home Mahjong"(NMJL カード・Charleston の投稿)が同じ団体か。会場 Fish & Fiddle Resort。 |
