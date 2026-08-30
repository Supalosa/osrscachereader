# SDK integration workarounds

This file tracks local changes made while using `osrscachereader` to build the
OSRS SDK cache-render bundle. Each item should eventually become an upstream
feature, fix, or contribution rather than remaining an undocumented fork.

## Model composition: optional vertex deduplication

`ModelGroup` now accepts a `deduplicateVertices` option. The SDK passes
`false` when composing player equipment and NPC parts. Cross-model
`removeCommonVerticies()` can weld coincident vertices belonging to separate
meshes; that produces stray triangles (notably a bridge between separated
boots). Deduplication remains the default for existing callers.

**Upstream contribution:** document the composition semantics and expose a
named merge policy (or make deduplication opt-in for heterogeneous model
groups), with a regression fixture containing separate equipment meshes.

## Quiet unknown item opcodes

Unknown `ItemLoader` opcodes are silent by default and can be logged with
`OSRS_CACHE_READER_VERBOSE=1`. The SDK only needs the fields it explicitly
extracts, so noisy warnings from newer cache revisions obscure actionable
errors.

**Upstream contribution:** add a configurable logger/strictness option rather
than directly consulting an environment variable.

## Optional native canvas dependency

`SpriteLoader` no longer imports `canvas` at module load time. Native canvas is
loaded only when image rendering is requested; raw sprite palette/pixel data
works without a system canvas installation.

**Upstream contribution:** make rendering backends explicit (raw pixels,
browser canvas, or Node canvas) and document the optional dependency.

## Reader entry-point export

The package exports `./reader` so the Node-only SDK extraction adapter can use
the cache reader without relying on internal package paths.

**Upstream contribution:** retain the public subpath export and document the
supported extraction API.

## Sequence masks for layered player animation

The SDK needs to combine a pose sequence (legs) with an attack sequence
(upper body). The relevant legacy-animation mask is sequence opcode 3,
exposed by the reader as `SequenceDefinition.interleaveLeave`. Its entries
refer to frame-map transform slots, not model vertex groups. The SDK exports
that list together with each frame's `indexFrameIds`, and reproduces the
client's two-pass composition: attack transforms outside the list first,
then pose transforms inside the list, with origin transforms in both passes.
No height-derived body mask is used.

This did not require a local reader patch because the decoded definitions
already expose the necessary data.

**Upstream contribution:** expose a documented legacy `animate2`/layered-frame
helper (or a stable serializable representation of it), with a fixture that
combines a player movement pose and attack sequence.

## Current Spotanim model-id opcode

Current OpenRS2 caches encode Spotanim model IDs with opcode `3` as a four-byte
integer; older revisions use opcode `1` with a two-byte integer. The reader
now accepts both forms so the SDK can extract Spotanims 478, 506, and 1172.

**Upstream contribution:** document the revision-dependent Spotanim schema and
add fixtures covering both model-id encodings.
