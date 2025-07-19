# API テスト

このディレクトリには、アフターピル検索APIの包括的なテストが含まれています。

## テストファイル構成

### 1. `medical-institution.e2e-spec.ts`
医療機関検索APIのE2Eテスト
- 現在地検索 (`/api/v1/search/current-location/medical-institutions`)
- 住所検索 (`/api/v1/search/address/medical-institutions`)
- 複数パラメータ対応（`todofuken`, `shikuchoson`）
- フィルタリング機能（日曜診療、祝日診療）
- ページネーション
- エラーハンドリング

### 2. `pharmacy.e2e-spec.ts`
薬局検索APIのE2Eテスト
- 現在地検索 (`/api/v1/search/current-location/pharmacies`)
- 住所検索 (`/api/v1/search/address/pharmacies`)
- 複数パラメータ対応（`todofuken`, `shikuchoson`）
- フィルタリング機能（時間外対応）
- ページネーション
- エラーハンドリング

### 3. `integration.e2e-spec.ts`
統合テスト
- APIキー認証
- レスポンス構造の一貫性
- ページネーションの境界値テスト
- 複数パラメータ処理
- エラーハンドリング
- パフォーマンステスト

### 4. `test-utils.ts`
テスト用ユーティリティ
- テストアプリケーションの作成
- レスポンス検証関数
- 共通定数

## テスト実行方法

### 全テストの実行
```bash
npm run test:e2e
```

### 特定のテストファイルの実行
```bash
npm run test:e2e -- medical-institution.e2e-spec.ts
npm run test:e2e -- pharmacy.e2e-spec.ts
npm run test:e2e -- integration.e2e-spec.ts
```

### テストの監視モード
```bash
npm run test:e2e -- --watch
```

### カバレッジ付きテスト
```bash
npm run test:e2e -- --coverage
```

## テスト内容

### 基本機能テスト
- ✅ 正常なリクエストの処理
- ✅ レスポンス構造の検証
- ✅ ページネーション機能
- ✅ フィルタリング機能

### 複数パラメータテスト
- ✅ 単一の都道府県・市区町村
- ✅ 複数の都道府県（`?todofuken=東京都&todofuken=神奈川県`）
- ✅ 複数の市区町村（`?shikuchoson=町田市&shikuchoson=座間市`）
- ✅ 複数の都道府県・市区町村の組み合わせ

### エラーハンドリングテスト
- ✅ 必須パラメータの欠如
- ✅ 無効なパラメータ値
- ✅ 不正な座標値
- ✅ 空のパラメータ

### パフォーマンステスト
- ✅ 同時リクエスト処理
- ✅ 大量データのページネーション

## テスト環境の要件

- Node.js 18以上
- MongoDB接続（テスト用データベース）
- Google Geocoding API（現在地検索用）

## 注意事項

1. **データベース**: テスト実行前にテスト用データベースの準備が必要です
2. **APIキー**: Google Geocoding APIのキーが環境変数に設定されている必要があります
3. **外部API**: 現在地検索はGoogle Geocoding APIに依存します
4. **テストデータ**: 実際の医療機関・薬局データが必要です

## トラブルシューティング

### テストが失敗する場合
1. データベース接続を確認
2. 環境変数の設定を確認
3. 外部APIの利用制限を確認
4. テストデータの存在を確認

### パフォーマンステストが遅い場合
1. データベースのインデックスを確認
2. ネットワーク接続を確認
3. 外部APIの応答時間を確認 