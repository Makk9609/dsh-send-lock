import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')

const DICTIONARY = {
  'input.send': '发送消息',
  'input.send.queue': '排队发送',
  'input.send.steer': '插话发送'
}

class FakeKeyboardEvent {
  constructor(type, init) {
    this.type = type
    Object.assign(this, init)
    this.defaultPrevented = false
    this.propagationStopped = false
  }

  preventDefault() {
    this.defaultPrevented = true
  }

  stopPropagation() {
    this.propagationStopped = true
  }
}

function editable(text) {
  return {
    isContentEditable: true,
    textContent: text,
    parentElement: null,
    sent: [],
    dispatchEvent(event) {
      this.sent.push(event)
      return true
    }
  }
}

function load(platform, { dictionaryReady = true } = {}) {
  const state = { sheet: null, loaded: null, dictionaryReady }
  const listeners = new Map()
  const windowListeners = new Map()
  const localeListeners = []
  const registrations = []
  const disposers = []
  const attributes = new Map()

  const document = {
    documentElement: {
      setAttribute(name) {
        attributes.set(name, '')
      },
      removeAttribute(name) {
        attributes.delete(name)
      }
    },
    head: {
      appendChild(element) {
        state.sheet = element
      }
    },
    createElement() {
      return {
        dataset: {},
        textContent: '',
        remove() {
          if (state.sheet === this) state.sheet = null
        }
      }
    },
    addEventListener(type, listener) {
      listeners.set(type, listener)
    },
    removeEventListener(type) {
      listeners.delete(type)
    }
  }

  const window = {
    __ModuleLoader__: {
      load(entry) {
        state.loaded = entry
      }
    },
    addEventListener(type, listener) {
      windowListeners.set(type, listener)
    },
    removeEventListener(type) {
      windowListeners.delete(type)
    }
  }

  const ctx = {
    effect(factory) {
      const disposer = factory()
      if (typeof disposer === 'function') disposers.push(disposer)
      return disposer
    },
    on(name, listener) {
      assert.equal(name, 'locale/change')
      localeListeners.push(listener)
      return () => {}
    },
    locale: {
      bind(namespace) {
        assert.equal(namespace, 'conversation')
        return (key) => (state.dictionaryReady ? DICTIONARY[key] ?? key : key)
      }
    },
    slots: {
      inject(name, factory) {
        assert.equal(name, 'conversation.input.overlay')
        factory()
        return () => {}
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      }
    }
  }

  vm.runInNewContext(source, {
    window,
    document,
    navigator: { platform },
    KeyboardEvent: FakeKeyboardEvent,
    console
  })

  const react = {
    createElement: () => null,
    useEffect: (effect) => effect()
  }
  const plugin = state.loaded.factory((name) => {
    assert.equal(name, 'react')
    return react
  })
  plugin.apply(ctx)

  return {
    plugin,
    doc: document,
    sheet: () => state.sheet,
    attributes,
    registrations,
    enableDictionary() {
      state.dictionaryReady = true
    },
    mount() {
      assert.equal(registrations.length, 1)
      return registrations[0].component()
    },
    keydown: listeners.get('keydown'),
    keyup: listeners.get('keyup'),
    click: listeners.get('click'),
    pointermove: listeners.get('pointermove'),
    pointerdown: listeners.get('pointerdown'),
    visibilitychange: listeners.get('visibilitychange'),
    blur: windowListeners.get('blur'),
    localeListeners,
    dispose() {
      for (const dispose of disposers.slice().reverse()) dispose()
    },
    press(target, init = {}) {
      const event = new FakeKeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        isComposing: false,
        repeat: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target,
        ...init
      })
      this.keydown(event)
      return event
    },
    clickOn(label, init = {}) {
      const button = { getAttribute: (name) => (name === 'aria-label' ? label : null) }
      const target = { closest: (selector) => (selector === 'button' ? button : null) }
      const event = {
        target,
        ctrlKey: false,
        metaKey: false,
        defaultPrevented: false,
        propagationStopped: false,
        ...init,
        preventDefault() {
          this.defaultPrevented = true
        },
        stopPropagation() {
          this.propagationStopped = true
        }
      }
      this.click(event)
      return event
    }
  }
}

// 会话插件晚于本插件注册字典：挂载后补齐按钮文案。
{
  const app = load('MacIntel', { dictionaryReady: false })
  assert.equal(app.sheet().textContent, '')
  assert.equal(app.clickOn('发送消息').defaultPrevented, false)

  app.enableDictionary()
  app.mount()

  assert.match(app.sheet().textContent, /button\[aria-label="发送消息"\]/)
  assert.match(app.sheet().textContent, /button\[aria-label="排队发送"\]/)
  assert.match(app.sheet().textContent, /button\[aria-label="插话发送"\]/)
  assert.match(app.sheet().textContent, /opacity:\.4/)
  assert.equal(app.clickOn('发送消息').defaultPrevented, true)
}

// macOS: only Cmd sends.
{
  const app = load('MacIntel')
  assert.equal(Array.from(app.plugin.inject).join(','), 'locale,slots')

  const filled = editable('half typed\n')
  const insert = app.press(filled)
  assert.equal(insert.defaultPrevented, true)
  assert.equal(insert.propagationStopped, true)
  assert.equal(filled.sent.length, 1)
  assert.equal(filled.sent[0].key, 'Enter')
  assert.equal(filled.sent[0].shiftKey, true)
  assert.equal(filled.sent[0].bubbles, true)

  const empty = editable('')
  assert.equal(app.press(empty).defaultPrevented, true)
  assert.equal(empty.sent.length, 0)

  assert.equal(app.press(editable('t'), { metaKey: true }).defaultPrevented, false)
  assert.equal(app.press(editable('t'), { ctrlKey: true }).defaultPrevented, true)
  assert.equal(app.press(editable('t'), { shiftKey: true }).defaultPrevented, false)
  assert.equal(app.press(editable('t'), { altKey: true }).defaultPrevented, false)
  assert.equal(app.press(editable('t'), { isComposing: true }).defaultPrevented, false)
  assert.equal(app.press(editable('/goal 写测试')).defaultPrevented, false)
  assert.equal(app.press(editable('看一下 @src')).defaultPrevented, false)
  assert.equal(app.press(filled, { repeat: true }).defaultPrevented, true)
  assert.equal(filled.sent.length, 1)
  assert.equal(app.press({ isContentEditable: false, textContent: 't' }).defaultPrevented, false)

  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Control' }))
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Meta' }))
  assert.equal(app.attributes.has('data-dsh-send-mod'), true)
  app.keyup(new FakeKeyboardEvent('keyup', { key: 'Meta', metaKey: false }))
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Meta' }))
  app.blur()
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)

  // 浏览器接管的组合键吞掉 keyup 后，后续输入把按住态校准回来。
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Meta' }))
  app.keydown(new FakeKeyboardEvent('keydown', { key: 's', metaKey: true, shiftKey: true }))
  assert.equal(app.attributes.has('data-dsh-send-mod'), true)
  app.pointermove({ metaKey: false, ctrlKey: false })
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Meta' }))
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'a', metaKey: false }))
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Meta' }))
  app.pointerdown({ metaKey: false, ctrlKey: false })
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Meta' }))
  app.doc.visibilityState = 'hidden'
  app.visibilitychange()
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)

  assert.equal(app.clickOn('发送消息').defaultPrevented, true)
  assert.equal(app.clickOn('发送消息', { metaKey: true }).defaultPrevented, false)
  assert.equal(app.clickOn('发送消息', { ctrlKey: true }).defaultPrevented, true)
  assert.equal(app.clickOn('停止生成').defaultPrevented, false)
  assert.equal(app.clickOn('添加附件').defaultPrevented, false)

  app.localeListeners[0]()
  assert.ok(app.sheet().textContent.includes('发送消息'))
  app.dispose()
  assert.equal(app.sheet(), null)
}

// Windows and Linux: only Control sends.
{
  const app = load('Win32')
  assert.equal(app.press(editable('t'), { ctrlKey: true }).defaultPrevented, false)
  const foreign = editable('t')
  assert.equal(app.press(foreign, { metaKey: true }).defaultPrevented, true)
  assert.equal(foreign.sent.length, 1)
  assert.equal(app.clickOn('发送消息', { ctrlKey: true }).defaultPrevented, false)
  assert.equal(app.clickOn('发送消息', { metaKey: true }).defaultPrevented, true)
  app.keydown(new FakeKeyboardEvent('keydown', { key: 'Control' }))
  assert.equal(app.attributes.has('data-dsh-send-mod'), true)
  app.dispose()
  assert.equal(app.attributes.has('data-dsh-send-mod'), false)
}

console.log('smoke ok')
