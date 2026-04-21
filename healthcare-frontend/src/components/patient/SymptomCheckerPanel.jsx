import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import api from '../../services/api';

const SymptomCheckerPanel = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = symptomInput.trim().replace(',', '');
      if (val && !symptoms.includes(val)) {
        setSymptoms([...symptoms, val]);
      }
      setSymptomInput('');
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/v1/symptoms/check', { symptoms });
      setResult({
        riskLevel: res.data.riskLevel || 'Medium',
        recommendation: res.data.recommendation || 'Please consult a doctor.',
        possibleConditions: res.data.possibleConditions || []
      });
    } catch (err) {
      setResult({
        riskLevel: 'Error',
        recommendation: 'Failed to analyze symptoms. Please try again.',
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    if (level === 'Low') return { bg: '#dcfce7', color: '#15803d' };
    if (level === 'Medium') return { bg: '#fef3c7', color: '#b45309' };
    if (level === 'High') return { bg: '#fee2e2', color: '#b91c1c' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  return (
    <div className="pat-panel">
      <div className="pat-panel__header">
        <h3 className="pat-panel__title">
          <span className="pat-panel__title-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>🔬</span>
          AI Symptom Checker
        </h3>
      </div>
      <div className="pat-panel__body">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Enter your symptoms separated by commas or press Enter.
        </p>

        <div className="pat-symptom-input-wrapper">
          {symptoms.map((sym, i) => (
            <span key={i} className="pat-symptom-tag">
              {sym}
              <button type="button" onClick={() => removeSymptom(i)}></button>
            </span>
          ))}
          <input
            type="text"
            className="pat-symptom-input"
            placeholder={symptoms.length === 0 ? "e.g. Headache, Fever..." : ""}
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button 
          className="pat-btn pat-btn--primary" 
          onClick={analyzeSymptoms}
          disabled={loading || symptoms.length === 0}
          style={{ width: '100%' }}
        >
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>

        {loading && (
          <div style={{ marginTop: '20px' }}>
            <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '60px' }}></div>
          </div>
        )}

        {!loading && result && !result.error && (
          <div className="pat-symptom-result">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.85rem' }}>Risk Level</strong>
              <span style={{ 
                padding: '4px 12px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                backgroundColor: getRiskColor(result.riskLevel).bg,
                color: getRiskColor(result.riskLevel).color,
                textTransform: 'uppercase'
              }}>
                {result.riskLevel}
              </span>
            </div>
            
            <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Recommendation</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              {result.recommendation}
            </p>

            {result.possibleConditions && result.possibleConditions.length > 0 && (
              <>
                <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Possible Conditions</strong>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '20px' }}>
                  {result.possibleConditions.map((cond, i) => (
                    <li key={i}>{cond}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {!loading && result && result.error && (
          <div className="pat-symptom-result" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
            <strong style={{ fontSize: '0.85rem' }}>Error</strong>
            <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>{result.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomCheckerPanel;
