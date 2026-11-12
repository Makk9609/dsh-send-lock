# dsh-send-lock

A stray Enter sends a half-written message to the model. Send lock makes Enter a line break and keeps the send button in its disabled shape until the send key is held: Cmd on macOS, Ctrl elsewhere.

[中文](README.zh.md)

## Install

```sh
dsh plugin --profile web add github:Makk9609/dsh-send-lock
```

Restart `dsh web`, or install from Plugin Manager.

## Usage

- Enter: line break, nothing when the draft is empty.
- Cmd+Enter (macOS) or Ctrl+Enter: send.
- Send button: disabled shape until the send key is held; a click without it does nothing.
- Shift+Enter still breaks lines, and Stop generating stays one click.

## Notes

- The send button is recognised by the composer's own send labels (“Send message”, “Queue message”, “Steer message”). When those labels change, the button returns to the native always-enabled state instead of getting stuck.
- IME composition and the `/` and `@` menus keep Enter.
- Web UI only (`dsh.client.platform` is `web`).

## License

MIT
