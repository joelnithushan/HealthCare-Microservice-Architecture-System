import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, AlertTriangle, CheckCircle, Info, BrainCircuit, X, Loader2, Stethoscope, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './SymptomCheckerPanel.css';

const SymptomCheckerPanel = ({ fullPage = false }) => {
  const navigate = useNavigate();
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const user = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymptom();
    }
  };

  const addSymptom = () => {
    const val = symptomInput.trim().replace(',', '');
    if (val && !symptoms.includes(val)) {
      setSymptoms([...symptoms, val]);
    } else if (symptoms.includes(val)) {
      toast.error('Symptom already added', { id: 'symptom-dup' });
    }
    setSymptomInput('');
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.error("Please enter at least one symptom.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/v1/symptoms/check', {
        userId: user?.id,
        symptoms,
      });
      const d = res.data || {};
      setResult({
        urgency: (d.urgency || 'MEDIUM').toUpperCase(),
        riskLevel: d.riskLevel || 'Medium',
        recommendation: d.recommendation || d.aiSuggestion || 'Please consult a doctor.',
        possibleConditions: d.possibleConditions || [],
        recommendedSpecialty: d.recommendedSpecialty || 'General Physician',
      });
      toast.success("Analysis complete");
    } catch (err) {
      console.error("Symptom Analysis Error:", err);
      toast.error("Analysis failed. Please try again.");
      setResult({
        urgency: 'ERROR',
        recommendation: 'Our AI service is currently unavailable. If this is an emergency, please call your local emergency number immediately.',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyConfig = (level) => {
    switch(level) {
      case 'LOW': return { cssClass: 'risk-low', icon: <CheckCircle size={16} />, label: 'Low Risk' };
      case 'MEDIUM': return { cssClass: 'risk-medium', icon: <Info size={16} />, label: 'Medium Risk' };
      case 'HIGH': return { cssClass: 'risk-high', icon: <AlertTriangle size={16} />, label: 'High Risk' };
      case 'ERROR': return { cssClass: 'risk-high', icon: <AlertTriangle size={16} />, label: 'Error' };
      default: return { cssClass: 'risk-unknown', icon: <Activity size={16} />, label: 'Unknown' };
    }
  };

  const goBookDoctor = () => {
    const spec = result?.recommendedSpecialty || '';
    navigate(`/patient/dashboard/doctors?specialty=${encodeURIComponent(spec)}`);
  };

  return (
    <div className="ai-symptom-container" style={fullPage ? { maxWidth: '900px', margin: '0 auto', boxShadow: '0 20px 50px -15px rgba(0,0,0,0.1)' } : undefined}>
      <div className="ai-symptom-header">
        <div className="ai-icon-box">
          <BrainCircuit size={28} />
        </div>
        <div className="ai-header-content">
          <h3>{fullPage ? 'AI Diagnostic Assistant' : 'Symptom Checker'}</h3>
          <p>Describe your symptoms and receive AI-guided specialist recommendations.</p>
        </div>
      </div>
      
      <div className="ai-symptom-body">
        <div className="symptom-input-box">
          {symptoms.map((sym, i) => (
            <span key={i} className="symptom-badge">
              {sym}
              <button type="button" onClick={() => removeSymptom(i)}>
                <X size={14} />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={symptoms.length === 0 ? "e.g., Severe headache, Mild fever, Dry cough..." : "Type another symptom..."}
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {symptomInput.trim() && (
            <button 
              onClick={addSymptom} 
              style={{
                background: '#e0f2fe', color: '#0284c7', border: 'none', 
                padding: '6px 14px', borderRadius: '99px', fontSize: '0.85rem', 
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Add
            </button>
          )}
        </div>

        <button
          className="analyze-btn"
          onClick={analyzeSymptoms}
          disabled={loading || (symptoms.length === 0 && symptomInput.trim() === '')}
        >
          {loading ? (
             <><Loader2 size={20} className="spinning" /> Analyzing deeply...</>
          ) : (
             <><Activity size={20} /> Run AI Analysis</>
          )}
        </button>

        {!loading && result && (
          <div className="ai-result-card">
            <div className="result-header">
              <h3><BrainCircuit size={20} color="#0284c7" /> Analysis Results</h3>
              <div className={`risk-badge ${getUrgencyConfig(result.urgency).cssClass}`}>
                {getUrgencyConfig(result.urgency).icon} {getUrgencyConfig(result.urgency).label}
              </div>
            </div>

            <div className="result-body">
              <div className="recommendation-box" style={{ borderColor: result.error ? '#b91c1c' : '#0284c7' }}>
                <h4>{result.error ? <AlertTriangle size={18} color="#b91c1c" /> : <Info size={18} color="#0284c7" />} Recommendation</h4>
                <p>{result.recommendation}</p>
              </div>

              {!result.error && result.possibleConditions && result.possibleConditions.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>Possible Conditions</h4>
                  <div className="conditions-list">
                    {result.possibleConditions.map((cond, i) => (
                      <div key={i} className="condition-item">{cond}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!result.error && (
              <div className="result-footer">
                <div className="specialist-info">
                  <h4>Recommended Specialist</h4>
                  <p><Stethoscope size={20} /> {result.recommendedSpecialty}</p>
                </div>
                <button className="book-btn" onClick={goBookDoctor}>
                  Book Appointment <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="disclaimer">
          <Info size={14} /> AI suggestions are informational only and not a substitute for professional medical advice.
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPanel;
