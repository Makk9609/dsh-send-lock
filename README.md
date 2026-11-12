# dsh-send-lock

One stray Enter and a half-written sentence goes to the model: the turn is interrupted and tokens are gone.

Send lock turns Enter into a line break. To send, hold Cmd (macOS) or Ctrl and press Enter — or hold it and click the send button. Without the key the button looks the way it does with an empty draft, and clicking it does nothing.

[中文](README.zh.md)

## Install

```sh
dsh plugin --profile web add github:Makk9609/dsh-send-lock
```

Restart `dsh web`, or install from Plugin Manager.

## Usage

- Enter: line break. Nothing happens when the draft is empty.
- Cmd+Enter (macOS) or Ctrl+Enter: send.
- Send button: the same disabled look as an empty draft until the key is held; clicking it without the key does nothing.
- Shift+Enter still breaks lines, and Stop generating stays one click.

## Notes

- The send button is recognised by the composer's own send labels (“Send message”, “Queue message”, “Steer message”). If those labels change, the button goes back to the native always-enabled state instead of getting stuck.
- IME composition and the `/` and `@` menus keep Enter.
- Web UI only (`dsh.client.platform` is `web`).

## License

MIT
