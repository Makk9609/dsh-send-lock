# dsh-send-lock

Changes how DSH Web sends messages: Enter inserts a newline instead of submitting the draft, and sending takes Cmd on macOS or Ctrl elsewhere.

[中文](README.zh.md)

## Install

```sh
dsh plugin --profile web add github:Makk9609/dsh-send-lock
```

Restart `dsh web`, or install from Plugin Manager.

## Usage

- Enter: line break. An empty draft does nothing.
- Cmd+Enter (macOS) or Ctrl+Enter: send.
- Send button: usable only while that modifier is held; otherwise it keeps the disabled look and a click does nothing.
- Shift+Enter: line break, unchanged.
- Stop generating: not gated.

## Compatibility

- DSH Web UI only (`dsh.client.platform` is `web`).
- The send button is identified by the label the composer provides. When it cannot be identified, the button returns to its native behavior.
- IME composition, the `/` command menu, and the `@` reference menu keep Enter.

## License

MIT
