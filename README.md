# ui-backend-for-famanager
ui-backend-for-famanager は、AIONプラットフォーム が 提供する FAビジョンシステム の UIバックエンド リソース です。

## 概要

- テンプレート登録機能
  - テンプレートマッチングで使用するためのテンプレート画像生成、アノテーション範囲指定機能
- テンプレートマッチング結果出力
  - テンプレートマッチングによる判定結果をストリーミングで表示

## 動作環境

### 1.前提条件

動作には以下の環境であることを前提とします。
* OS: Linux
* CPU: ARM
* Kubernetes
* AION

### 2.事前準備

実行環境に以下のソフトウェアがインストールされている事を前提とします。

* Kubernetesのインストール
* Envoyのインストール
* aion-core-manifests の設定と構築
* aion-service-definitions/services.yaml の設定と構築

## 機器構成

- ワークステーション 1 台(この UI リソースを配置する)
- PLC1 台

## kubernetes 上での使用方法

### DB ダンプファイルインポート(初回のみ)

1. mysql-kube を kubernetes の同一 namespace 上に展開します
2. 以下のコマンドでスキーマを作成します  
   `$ mysql -u(ユーザー名) -p(パスワード) -h 127.0.0.1 -P(mysql-kubeの Node port番号)`  
   `mysql> create database FAManager;`  
   `mysql> create database PeripheralDevice;`  
   `mysql> exit;`
3. 以下のコマンドでダンプファイルをインポートします  
   `$ mysql -u(ユーザー名) -p(パスワード) -h 127.0.0.1 -P(mysql-kubeのNode port番号) FAManager < sql/FAManager.sql`  
   `$ mysql -u(ユーザー名) -p(パスワード) -h 127.0.0.1 -P(mysql-kubeのNode port番号) PeripheralDevice < sql/PeripheralDevice.sql`
4. UI バックエンドが使用するユーザー名、パスワードの設定をします  
   config/db.json の deployment>dbuser の値を MySQL のユーザー名、deployment>dbpass を MySQL のパスワードに書き換えます

### 起動方法

1. 以下のコマンドでDockerイメージをビルドします  
`$ make docker-build`
2. aion-service-definitions の services.yml に以下のように記載し、AION を実行します  
```yaml
  ui-backend-for-famanager:
    scale: 1
    startup: yes
    always: yes
    network: NodePort
    env:
      PUBLIC_DIR: /var/lib/aion/UI/ui-backend-for-famanager/public
      DATA_DIR: /var/lib/aion/Data/
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_USER: [MySQL ユーザ名]
      MYSQL_PASSWORD: [MySQL パスワード]
      DB_NAME: FAManager
      RABBITMQ_URL: amqp://[RabbitMQ ユーザ名]:[RabbitMQ パスワード]@rabbitmq:5672/pokayoke
      QUEUE_TO_TEMPLATE_1: template-matching-by-opencv-for-rtsp-1-queue
      QUEUE_TO_TEMPLATE_2: template-matching-by-opencv-for-rtsp-2-queue
    volumeMountPathList:
      - /var/lib/aion/UI/ui-backend-for-famanager/public:/var/lib/aion/default/UI/ui-backend-for-famanager/public
    ports:
      - name: api
        port: 8080
        protocol: TCP
        nodePort: 30081
      - name: streaming1
        port: 30555
        protocol: TCP
        nodePort: 30555
      - name: streaming2
        port: 30556
        protocol: TCP
        nodePort: 30556
```
