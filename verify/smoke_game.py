"""Short hidden WebView smoke test for Aethermoor."""

import json
import os
import time
import webview


URL = "http://127.0.0.1:8877/"


def wait_for(window, expression, timeout=30):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            if window.evaluate_js(expression):
                return True
        except Exception:
            pass
        time.sleep(0.2)
    return False


def run(window):
    result = {"loaded": False}
    try:
        result["loaded"] = wait_for(window, "typeof GameAPI !== 'undefined'", 30)
        if not result["loaded"]:
            raise RuntimeError("GameAPI did not load")
        wait_for(window, "GameAPI.state().scenes.includes('MainMenu')", 30)
        window.evaluate_js(
            """window.__smoke = {done:false};
            GameAPI.newGame({name:'Smoke',race:'varesh'}).then(
              value => window.__smoke={done:true,value},
              error => window.__smoke={done:true,error:String(error)}
            );"""
        )
        if not wait_for(window, "window.__smoke && window.__smoke.done", 15):
            raise RuntimeError("newGame timed out")
        result["newGame"] = window.evaluate_js("window.__smoke")
        result["state"] = window.evaluate_js("GameAPI.state()")
        result["canvasCount"] = window.evaluate_js("document.querySelectorAll('canvas').length")
    except Exception as exc:
        result["error"] = str(exc)
    print(json.dumps(result, ensure_ascii=False), flush=True)
    window.destroy()


if __name__ == "__main__":
    view = webview.create_window("Aethermoor smoke", URL, hidden=False, width=960, height=640)
    webview.start(
        run, view, gui="edgechromium", private_mode=False,
        storage_path=f".smoke-webview-{os.getpid()}"
    )
