# dsh-send-lock

误触一下回车，没写完的半句话就发给模型了：对话被打断，token 也白花了。

这个插件把回车改成换行。要发消息，按住 Cmd（macOS）或 Ctrl 再回车；用鼠标就按住它再点发送按钮。没按住的时候，按钮和草稿为空时一样是淡的，点了也不发。

[English](README.md)

## 安装

```sh
dsh plugin --profile web add github:Makk9609/dsh-send-lock
```

重启 `dsh web`，或从 Plugin Manager 安装。

## 使用

- 回车：换行，草稿为空时什么都不做。
- Cmd+回车（macOS）或 Ctrl+回车：发送。
- 发送按钮：没按住发送键时是淡的，和草稿为空时一样；这时点它不会发。
- Shift+回车照旧换行，停止生成始终一键可用。

## 说明

- 发送按钮按 composer 自己的发送文案识别（“发送消息”、“排队发送”、“插话发送”）。文案变化时，按钮退回原生始终可用状态，不会卡在淡的那一档。
- 输入法组字、`/` 命令菜单、`@` 引用菜单：回车归它们。
- 只支持 Web UI（`dsh.client.platform` 为 `web`）。

## 许可证

MIT
