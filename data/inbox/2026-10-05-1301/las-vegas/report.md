# Las Vegas 調査レポート (2026-10-05)

## 追加したもの
- events.csv に16件(Las Vegas Mahjong の Bookwhen 予約ページに載っている 10/9〜10/30 の日付つきイベント)。既存の 10/6・10/7 は除外。
- club_name は既存と同じ「Las Vegas Mahjong」。
- Nicole 担当のレッスン(10/12, 10/19, 10/26)は instructor_name を空にし、名前にだけ入れた(instructors.csv にない人のため)。
- American / NMJL の根拠: 公式サイトに "We teach American Mahjong, played with the National Mah Jongg League (NMJL) card." とある。

## 注意・未確認
- Bookwhen の一覧からは開始時刻(PDT)のみ取得。終了時刻・価格・各イベント個別 URL は未確認(registration_url は Bookwhen のトップ)。
- 会場は公式サイトの記載(Lucky Hare 内、8687 W. Sahara Ave., Suite 200)を全イベントに使用。個別イベントごとの会場確認はしていない。
- 10/30 Halloween Open Play は SOCIAL として登録。

## 情報源
- https://bookwhen.com/lasvegasmahjong
- https://www.lasvegasmahj.com/
