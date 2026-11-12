# Changelog

## 0.2.0

- Enter inserts a line break; sending needs Cmd on macOS and Ctrl elsewhere.
- The send button keeps its disabled shape until the send key is held; clicks without it are ignored.
- Send labels are resolved when the composer mounts, so a late locale registration no longer leaves the button unstyled.
- Stop generating is never gated, and the `/` and `@` menus keep Enter.
