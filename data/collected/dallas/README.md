# American Mahjong Dallas MVP CSV v2

前回CSVのインポート時に判明した仕様差異を反映した修正版です。

## 今回の修正

- Boolean項目の空欄を `FALSE` に統一
- `price` はREAL型を想定し、数値のみを格納
- 価格の単位・補足情報は `schedule` / `notes` に保持
- Event `event_type` をDB enumへ変換
  - Competitive League → `TOURNAMENT`
  - Beginner Lesson Series → `LESSON`
  - Supervised Play → `OPEN_PLAY`
- Instructorから `lesson_type` を削除
- Instructorに `notes` を追加
- Eventに `club_name` と `instructor_name` を追加
- `venue` は実際の開催場所として維持
- DFW郊外の施設をDallas市内として水増しせず、今回のCSVはDallas市内中心

## 注意

このCSVは、今回確認できている仕様に合わせたMVP登録用データです。
DB側でInstructorの `notes` を追加する場合は、対応するカラム追加が必要です。
