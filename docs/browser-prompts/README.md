# ブラウザ(Chrome)付きチャットに渡す調査プロンプト

Chrome を実際に操作できるチャットで、機械では読めないページ(Instagram・公開 Facebook・JavaScript で出る予約ページ・Google 検索の結果)を人の目の代わりに読ませるためのプロンプト。各ファイルは**そのまま貼れば動く**ようにしてあり、先頭が共通のルールと返却形式、最後がその回の対象リスト(2026-10-28 時点の DB から作成)。

| ファイル | 対象 | 件数 | 狙い |
|---|---|---|---|
| `01-directory-leads.md` | BamBuddies などのディレクトリにだけ載っている団体(自サイトが不明) | 73 | 公開まであと 1〜2 行の 8 都市を 5 行にする |
| `02-bam-good-time-owners.md` | Bam Good Time のページだけがある団体(JavaScript で中身が出る) | 34 | American の明記と今後の日程を読む |
| `03-eventbrite-organisers.md` | 全米検索で見つかった Eventbrite 主催者のうち、まだ確認待ちのもの | 25 | 主催者ページ・公式サイトで確認する |

## 返ってきた結果の取り込み
返却は CSV(`name_exact,type,city,state,verdict,evidence_quote,evidence_url,own_website,venue_name_and_address,venue_is_public,beginner_friendly,next_sessions,notes`)。`verdict=ACTIVE` で `venue_is_public=Y` のものだけを、引用文(evidence_quote)付きで ACTIVE にし、next_sessions を events に入れる(開始時刻と公開の会場名があるものだけ ACTIVE)。`INACTIVE` は別の種類・会員限定として外す。`NEW:` の行は新しい手がかり(NEEDS_REVIEW)として入れる。個人の連絡先は受け取らない設計。

## 運用メモ
- 1 回に渡す量は 30 行前後まで(長いと後半の精度が落ちる)。長いファイルは前半・後半に分けて貼る。
- 取り込み後は DB の状態からリストを作り直す(確認済みの行は自然に外れる)。
