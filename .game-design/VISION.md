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
| **Weapon** | Shotgun, sniper, rapid fire, rocket launcher, melee |
| **Passive** | HP regen, speed boost, larger XP pickup radius, armor |
| **Special** | Dash, shield bubble, turret drop, mine |

Early game you might only have a weapon. A fully upgraded player has all 3 slots filled — and made real choices about what goes in them.

---

## Perspective

**Top-down (bird's eye)** — committed. Current movement, collision, and shooting are all already top-down. Switching to a platformer would mean rebuilding gravity, jump physics, and the entire map format.

Rocketbot's high-ground depth is replaced by **map design**:
- **Chokepoints** — doorways and corridors worth controlling
- **Cover** — pillars and walls to peek around
- **Zone value** — center of map is high-risk/high-reward (more XP orbs), edges are safer but weaker position
- **Line of sight** — snipers need clear lanes, melee needs to close distance through cover

This gives real positioning depth without gravity. Think Hotline Miami / Enter the Gungeon more than Rocketbot.

---

## Movement

The goal is movement that's easy to pick up but has real skill expression — not diep.io's bland WASD, but approachable for new players unlike full rocketbot momentum.

### The System

- **WASD**: slow base movement, no momentum/glide — snappy stop when you release keys. Positioning matters because you can't just run away.
- **Mouse**: aims for ranged weapons. Shoot button is flexible — could be click, could be a key depending on weapon type.
- **Dash** (shift or dedicated key): short cooldown burst in your movement direction. The primary skill expression — use it to escape, reposition, or slam someone into a wall.

### Why Walls Make This Work

diep.io feels aimless partly because the map is infinite. Walled maps with corners change everything:
- Momentum and dash direction become real decisions
- Players can be pinned, cornered, or outmaneuvered
- Good players use walls to redirect; bad players get trapped by them

Dash is the **default special ability** — players can swap it for shield bubble, mine, etc. as part of their loadout. This means movement depth scales with progression too.

### Melee as a Weapon Class

Melee players don't need mouse aim — pure WASD + dash to close distance. This creates a natural rock-paper-scissors:
- Melee **counters** snipers (forces close range)
- Melee **loses to** shotguns and rockets (punished at close range)
- Melee players almost certainly run dash in their special slot — a meaningful tradeoff that's baked into the class fantasy

---

## Game Modes

**MVP: FFA (Free For All).** All core systems — XP, zone, respawn, loadout — are designed around FFA first.

Future modes: 2v2v2v2, 4v4, and other team configs are planned but out of scope for MVP.

**Dev note:** keep player identity decoupled from team identity from day one. A `player.teamId` that's `null` in FFA means adding teams later is purely additive — no rewrite needed.

---

## Map Design

*To be decided — key questions:*
- Hand-crafted maps or procedurally generated?
- Single map or a rotation?
- Does the zone always shrink toward center, or toward a random point?

---

## Lobby & Match Flow

*To be decided — key questions:*
- How does a match start? Host presses start, or auto-countdown when enough players join?
- After a winner: auto-restart after a delay, or return to lobby?

---

## Loadout Timing

*To be decided — key question:*
- Do you pick up weapons from the map and swap freely mid-match?
- Or do you commit to a weapon type and XP upgrades it over time?
- Or a hybrid — you have a base weapon but can pick up temporary powerup weapons?

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

1. **Mouse aiming** — decouple aim from move direction, click to shoot
2. **Dash system** — cooldown burst, server-authoritative, plugs into special slot later
3. **Match lifecycle** — lobby → active (early/mid/endgame phases) → winner screen
2. **Zone system** — shrinking safe area, damage outside, phase transitions
3. **XP + loadout** — orb spawning, kill drops, upgrade UI, slot system
4. **Respawn rules** — phase-aware respawn logic, spectate mode, drop-in on zone edge
5. **Weapon variety** — at least 3-4 distinct weapon types with different feel
6. **Passives + specials** — the build-identity layer

---

## Current State

- [x] Basic multiplayer movement (WASD)
- [x] Projectile shooting
- [x] HP system
- [x] Kill tracking + respawn skeleton
- [ ] Mouse aiming + click to shoot
- [ ] Dash ability (cooldown burst)
- [ ] Match lifecycle (lobby / phases / end)
- [ ] Zone / shrinking map
- [ ] XP system
- [ ] Loadout / upgrade system
- [ ] Weapon variety
- [ ] Passives + specials
