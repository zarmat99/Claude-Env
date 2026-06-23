import json
import sys
import time
import webview


URL = 'http://127.0.0.1:8877/'


def emit(event, **data):
    print(json.dumps({'event': event, **data}, ensure_ascii=False), flush=True)


def evaluate(window, expression):
    return window.evaluate_js(expression)


def wait_for(window, expression, timeout=30):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            if evaluate(window, expression):
                return True
        except Exception:
            pass
        time.sleep(0.2)
    return False


def api_async(window, expression, timeout=120):
    evaluate(
        window,
        f"""(() => {{
            window.__codexJob = {{ done: false }};
            Promise.resolve({expression}).then(
                value => window.__codexJob = {{ done: true, value }},
                error => window.__codexJob = {{ done: true, error: String(error) }}
            );
            return true;
        }})()"""
    )
    deadline = time.time() + timeout
    while time.time() < deadline:
        job = evaluate(window, "window.__codexJob")
        if job and job.get('done'):
            if job.get('error'):
                raise RuntimeError(job['error'])
            return job.get('value')
        time.sleep(0.2)
    raise TimeoutError(expression)


def state(window):
    return evaluate(window, "GameAPI.state()")


def inventory(window):
    return evaluate(window, "GameAPI.inventory()")


def fight(window):
    if not wait_for(window, "GameAPI.combat() !== null", timeout=4):
        return False

    first = evaluate(window, "GameAPI.combat()")
    emit('combat_started', combat=first)

    while True:
        combat = evaluate(window, "GameAPI.combat()")
        if combat is None:
            break
        if combat.get('ended') or not combat.get('active') or combat.get('enemyHp', 1) <= 0:
            time.sleep(1.0)
            evaluate(window, "GameAPI.combatContinue()")
            time.sleep(0.5)
            break
        if not combat.get('playerTurn'):
            time.sleep(0.25)
            continue

        hp = combat['playerHp']
        max_hp = evaluate(window, "GameAPI.player().derived.maxHealth")
        potions = evaluate(window, "GameAPI.count('health_potion_minor')")
        if hp < max_hp * 0.42 and potions > 0:
            action = 'health_potion_minor'
            evaluate(window, "GameAPI.combatUse('health_potion_minor')")
        elif combat['round'] % 4 == 0 and hp < max_hp * 0.75:
            action = 'defend'
            evaluate(window, "GameAPI.combatAction('defend')")
        else:
            action = 'attack'
            evaluate(window, "GameAPI.combatAction('attack')")
        emit('combat_action', action=action, combat=combat)
        previous_round = combat['round']
        deadline = time.time() + 8
        while time.time() < deadline:
            updated = evaluate(window, "GameAPI.combat()")
            if updated is None or updated.get('ended') or updated['round'] != previous_round:
                break
            time.sleep(0.2)

    emit('combat_ended', state=state(window), inventory=inventory(window))
    return True


def navigate(window, x, y, label):
    emit('travel_started', destination=label, target={'x': x, 'y': y}, origin=state(window)['player']['pos'])
    for _ in range(4):
        api_async(window, f"GameAPI.navigateTo({x}, {y}, {{ timeoutMs: 90000 }})", timeout=100)
        if evaluate(window, "GameAPI.combat() !== null"):
            fight(window)
            continue
        pos = state(window)['player']['pos']
        if abs(pos['x'] - x) <= 1 and abs(pos['y'] - y) <= 1:
            emit('travel_arrived', destination=label, position=pos)
            return True
    emit('travel_failed', destination=label, state=state(window))
    return False


def talk(window, label, choice_indexes):
    evaluate(window, "GameAPI.interact()")
    if not wait_for(window, "GameAPI.dialogue() !== null", timeout=5):
        emit('dialogue_failed', npc=label, nearby=state(window)['nearby'])
        return False

    for choice_index in choice_indexes:
        dialogue = evaluate(window, "GameAPI.dialogue()")
        if dialogue is None:
            break
        emit('dialogue', npc=label, speaker=dialogue['speaker'],
             text=dialogue['text'], choices=dialogue['choices'])
        if choice_index >= len(dialogue['choices']):
            emit('dialogue_choice_missing', npc=label, requested=choice_index)
            evaluate(window, "GameAPI.closeDialogue()")
            return False
        emit('dialogue_choice', npc=label, selected=dialogue['choices'][choice_index])
        evaluate(window, f"GameAPI.choose({choice_index})")
        time.sleep(0.45)

    dialogue = evaluate(window, "GameAPI.dialogue()")
    if dialogue is not None:
        emit('dialogue', npc=label, speaker=dialogue['speaker'],
             text=dialogue['text'], choices=dialogue['choices'])
        if not dialogue['choices']:
            evaluate(window, "GameAPI.closeDialogue()")
    time.sleep(0.5)
    return True


def try_station(window, station, approaches):
    before = inventory(window)
    for i, (x, y) in enumerate(approaches, start=1):
        navigate(window, x, y, f"{station}, lato {i}")
        evaluate(window, "GameAPI.interact()")
        time.sleep(0.4)
    after = inventory(window)
    emit(
        'station_attempted',
        station=station,
        resonance_samples=evaluate(window, "GameAPI.count('resonance_sample')"),
        inventory_changed=before != after,
        quests=state(window)['quests']
    )


def play(window):
    try:
        if not wait_for(window, "typeof GameAPI !== 'undefined'", timeout=30):
            raise RuntimeError('GameAPI non caricata')
        if not wait_for(window, "GameAPI.state().scenes.includes('MainMenu')", timeout=30):
            raise RuntimeError('Menu principale non pronto')

        emit('session_ready')
        api_async(
            window,
            "GameAPI.newGame({name:'Arden',race:'cindrak',bonus:{STR:2,END:3}})",
            timeout=10
        )
        if not wait_for(window, "GameAPI.state().scenes.includes('Game')", timeout=10):
            raise RuntimeError('Creazione personaggio fallita')

        evaluate(window, "GameAPI.equip('iron_sword')")
        emit('character_created', state=state(window), inventory=inventory(window))

        # Explore Greyhollow and collect the three real world pickups.
        navigate(window, 84, 100, 'piazza di Greyhollow')
        navigate(window, 86, 102, 'fucina di Greyhollow')
        navigate(window, 80, 99, 'lato occidentale della locanda')

        # Buy a useful rumor from the innkeeper.
        navigate(window, 83, 100, 'Hollow Hearth')
        talk(window, 'locandiere di Greyhollow', [3, 0, 0])

        # Seek out and fight a real hostile creature.
        navigate(window, 95, 112, 'frangia sud-est di Greyhollow')
        if evaluate(window, "GameAPI.combat() !== null"):
            fight(window)

        # Meet Cael, ask for context, accept the main quest, then speak again
        # so the active quest records the conversation objective.
        navigate(window, 85, 80, 'stazione di Warden Cael')
        talk(window, 'Warden Cael', [0, 0, 0, 0, 0, 0])
        wait_for(window, "GameAPI.player().quests.active.has('main_act1')", timeout=5)
        emit('quest_started', state=state(window))
        talk(window, 'Warden Cael', [2, 0])
        emit('quest_after_second_talk', state=state(window))

        # Visit every monitoring station on foot and try all accessible sides.
        try_station(window, 'Station Verath', [(88, 73), (86, 75), (88, 77), (90, 75)])
        try_station(window, 'Station Ossian', [(80, 68), (78, 70), (80, 72), (82, 70)])
        try_station(window, 'Station Keld', [(108, 86), (106, 88), (108, 90), (110, 88)])

        # A second real combat encounter on the return route.
        navigate(window, 68, 90, 'boschi a ovest di Greyhollow')
        if evaluate(window, "GameAPI.combat() !== null"):
            fight(window)

        evaluate(window, "GameAPI.save()")
        final = {
            'state': state(window),
            'inventory': inventory(window),
            'resonanceSamples': evaluate(window, "GameAPI.count('resonance_sample')"),
            'mainAct1Stage': evaluate(
                window,
                "GameAPI.player().quests.active.has('main_act1') ? "
                "GameAPI.player().quests.active.get('main_act1') : null"
            ),
            'saved': evaluate(window, "!!localStorage.getItem('aethermoor_save')")
        }
        emit('playthrough_stopped_at_implemented_limit', **final)
    except Exception as exc:
        emit('error', message=str(exc))

    # Keep the genuine played session open for inspection.
    if '--close' in sys.argv:
        window.destroy()


if __name__ == '__main__':
    game_window = webview.create_window(
        'Aethermoor — partita di Arden',
        URL,
        width=1100,
        height=760,
        hidden=False
    )
    webview.start(play, game_window, gui='edgechromium', private_mode=False,
                  storage_path='.aethermoor-live-session')
