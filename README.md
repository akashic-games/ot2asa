# ot2asa
OpenToonzで作成したスプライトシートをakashic-animation形式にコンバートするコマンドラインツール。

# インストール

`ot2asa` は `Node.js` で動作します。以下のコマンドでインストールできます。
```sh
$ npm install -g @akashic-extension/ot2asa
```

# 使い方
OpenToonzで作成したスプライトシートの情報が書かれたテキストファイルを渡してください。

```sh
$ ot2asa info.txt
```

## オプション

### -h, --help
ヘルプを表示します。

### -V, --version
バージョンを表示します。

### -o, --out-dir
出力先ディレクトリを指定します。存在しない時、ディレクトリを作成します。

### -p, --add-prefix
出力ファイルのファイル名に次の接頭辞を加えます。

| ファイル形式  | 接頭辞        |
|:------------- |:------------- |
| asapj         | pj_           |
| asabn         | bn_           |
| asaan         | an_           |
| asask         | sk_           |

### -P --set-prefix
`-p` オプションで出力ファイル名に加わる接頭辞を指定します。asapj,asabn,asask,asaan形式それぞれについて、この並びでカンマ区切りで指定します。デフォルトは`pj_,bn_,sk_,an_`です。

### -i, --image-asset-name
イメージアセット名を指定します。デフォルトは入力したテキストファイル名から拡張子を除いたものとおなじになります。

### -r, --root-bone-name
ルートボーン名を指定します。デフォルトは `root` です。

### -c, --cell-base-name
セルベース名を指定します。デフォルトは `cell` です。セルはスプライトシートに含まれるスプライトの数だけ作成され、それぞれの名前は `<セルベース名>_<連番>` となります。番号は0から始まります。

### -C, --cell-size
asapjファイルのユーザデータ領域にスプライトの大きさを格納します。

使用例:
```
const actor = new asa.Actor({ /* パラメータ省略 */ });
// asapj形式のデータをテキストアセットから取得
const project = JSON.parse((<g.TextAsset>scene.assets["pj_player_walk"]).data).contents;
// スプライトのサイズ(akashic-animationのセルサイズ)をActorの大きさに用いる
const actor.idth = project.userData.cell.width;
const actor.height = project.userData.cell.height;
```

### -f, --fps
フレームレートを指定します。

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
