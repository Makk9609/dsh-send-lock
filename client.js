/**
 * dsh-send-lock browser half: plain Enter inserts a line break, and the send
 * button keeps its disabled shape until the platform send modifier is held.
 */
window.__ModuleLoader__.load({
  id: 'dsh-send-lock',
  factory(require) {
    const React = require('react')
    const SEND_KEYS = ['input.send', 'input.send.queue', 'input.send.steer']
    const MOD_ATTR = 'data-dsh-send-mod'
    const UA_DATA = navigator.userAgentData
    const PLATFORM = UA_DATA !== undefined && typeof UA_DATA.platform === 'string' ? UA_DATA.platform : navigator.platform
    const IS_MAC = PLATFORM === 'macOS' || /^Mac/.test(PLATFORM ?? '')

    let labels = []
    let replaying = false
    let modifier = false
    let render = () => {}

    function sendsWith(event) {
      return (IS_MAC ? event.metaKey : event.ctrlKey) === true
    }

    function rootOf(node) {
      let root = node
      while (root.parentElement !== null && root.parentElement.isContentEditable === true) root = root.parentElement
      return root
    }

    // 菜单打开时 Enter 属于菜单：行首 `/` 命令，或行尾未闭合的 `@` 引用。
    function menuOpen(text) {
      if (/^\s*\//.test(text)) return true
      const tail = /\S+$/.exec(text)
      return tail !== null && tail[0].startsWith('@')
    }

    function insertLineBreak(editor) {
      replaying = true
      try {
        editor.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          shiftKey: true,
          bubbles: true,
          cancelable: true
        }))
      } finally {
        replaying = false
      }
    }

    // 浏览器接管的组合键（截图、录屏）会吞掉 keyup，按住态得靠后续输入重新校准。
    function setModifier(held) {
      if (held === modifier) return
      modifier = held
      const root = document.documentElement
      if (held) root.setAttribute(MOD_ATTR, '')
      else root.removeAttribute(MOD_ATTR)
    }

    function onKeyDown(event) {
      if (event.key === 'Control' || event.key === 'Meta') {
        if (event.key === (IS_MAC ? 'Meta' : 'Control')) setModifier(true)
        return
      }
      setModifier(sendsWith(event))
      if (replaying || event.key !== 'Enter') return
      if (event.isComposing === true || event.keyCode === 229) return
      if (event.altKey || event.shiftKey) return
      if (sendsWith(event)) return
      const target = event.target
      if (target === null || target.isContentEditable !== true) return
      const editor = rootOf(target)
      const text = editor.textContent ?? ''
      if (menuOpen(text)) return
      event.preventDefault()
      event.stopPropagation()
      if (event.repeat || text.trim() === '') return
      insertLineBreak(editor)
    }

    function onKeyUp(event) {
      setModifier(sendsWith(event))
    }

    function onPointer(event) {
      setModifier(sendsWith(event))
    }

    function onVisibility() {
      if (document.visibilityState === 'hidden') setModifier(false)
    }

    function onBlur() {
      setModifier(false)
    }

    function onClick(event) {
      if (sendsWith(event)) return
      const target = event.target
      if (target === null || typeof target.closest !== 'function') return
      const button = target.closest('button')
      if (button === null) return
      const label = button.getAttribute('aria-label')
      if (label === null || labels.includes(label) === false) return
      event.preventDefault()
      event.stopPropagation()
    }

    // 组合器语言在会话插件激活后才注册，挂载发生在其 apply 之后。
    function ComposerMount() {
      React.useEffect(() => {
        render()
      }, [])
      return null
    }

    return {
      inject: ['locale', 'slots'],
      apply(ctx) {
        const t = ctx.locale.bind('conversation')
        const sheet = document.createElement('style')
        sheet.dataset.plugin = 'dsh-send-lock'

        render = () => {
          const next = []
          for (const key of SEND_KEYS) {
            const text = t(key)
            if (typeof text === 'string' && text !== '' && text !== key && next.includes(text) === false) next.push(text)
          }
          labels = next
          const selectors = next.map((label) => `html:not([${MOD_ATTR}]) button[aria-label="${label.replace(/["\\]/g, '\\$&')}"]`)
          sheet.textContent = selectors.length === 0 ? '' : `${selectors.join(',')}{opacity:.4;cursor:default}`
        }
        render()

        ctx.effect(() => {
          document.head.appendChild(sheet)
          return () => sheet.remove()
        }, 'send lock: styles')
        ctx.effect(() => ctx.on('locale/change', render), 'send lock: locale')
        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
          name: 'conversation.input.overlay',
          id: 'dsh-send-lock',
          order: 50
        }, ComposerMount))
        ctx.effect(() => {
          document.addEventListener('keydown', onKeyDown, true)
          document.addEventListener('keyup', onKeyUp, true)
          document.addEventListener('click', onClick, true)
          document.addEventListener('pointermove', onPointer, { capture: true, passive: true })
          document.addEventListener('pointerdown', onPointer, { capture: true, passive: true })
          document.addEventListener('visibilitychange', onVisibility)
          window.addEventListener('blur', onBlur)
          return () => {
            document.removeEventListener('keydown', onKeyDown, true)
            document.removeEventListener('keyup', onKeyUp, true)
            document.removeEventListener('click', onClick, true)
            document.removeEventListener('pointermove', onPointer, true)
            document.removeEventListener('pointerdown', onPointer, true)
            document.removeEventListener('visibilitychange', onVisibility)
            window.removeEventListener('blur', onBlur)
            setModifier(false)
          }
        }, 'send lock: gestures')
      }
    }
  }
})
