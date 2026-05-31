# browser-arena

A multiplayer browser game built for coworkers — fast sessions, real decisions, no one sitting out for long.

---

## Inspiration

| Game | What We're Stealing |
|------|---------------------|
| **diep.io** | Mid-match XP → loadout progression, build identity |
| **slither.io** | Risk/reward loop, kills drop loot, map feels alive |
| **Rocketbot Royale** | Pre-fight tension, weapon variety, last-man-standing payoff |

The goal is a hybrid: diep.io's progression system inside a rocketbot-style match that actually *ends*.

---

## The Core Loop

```
Spawn → Farm XP (orbs + kills) → Spend on loadout → Fight → Win or Respawn → Zone closes → Last player wins
```

The key insight: diep.io's endless progression creates great moment-to-moment gameplay but no climax. Adding a shrinking zone and a hard ending turns that same progression into *stakes*.

---

## Match Structure

Target session length: **6-8 minutes** for 5-8 players.

| Phase | Time | Zone Size | Respawn? |
|-------|------|-----------|----------|
| **Early** | 0-2 min | Full map | Yes — keep loadout, lose 40% unspent XP |
| **Mid** | 2-4 min | ~60% | Yes — keep loadout, lose 20% unspent XP |
| **Endgame** | 4-6 min | Shrinking to 0 | No — final fight |

When respawns close, there should be a clear visual/audio signal so everyone knows the stakes just changed.

Dead players during respawn window: spectate briefly, drop back in on the zone edge within ~10 seconds.

### Why the Respawn Penalty Flips

Early deaths lose *more* unspent XP because you haven't made decisions yet — death stings but isn't catastrophic. By mid-game you've probably spent most of your XP on your build anyway, so the penalty is lower. Your *loadout* (decisions made) is always preserved on respawn.

---

## Progression System

XP comes from:
- Killing players
- Collecting orbs scattered on the map
- Killed players drop their unspent XP as orbs

XP is spent on **loadout slots**. You start with just a weapon slot. Spending unlocks more slots.

### Loadout Slots (3 total)

| Slot | Examples |
|------|---------|
| **Weapon** | Shotgun, sniper, rapid fire, rocket launcher |
| **Passive** | HP regen, speed boost, larger XP pickup radius, armor |
| **Special** | Dash, shield bubble, turret drop, mine |

Early game you might only have a weapon. A fully upgraded player has all 3 slots filled — and made real choices about what goes in them.

---

## Design Principles

- **No one spectates for more than 30 seconds.** Respawn fast or die trying.
- **Death should sting, not eliminate.** Losing unspent XP is fair. Losing your build is not.
- **Early game has purpose.** Farming XP isn't hiding — it's building. Every second matters.
- **The endgame is the payoff.** When the zone closes and respawns lock, everyone alive knows it's for real.
- **Short matches, instant rematch.** Coworker sessions need "one more game" energy.

---

## Implementation Roadmap

Suggested build order:

1. **Match lifecycle** — lobby → active (early/mid/endgame phases) → winner screen
2. **Zone system** — shrinking safe area, damage outside, phase transitions
3. **XP + loadout** — orb spawning, kill drops, upgrade UI, slot system
4. **Respawn rules** — phase-aware respawn logic, spectate mode, drop-in on zone edge
5. **Weapon variety** — at least 3-4 distinct weapon types with different feel
6. **Passives + specials** — the build-identity layer

---

## Current State

- [x] Basic multiplayer movement
- [x] Projectile shooting
- [x] HP system
- [x] Kill tracking + respawn skeleton
- [ ] Match lifecycle (lobby / phases / end)
- [ ] Zone / shrinking map
- [ ] XP system
- [ ] Loadout / upgrade system
- [ ] Weapon variety
- [ ] Passives + specials
