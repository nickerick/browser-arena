# browser-arena

A multiplayer browser game built for coworkers — fast sessions, real decisions, no one sitting out for long.

---

## Inspiration

| Game                 | What We're Stealing                                         |
| -------------------- | ----------------------------------------------------------- |
| **diep.io**          | Mid-match XP → loadout progression, build identity          |
| **slither.io**       | Risk/reward loop, kills drop loot, map feels alive          |
| **Rocketbot Royale** | Pre-fight tension, weapon variety, last-man-standing payoff |

The goal is a hybrid: diep.io's progression system inside a rocketbot-style match that actually _ends_.

---

## The Core Loop

```
Spawn → Farm XP (orbs + kills) → Spend on loadout → Fight → Win or Respawn → Zone closes → Last player wins
```

The key insight: diep.io's endless progression creates great moment-to-moment gameplay but no climax. Adding a shrinking zone and a hard ending turns that same progression into _stakes_.

---

## Characters & Skins

**Default character: an egg.** Simple, original, charming. Easy for a beginner artist — top-down egg is just an oval with eyes and little feet.

### Anatomy

- **Body** — the egg sprite, this is what skins replace
- **Feet** — tiny legs poking out the bottom, 2-3 frame walk cycle (shuffling feet + slight body bob)
- **Barrel** — rotates around the body pointing toward mouse cursor, determines class readability

### Skins

Skins swap the body sprite entirely — anything goes. The barrel always renders on top so weapons are readable regardless of how wild the skin is. Examples: spotted egg, golden egg, dinosaur egg, chicken, rubber duck, guitar, McDonald's bag, a coworker's face. No rules.

### Art Notes

- Full top-down only (not pokemon 3/4 view) — one sprite per skin, one animation cycle, no multiple angle art needed
- Barrel is a shared asset across all skins — you draw it once
- Walk animation is intentionally simple and funny — little egg feet shuffling is the charm

---

## Perspective

**Top-down (bird's eye)** — committed. Current movement, collision, and shooting are all already top-down. Switching to a platformer would mean rebuilding gravity, jump physics, and the entire map format.

Rocketbot's high-ground depth is replaced by **map design**:

- **Chokepoints** — doorways and corridors worth controlling
- **Cover** — pillars and walls to peek around
- **Zone value** — center of map is high-risk/high-reward (more XP orbs), edges are safer but weaker position
- **Line of sight** — snipers need clear lanes, melee needs to close distance through cover

Think Hotline Miami / Enter the Gungeon more than Rocketbot.

---

## Movement

Easy to pick up but with real skill expression — not diep.io's bland WASD, but approachable unlike full rocketbot momentum.

- **WASD**: slow base movement, no momentum/glide — snappy stop when you release keys
- **Mouse**: aims for ranged weapons. Shoot input is flexible depending on weapon type
- **Dash** (shift or dedicated key): short cooldown burst in your movement direction — use it to escape, reposition, or slam someone into a wall

Walled maps make dash a real decision. Good players use walls to redirect; bad players get trapped by them. Dash is the **default special ability** — swappable for shield bubble, mine, etc. as part of the loadout.

### Melee Class

Melee players don't need mouse aim — pure WASD + dash to close distance.

- Melee **counters** snipers (forces close range)
- Melee **loses to** shotguns and rockets (punished up close)
- Dash is near-mandatory for melee — a meaningful tradeoff baked into the class

---

## Match Structure

Target session length: **6-8 minutes** for 5-8 players.

| Phase       | Time    | Zone Size      | Respawn?                                |
| ----------- | ------- | -------------- | --------------------------------------- |
| **Early**   | 0-2 min | Full map       | Yes — keep loadout, lose 40% unspent XP |
| **Mid**     | 2-4 min | ~60%           | Yes — keep loadout, lose 20% unspent XP |
| **Endgame** | 4-6 min | Shrinking to 0 | No — final fight                        |

When respawns close, a clear visual/audio signal fires so everyone knows the stakes just changed. Dead players during respawn window: spectate briefly, drop back in on the zone edge within ~10 seconds.

### Why the Respawn Penalty Flips

Early deaths lose _more_ unspent XP because you haven't made decisions yet. By mid-game you've probably spent most of your XP on your build anyway. Your _loadout_ (decisions made) is always preserved on respawn.

---

## Progression System

XP comes from:

- Killing players
- Collecting orbs scattered on the map
- Killed players drop their unspent XP as orbs

XP unlocks **loadout slots**. You start with just a weapon slot. Spending XP unlocks passive and special slots.

### Loadout Slots (3 total)

| Slot        | Examples                                              |
| ----------- | ----------------------------------------------------- |
| **Weapon**  | Shotgun, sniper, rapid fire, rocket launcher, melee   |
| **Passive** | HP regen, speed boost, larger XP pickup radius, armor |
| **Special** | Dash, shield bubble, turret drop, mine                |

### Loadout Timing

- **Base weapon** chosen at lobby — class identity for the round ("I'm the sniper this game")
- **XP upgrades your base weapon** over time — faster reload, more damage, etc.
- **Weapon pickups on the map are temporary** — grab a rocket launcher for ~15 seconds, then back to your base weapon

Freely swapping weapons would mean no one has identity. This model keeps identity, progression, and map excitement all at once.

---

## Map Design

**Hand-crafted maps.** One map for MVP, small rotation added later. Procedural generation makes it too hard to guarantee good chokepoints and cover balance.

Zone always shrinks **toward center** — predictable and fair, everyone knows where the endgame happens.

---

## Lobby & Match Flow

- **Match start**: host presses start — playing with coworkers means you know when everyone's ready
- **Post-match**: return to lobby, host restarts — natural pause to talk before the next game

---

## Game Modes

**MVP: FFA (Free For All).** All core systems are designed around FFA first.

Future modes: 2v2v2v2, 4v4, and other team configs are planned but out of scope for MVP.

**Dev note:** keep player identity decoupled from team identity from day one. A `player.teamId` of `null` in FFA means adding teams later is purely additive — no rewrite needed.

---

## Design Principles

- **No one spectates for more than 30 seconds.** Respawn fast or die trying.
- **Death should sting, not eliminate.** Losing unspent XP is fair. Losing your build is not.
- **Early game has purpose.** Farming XP isn't hiding — it's building. Every second matters.
- **The endgame is the payoff.** When the zone closes and respawns lock, everyone alive knows it's for real.
- **Short matches, instant rematch.** Coworker sessions need "one more game" energy.

---

## Implementation Roadmap

1. **Mouse aiming** — decouple aim from move direction
2. **Dash system** — cooldown burst, server-authoritative, plugs into special slot later
3. **Match lifecycle** — lobby → early/mid/endgame phases → winner screen
4. **Zone system** — shrinking safe area, damage outside, phase transitions
5. **XP + loadout** — orb spawning, kill drops, upgrade UI, slot system
6. **Respawn rules** — phase-aware logic, spectate mode, drop-in on zone edge
7. **Weapon variety** — at least 3-4 distinct weapon types with different feel
8. **Passives + specials** — the build-identity layer

---

## Current State

- [x] Basic multiplayer movement (WASD)
- [x] Projectile shooting
- [x] HP system
- [x] Kill tracking + respawn skeleton
- [ ] Mouse aiming
- [ ] Dash ability
- [ ] Match lifecycle (lobby / phases / end)
- [ ] Zone / shrinking map
- [ ] XP system
- [ ] Loadout / upgrade system
- [ ] Weapon variety
- [ ] Passives + specials
