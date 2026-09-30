# データ収集手順書(MVP: 10都市 / 100〜200件)

このドキュメントは、American Mahjong Guideの都市ページに載せる実データ
(クラブ・インストラクター・イベント)を、どうやって・誰が・どんな基準で
集めるかを定めるものです。企画書24〜27章が指摘する通り、この作業の質が
サイトの競争力そのものになるため、スクレイピングツールを書く前に運用の
型を固めます。

## 1. 目的とスコープ

- 対象都市: New York, Los Angeles, Chicago, Dallas, Austin, Miami,
  Boston, Phoenix, Scottsdale, San Francisco(企画書18章の候補10都市)
- 1都市あたり目安: クラブ・インストラクター・イベント合わせて10〜20件
- **方針:** 件数を増やすことより、1件ごとの正確性を優先する。自信のない
  情報は載せない(`status = NEEDS_REVIEW` にする)。

## 2. ソースと法的ガイドライン

| ソース | 使い方 |
|---|---|
| クラブ/インストラクターの公式サイト | 一次情報として最優先。事実を自分の言葉で要約して`description`に書く(サイト文章のコピペはしない) |
| Meetup | ブラウザで見て手動確認する分には問題なし。将来的に公式APIで自動取得する場合はMeetupのAPI利用規約を別途確認する |
| Eventbrite | 同上 |
| 公共図書館・コミュニティセンターの掲示/サイト | 一次情報として利用可 |
| Google Maps / Yelp | **生スクレイピング禁止**。営業時間・住所などの裏取りに「見て確認する」のは問題ないが、自動取得するなら公式API(Google Places API / Yelp Fusion API)経由に限定する |
| Facebook Group | 自動取得不可。手動で確認し、公開情報のみ引用する |

迷ったら「その情報は公開されているページを人間が読んで確認できるか」を
基準にする。できないなら載せない。

## 3. 都市ごとのリサーチ手順

1. `"[City] mahjong club"` `"[City] american mahjong lessons"` などで検索
2. 見つかった候補ごとに、**公式サイト or Meetup/SNSの公開ページ**を開いて
   一次情報を確認する
3. `data/templates/clubs.csv` / `instructors.csv` / `events.csv` に1行ずつ
   追記する(列の意味は `data/templates/README.md` を参照)
4. 该当ページのURLを必ず `source_url` に記録し、確認した日付を
   `last_verified_at` に入れる
5. 1都市分(10〜20件)集まったら、次の都市に進む

## 4. 判断に迷うフィールドの基準

- **`beginner_friendly`**: サイト上に "beginners welcome" 等の明記がある、
  または初心者向けレッスンとセットで案内されている場合のみ `TRUE`。
  書かれていなければ `FALSE`(不明ではなく保守的にFALSE)。
- **`lessons_available`**: 個別のレッスン枠が案内されているか。単に
  「初心者歓迎」なだけでレッスンの案内がなければ `FALSE`。
- **`open_play` / `social_play`**: 参加者を固定せず自由に出入りできる会
  なら `open_play`。定期メンバー中心の懇親目的の会なら `social_play`。
  両方に当てはまることもある。
- **`free`**: 参加費の記載が一切ない、または明示的に無料と書かれている
  場合のみ `TRUE`。不明な場合は `FALSE` にして `price` も空欄にする。
- **`status`**:
  - `ACTIVE` — 直近の開催情報や更新が確認できる。**都市ページに表示され
    るのはこのステータスの行だけ**(`src/app/cities/[slug]/page.tsx`で
    フィルタしている)
  - `NEEDS_REVIEW` — 情報は見つかったが古い可能性がある、または一部を
    推測で埋めた。DBには残るが公開ページには出ない — レビューして
    `ACTIVE`に上げるまで一般公開されない
  - `INACTIVE` — 過去には存在したが、活動停止/閉鎖が確認できる。同様に
    非表示

都市を公開(`published = 1`)するかどうかは、**ACTIVE行だけで数えた
件数**で判断する。NEEDS_REVIEWだらけの都市を「データがある」と誤認して
公開しないこと(例: 2026-09-28時点でPhoenixはACTIVEなクラブ・イベントが
0件だったため公開を見送った — `migrations/0013_publish.sql`参照)。

## 5. データ更新(鮮度管理)

- `last_verified_at` から**90日**を目安の再確認サイクルとする
- 90日を超えたレコードは都市ページ側で優先的に再チェック対象にする
  (将来的に管理画面/バッチで自動フラグ化する想定。MVPでは手動で
  `last_verified_at` が古い行をCSVでソートして確認する運用でよい)
- 主催者から「情報が違う」という問い合わせが来た場合は即座に修正し、
  `last_verified_at` を更新する

## 6. CSV記入後の流れ

0. **まだDBに無い都市の場合、先に`City`行を追加する。** クラブ/
   インストラクター/イベントは`city`/`state`列でこの行に紐付くので、
   無いとインポート時に外部キーが解決できない。追加は非公開
   (`published = 0`)で行い、データが揃ってから公開する
   (`migrations/0002_cities.sql`が実例)。
1. `data/templates/*.csv` を都市ごとにコピーして記入する
   (例: `data/collected/austin/clubs.csv` — 都市ごとにサブフォルダを切る)
2. `scripts/import-csv.mjs` でまず検証だけ行う(DBには何も書き込まない):
   ```bash
   node scripts/import-csv.mjs \
     --clubs=data/collected/austin/clubs.csv \
     --instructors=data/collected/austin/instructors.csv \
     --events=data/collected/austin/events.csv \
     --dry-run
   ```
   エラーが出た行は修正して再実行する(警告は許容範囲 — 例:
   `NEEDS_REVIEW`行の`source_url`欠落など)。
3. エラーが無くなったら `migrations/` 配下に**次の連番**でSQLファイルを
   生成する(`migrations/`内の既存ファイルの最大番号+1を使う。例えば
   現状の最新が`0015_...`なら`0016_...`):
   ```bash
   node scripts/import-csv.mjs \
     --clubs=data/collected/austin/clubs.csv \
     --instructors=data/collected/austin/instructors.csv \
     --events=data/collected/austin/events.csv \
     --out=migrations/0016_austin_recheck.sql
   ```
   `migrations/`はCloudflare D1のマイグレーション管理フォルダ
   (`wrangler.jsonc`の`migrations_dir`)なので、ここに置いたファイルは
   **次回デプロイ時に自動でD1へ適用される**(`npm run cf:deploy`が
   `wrangler d1 migrations apply DB --remote`を実行してからデプロイする)。
   手動でD1 Consoleに貼り付ける必要はもう無い。
4. ローカルで先に確認したい場合のみ、手動適用できる:
   ```bash
   npx wrangler d1 migrations apply DB --local
   ```
5. コミット・プッシュしてデプロイすれば、ビルド時にD1へ反映される。
   インポート後は実際に都市ページ(`/cities/[slug]`)を開いて表示を
   目視確認する

再検証(`last_verified_at`更新)のときも同じCSVを編集して同じコマンドを
再実行すればよい。`slug`をキーにUPSERTするので、同じ行を再インポートし
ても重複は作られず、既存レコードが更新される。

### event_typeのマッピング(暫定)

ソースの表記がDBのenum(`OPEN_PLAY`/`TOURNAMENT`/`SOCIAL`/`LESSON`/`OTHER`)
と完全一致しない場合、スクリプトが以下のエイリアスを自動変換する:

| ソースの表記 | 変換先 |
|---|---|
| Competitive League / League | `TOURNAMENT` |
| Beginner Lesson Series / Lesson Series | `LESSON` |
| Supervised Play | `OPEN_PLAY` |

「League」と「Tournament」は本質的に別物(継続的な順位戦 vs
単発の大会)だが、現行enumに`LEAGUE`が無いため暫定的に`TOURNAMENT`へ
寄せている。実データでLeague系イベントが増えてきたら、
`src/db/schema.ts`の`EventType`に`LEAGUE`を追加するマイグレーションを
検討する。

## 7. 将来の自動化候補(MVP後)

- Meetup / Eventbrite の公式APIでイベントのみ自動取得し、クラブ/
  インストラクターは引き続き手動キュレーションを維持する
  (「情報が存在するが整理されていない」という差別化ポイントは、
  自動化してもクラブ側の質的判断まで機械に任せない)
- 上記を導入する場合も、取得したデータは必ず `status = NEEDS_REVIEW` で
  取り込み、人が確認してから `ACTIVE` にする運用にする

## Ongoing maintenance

- **Events expire on their own.** City pages, `/find` and `/cities` only show
  and count events dated today or later (`todayEventDate` in
  `src/lib/city-counts.ts`). Old event rows stay in the database and can be
  left alone; an occasional cleanup migration (`UPDATE "Event" SET "status" =
  'INACTIVE' WHERE "eventDate" < ...`) keeps counts honest in reports.
- **Publish threshold uses ACTIVE rows at import time.** After events pass,
  a city can drop below five *visible* rows. Before each re-verification
  round, check which published cities have fewer than five ACTIVE clubs +
  instructors + upcoming events and either top them up or unpublish them.
- **Re-verify on a 90-day cadence.** `VerifiedNote` flags rows older than 90
  days. Everything imported so far was verified between 2026-09-28 and
  2026-09-30, so the first round is due in late December 2026.
- **Weakest rows first.** Published rows with no website and a directory-only
  source (BamBuddies, MahJongg Maven, Order of the Tile) are the first to
  re-check or move to `NEEDS_REVIEW`.
