import React from 'react';
import { getOrbitalActorsForBody } from '../../config/celestialCatalog';
import { useCosmosStore } from '../../store/useCosmosStore';

/**
 * Pure React DOM quick-badge strip for orbital moons and spacecraft.
 * Replaces in-canvas @react-three/drei <Html> portals to prevent React 19 removeChild errors.
 */
export const OrbitalCalloutOverlay: React.FC = () => {
  const activeBodyId = useCosmosStore((state) => state.activeBodyId);
  const showOrbits = useCosmosStore((state) => state.showOrbits);
  const viewStage = useCosmosStore((state) => state.viewStage);
  const activeDeviceId = useCosmosStore((state) => state.activeDeviceId);
  const activeTarget = useCosmosStore((state) => state.activeTarget);
  const selectTarget = useCosmosStore((state) => state.selectTarget);
  const controlsLocked = useCosmosStore((state) => state.controlsLocked);

  if (!showOrbits || viewStage !== 'ORBITAL_OVERVIEW' || activeDeviceId || activeTarget) {
    return null;
  }

  const actors = getOrbitalActorsForBody(activeBodyId);
  if (actors.length === 0) return null;

  return (
    <div
      className="orbital-callout-strip"
      data-testid="orbital-callout-strip"
      role="region"
      aria-label="Orbital targets quick selector"
    >
      <span className="orbital-callout-caption">ORBITAL TRACKS</span>
      <div className="orbital-callout-pills">
        {actors.map((actor) => (
          <button
            key={actor.id}
            type="button"
            className="orbital-callout-pill"
            data-testid={`orbital-pill-${actor.id}`}
            disabled={controlsLocked}
            onClick={() => selectTarget(actor)}
            title={actor.subtitle}
          >
            <span
              className={`orbital-callout-dot ${actor.category === 'MOON' ? 'is-moon' : 'is-craft'}`}
            />
            <span>{actor.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
