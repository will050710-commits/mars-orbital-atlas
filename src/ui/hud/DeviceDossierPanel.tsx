import React, { useState } from 'react';
import { getDossierById } from '../../config/deviceDossiers';

type DossierTabId = 'all' | 'bio' | 'specs' | 'measurements' | 'contributions';

const DOSSIER_TABS: Array<{ id: DossierTabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'bio', label: 'Biography' },
  { id: 'specs', label: 'Specs' },
  { id: 'measurements', label: 'Measured' },
  { id: 'contributions', label: 'Contributions' },
];

interface DeviceDossierPanelProps {
  targetId: string | null | undefined;
}

/**
 * Rich documented NASA mission dossier panel presenting biography, hardware specifications,
 * measured mission telemetry, and scientific contributions for Mars and Moon targets.
 */
export const DeviceDossierPanel: React.FC<DeviceDossierPanelProps> = ({ targetId }) => {
  const [activeTab, setActiveTab] = useState<DossierTabId>('all');
  const dossier = getDossierById(targetId);

  if (!dossier) return null;

  const showBio = activeTab === 'all' || activeTab === 'bio';
  const showSpecs = activeTab === 'all' || activeTab === 'specs';
  const showMeasurements = activeTab === 'all' || activeTab === 'measurements';
  const showContributions = activeTab === 'all' || activeTab === 'contributions';

  return (
    <section
      className="device-dossier-panel"
      data-testid="device-dossier-panel"
      aria-label="Mission dossier, parameters and scientific contributions"
    >
      <div className="device-control-header">
        <span className="dock-section-title">MISSION DOSSIER & CONTRIBUTIONS</span>
        <span className="control-pill-badge">{dossier.agencyAndProgram}</span>
      </div>

      <p className="dossier-era-badge">{dossier.era}</p>

      <div className="dossier-tab-row" role="tablist" aria-label="Dossier filter tabs">
        {DOSSIER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className="dossier-tab-btn"
            data-testid={`dossier-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showBio && (
        <div className="dossier-block" data-testid="dossier-section-bio">
          <h4>Biography & Mission Profile</h4>
          <p>{dossier.biography}</p>
        </div>
      )}

      {showSpecs && (
        <div className="dossier-block" data-testid="dossier-section-specs">
          <h4>Technical Specifications</h4>
          <dl className="dossier-kv-grid">
            {dossier.technicalSpecs.map((item) => (
              <div key={item.label} className="dossier-kv-item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {showMeasurements && (
        <div className="dossier-block" data-testid="dossier-section-measurements">
          <h4>Measured Mission Data</h4>
          <dl className="dossier-kv-grid">
            {dossier.measuredData.map((item) => (
              <div key={item.label} className="dossier-kv-item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {showContributions && (
        <div className="dossier-block" data-testid="dossier-section-contributions">
          <h4>Scientific & Engineering Contributions</h4>
          <ul className="dossier-contributions-list">
            {dossier.contributions.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="dossier-disclaimer">{dossier.modelDisclaimer}</p>
    </section>
  );
};
