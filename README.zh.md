# dsh-send-lock

误触回车会把没写完的消息发出去。发送锁把回车改成断行，并且在按住发送键之前让发送按钮保持禁用形态：macOS 是 Cmd，其它平台是 Ctrl。

[English](README.md)

## 安装

```sh
dsh plugin --profile web add github:Makk9609/dsh-send-lock
```

重启 `dsh web`，或从 Plugin Manager 安装。

## 使用

- 回车：换行，草稿为空时无动作。
- Cmd+回车（macOS）或 Ctrl+回车：发送。
- 发送按钮：未按住发送键时是禁用形态，点击不发送。
- Shift+回车照旧换行，停止生成始终一键可用。

## 说明

- 发送按钮按 composer 自己的发送文案识别（“发送消息”、“排队发送”、“插话发送”）。文案变化时，按钮退回原生始终可用状态，不会卡死在禁用形态。
- 输入法组字、`/` 命令菜单、`@` 引用菜单：回车归它们。
- 只支持 Web UI（`dsh.client.platform` 为 `web`）。

## 许可证

MIT
