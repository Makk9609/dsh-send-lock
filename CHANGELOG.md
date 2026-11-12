# Changelog

## 0.2.1

- 用 Cmd+Shift+S 这类被浏览器接管的组合键后，页面收不到按键抬起，按住态会一直留着；现在按键、鼠标移动、点击和页面隐藏都会重新校准。
- 中英文说明改成直白的说法。

## 0.2.0

- Enter inserts a line break; sending needs Cmd on macOS and Ctrl elsewhere.
- The send button keeps its disabled shape until the send key is held; clicks without it are ignored.
- Send labels are resolved when the composer mounts, so a late locale registration no longer leaves the button unstyled.
- Stop generating is never gated, and the `/` and `@` menus keep Enter.
