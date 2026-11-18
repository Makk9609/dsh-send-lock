# dsh-send-lock

调整 DSH Web 的消息发送方式：Enter 只换行，不提交草稿；发送用 Cmd（macOS）或 Ctrl。

[English](README.md)

## 安装

```sh
dsh plugin --profile web add github:Makk9609/dsh-send-lock
```

重启 `dsh web`，或从 Plugin Manager 安装。

## 使用

- Enter：换行；空草稿不执行操作。
- Cmd+Enter（macOS）或 Ctrl+Enter：发送。
- 发送按钮：按住对应修饰键时才可用；否则保持禁用样式，点击不发送。
- Shift+Enter：换行，行为不变。
- 停止生成：不受影响。

## 兼容性

- 仅支持 DSH Web UI（`dsh.client.platform` 为 `web`）。
- 发送按钮按 composer 提供的文案识别；识别不到时退回原生行为。
- 输入法组字、`/` 命令菜单、`@` 引用菜单的 Enter 仍归它们。

## 许可证

MIT
