あなたは「American Mahjong Guide」(mahjong-map.com、米国向け英語サイト)のための都市調査担当です。
下の「対象都市」について、実在する American Mahjong(NMJL ルール)のクラブ・講師・今後のイベントを WebSearch と各サイトの確認で調べ、
CSV にまとめて GitHub リポジトリに保存してください。

<!-- MODE:START -->
<!-- MODE:END -->

## 対象都市(実行ごとにここを書き換える)

<!-- TARGETS:START -->
- Pittsburgh, PA
- Cincinnati, OH
- Louisville, KY
- Milwaukee, WI
- Columbia, SC
<!-- TARGETS:END -->

(都市名は metro の都市名のみ。郊外の会場も、CSV の city 列にはこの都市名を入れ、実際の町名は address / description に書く)

## すでにサイトにある行(最重要:これを送り直さない)

あなたはリポジトリのファイルを読めないので、既存の行の一覧を下に貼ってある。**ここにある団体・講師・イベントは再送しない。**
同じ団体を少し違う名前で送ると二重登録になる。前回は、すでにある行を別名で送り直すものが多かった。

- 新しく見つけた団体・講師・イベントだけを送る。
- 一覧にある行について実際に新しい情報が見つかった場合(例: NEEDS_REVIEW の行を ACTIVE にできる根拠、新しい日程)だけ、**一覧と完全に同じ name** で送り、何が変わったかを report.md に書く。
- 一覧のイベントは、すでに登録されている日程。同じ講座の別の日付は新しい行として送ってよいが、名前は一覧のものに合わせる。
- 今回の目標は、各都市の ACTIVE 行を、日付つきイベントを中心に増やすこと(公開には ACTIVE 5 行が必要)。「いま何行ある」は各都市の見出しに書いてある。

<!-- EXISTING:START -->
### Cincinnati, OH  (ACTIVE 3 行。公開には5行必要)
Clubs:
- Mariemont Branch Library - Open Play Mahjong [NEEDS_REVIEW]
- Mayerson JCC Mah-Jongg Drop-In [NEEDS_REVIEW]
Instructors:
- Mahj with Meg [ACTIVE]
- Mrs Mahj [NEEDS_REVIEW]
Upcoming events:
- Mix, Mingle & Mahjong on 2026-10-07 [ACTIVE]
- American Mahjong - Open Play on 2026-10-15 [ACTIVE]

### Columbia, SC  (ACTIVE 5 行。公開には5行必要)
Clubs:
- USC Continuing Education Mah Jongg [ACTIVE]
- Mahjong with Alice [NEEDS_REVIEW]
- Soda City Mahj [NEEDS_REVIEW]
Instructors:
- Mary Ellen Barnwell [ACTIVE]
- Twyla Stowe [ACTIVE]
- Suzanne O'Dell [NEEDS_REVIEW]
Upcoming events:
- Open Play at Hotel Trundle on 2026-10-08 [NEEDS_REVIEW]
- Intro to Mahjong on 2026-10-12 [NEEDS_REVIEW]
- Mah Jongg - Afternoon Session on 2026-10-14 [ACTIVE]
- Mah Jongg - Morning Session on 2026-10-14 [ACTIVE]
- Intro to Mahjong on 2026-10-16 [NEEDS_REVIEW]
- Open Play at Pitas on 2026-11-04 [NEEDS_REVIEW]

### Louisville, KY  (ACTIVE 3 行。公開には5行必要)
Clubs:
- Douglass Community Center American Mah Jongg [ACTIVE]
- Keneseth Israel Mahjong Club [NEEDS_REVIEW]
- Mahjong Studio One [NEEDS_REVIEW]
- Trager Family JCC Mahjong [NEEDS_REVIEW]
- United Crescent Hill Ministries Mahjong Night [NEEDS_REVIEW]
Instructors:
- Mahjong Queens [ACTIVE]
- Sissy W. [ACTIVE]
Upcoming events:
- Mahjong Club on 2026-10-08 [NEEDS_REVIEW]
- Mahjong Club on 2026-10-15 [NEEDS_REVIEW]
- Mahjong Club on 2026-10-22 [NEEDS_REVIEW]
- MAHJ GHUOL'S NIGHT OUT 2.0 on 2026-10-27 [NEEDS_REVIEW]
- Mahjong Club on 2026-10-29 [NEEDS_REVIEW]
- Mahjong Club on 2026-11-05 [NEEDS_REVIEW]
- Mahjong Club on 2026-11-12 [NEEDS_REVIEW]
- Mahjong Club on 2026-11-19 [NEEDS_REVIEW]

### Milwaukee, WI  (ACTIVE 4 行。公開には5行必要)
Clubs:
- American Mah Jongg at Whole Foods Market [ACTIVE]
- Harry & Rose Samson Family JCC — Mah Jongg [ACTIVE]
- MKE Mahjong [ACTIVE]
- The Sassy Sparrow Mahjong [NEEDS_REVIEW]
Instructors:
- Julie Littman / MKE Mahjong [ACTIVE]
- Candace Burrows [NEEDS_REVIEW]
Upcoming events:
- (none)

### Pittsburgh, PA  (ACTIVE 2 行。公開には5行必要)
Clubs:
- Cooper-Siegel Community Library - Open Mah Jong Play [NEEDS_REVIEW]
- Hillel JUC of Pittsburgh - Mahjong Club [NEEDS_REVIEW]
- Lauri Ann West Community Center - Beginner Mah Jongg [NEEDS_REVIEW]
- PGH Mahjong Club at The Picket Fence [NEEDS_REVIEW]
- Pittsburgh Mahjong Club at Rodef Shalom [NEEDS_REVIEW]
- Temple Sinai Mahjong Club [NEEDS_REVIEW]
Instructors:
- Jane S. [ACTIVE]
- Liz Watkins [NEEDS_REVIEW]
- Three Rivers Mahjong [NEEDS_REVIEW]
Upcoming events:
- American Mahjong at Northern Tier Regional Library on 2026-10-07 [ACTIVE]

<!-- EXISTING:END -->

<!-- FOCUS:START -->
### 今回、特に確認してほしいこと

- Pittsburgh / Cincinnati: NEEDS_REVIEW の団体(Rodef Shalom、Cooper-Siegel 図書館、Hillel JUC、Temple Sinai、Mayerson JCC、Mariemont 図書館など)について、**その団体自身のページ**に American / NMJL とあるか、今後の日程があるか。あれば一覧と同じ name で ACTIVE として再送し、根拠の一文を引用する。
- Louisville: Mahjong Studio One と Keneseth Israel / Trager JCC が American(NMJL カード)と自ページで明記しているか。「national card」だけの表記は NEEDS_REVIEW のまま。
- Milwaukee: 今後の日付つきイベント(JCC、Whole Foods、MKE Mahjong の教室や講座)を探す。
- Columbia: 10月14日より後の日程(USC の追加講座、Soda City Mahj、図書館・シナゴーグ)を探す。


<!-- FOCUS:END -->

## 守ること(最重要)

1. このサイトは American Mahjong(National Mah Jongg League のカードを使う米国式)だけを扱う。中国式・香港式・リーチ・台湾式などは除外する。
   主催者自身のページに American / NMJL / National Mah Jongg League と書いてあるものだけを `ACTIVE` にする。確認できなければ `NEEDS_REVIEW`、または載せない。推測で書かない。
2. 根拠は主催者・会場自身のページ(公式サイト、カレンダー、イベントページ)。ディレクトリ(BamBuddies 等)だけが根拠の行は `NEEDS_REVIEW`。
3. `last_verified_at` は実行日(YYYY-MM-DD)。過去のイベントは入れない。
4. 個人の自宅住所・個人の電話やメールを載せない。会場が自宅の場合は町名だけ。
5. 上の「すでにサイトにある行」を先に読み、重複を送らない(上記のとおり)。
6. 1都市あたり ACTIVE 7〜8 行を目標にする(最低5行)。足りなければ JCC・シナゴーグ・シニアセンター・図書館・地元誌のイベント欄も探し、それでも足りなければ不足と、調べた情報源を report.md に書く。
7. 次は前回の検証で警告になった点。最初から避けること。
   - address は住所か地名だけ(例: `University of South Carolina, Columbia, SC`)。括弧書きの説明や「メールで連絡」などの文章は description に書く。
   - スタッフ個人のメール・電話番号は載せない。団体の公式な連絡先(代表メール・代表電話)だけにする。
   - `price` は数字だけ。ページの書き方が曖昧(1回分か総額か不明)なときは空欄にして、schedule か notes に原文を書く。
   - 過去の日付のイベントや、今後の日程が確認できないものは events に入れない。
   - 根拠が過去のイベントページだけ・ディレクトリだけの団体は `NEEDS_REVIEW`。
   - 他の都市(別の metro)の団体を混ぜない。

## CSV の形式(ヘッダーは一字一句このとおり)

clubs.csv
```
name,city,state,description,address,website,phone,email,latitude,longitude,beginner_friendly,lessons_available,open_play,social_play,women_only,free,price,schedule,source_url,last_verified_at,status
```
instructors.csv
```
name,city,state,website,contact,private_lesson,group_lesson,online_lesson,beginner_lesson,price,notes,source_url,last_verified_at,status
```
events.csv(実在する今後のイベントがなければ作らない)
```
name,city,state,event_date,start_time,end_time,venue,club_name,instructor_name,event_type,beginner_friendly,price,registration_url,source_url,last_verified_at,status
```

- `status` は `ACTIVE` または `NEEDS_REVIEW`。真偽値は `TRUE` / `FALSE`(空欄にしない)。
- `price` は数字だけ("35"。"$35" や "Free" は不可)。無料は `free=TRUE`。
- `event_type` は `OPEN_PLAY` / `TOURNAMENT` / `SOCIAL` / `LESSON` / `OTHER` のいずれか。
- `event_date` は YYYY-MM-DD。`club_name` / `instructor_name` は同じ CSV 内の行の name と完全一致させる。会場名やシリーズ名は club_name に入れない。
- URL 列は http(s):// のリンクのみ。
- 各 ACTIVE 行の description か notes に、American / NMJL と書いてある根拠の一文を引用する。
- 全行の列数をヘッダーと照合する(カンマのずれに注意)。

## 保存先(必ず守る)

- リポジトリ: kumechang/American-Mahjong
- ブランチ: `inbox/<実行日時 YYYY-MM-DD-HHMM>`(例: `inbox/2026-10-05-1240`。実行のたびに新規作成する。**main には絶対に push しない**)
- フォルダ: `data/inbox/<ブランチ名の日時部分>/<city-slug>/`(例: `data/inbox/2026-10-05-1240/milwaukee/`)
  - `clubs.csv`、`instructors.csv`、`events.csv`
  - `report.md`: 調べた情報源、除外した理由、不足があればその内容、迷った行とその理由(日本語で簡潔に)
- 都市ごとにフォルダを分ける。city-slug は小文字・ハイフン区切り(例: `salt-lake-city`)。
- push するのは上記ファイルだけ。他のファイルは変更しない。
既存の行の再送を避けたため新規の行がない都市は、CSV を作らず report.md だけを置く(何を調べて何も新しく見つからなかったかを書く)。

push が終わったら、ブランチ名と、都市ごとの ACTIVE / NEEDS_REVIEW の行数を最後に報告する。
