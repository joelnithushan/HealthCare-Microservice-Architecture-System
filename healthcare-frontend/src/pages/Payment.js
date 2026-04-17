import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPayment } from '../services/payment';
import toast from 'react-hot-toast';

export default function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [amountError, setAmountError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [publishableKey, setPublishableKey] = useState('');

  const cardRef = useRef(null);
  const cardElementRef = useRef(null);
  const stripeRef = useRef(null);

  const validateAmount = (val) => {
    if (!val) return 'Amount is required.';
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return 'Please enter a valid positive amount.';
    if (num < 1) return 'Minimum payment is $1.00.';
    if (num > 10000) return 'Maximum payment is $10,000.';
    return '';
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    const err = validateAmount(amount);
    setAmountError(err);
    if (err) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await createPayment(appointmentId, user.id, parseFloat(amount));
      setClientSecret(res.data.stripeClientSecret);
      setPublishableKey(res.data.stripePublishableKey);
      setStatus('card_entry');
    } catch (err) {
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'card_entry' || !publishableKey) return;

    const loadStripe = () => new Promise((resolve, reject) => {
      if (window.Stripe) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });

    loadStripe().then(() => {
      stripeRef.current = window.Stripe(publishableKey);
      const elements = stripeRef.current.elements();
      cardElementRef.current = elements.create('card', {
        style: {
          base: {
            color: '#334155',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '16px',
            '::placeholder': { color: '#94a3b8' },
          },
          invalid: { color: '#ef4444' },
        },
      });
      cardElementRef.current.mount(cardRef.current);
    });

    return () => {
      if (cardElementRef.current) cardElementRef.current.unmount();
    };
  }, [status, publishableKey]);

  const handleConfirmPayment = async () => {
    if (!stripeRef.current || !cardElementRef.current || !clientSecret) return;
    setLoading(true);
    try {
      const { error: stripeError } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElementRef.current },
      });
      if (stripeError) {
        toast.error(stripeError.message);
      } else {
        setStatus('success');
      }
    } catch {
      toast.error('Payment confirmation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') return (
    <div style={styles.wrapper}>
      <div className="flat-card" style={styles.card}>
        <div style={styles.successIcon}></div>
        <h2 style={styles.heading}>Payment Successful!</h2>
        <p style={styles.sub}>Your consultation fee has been paid. You can now join your video call.</p>
        <button className="flat-btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => navigate(`/dashboard/consult/${appointmentId}`)}>
           Join Video Call
        </button>
        <button className="flat-btn-outline" style={{ width: '100%' }} onClick={() => navigate('/dashboard/appointments')}>
          ← Back to Appointments
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div className="flat-card" style={styles.card}>
        <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}></div>
        <h2 style={styles.heading}>Pay Consultation Fee</h2>
        <p style={styles.sub}>Appointment #{appointmentId} • Secure payment powered by Stripe</p>

        {status === 'idle' && (
          <form onSubmit={handleCreatePayment} noValidate>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="flat-label">Amount (USD)</label>
              <input
                type="number"
                min="1"
                max="10000"
                step="0.01"
                placeholder="e.g. 25.00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setAmountError(''); }}
                className="flat-input"
                style={amountError ? { borderColor: 'red' } : {}}
              />
              {amountError && <p style={styles.fieldError}>{amountError}</p>}
            </div>
            <button type="submit" disabled={loading} className="flat-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Initializing…' : 'Proceed to Payment →'}
            </button>
          </form>
        )}

        {status === 'card_entry' && (
          <div style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="flat-label">Card Details</label>
              <div ref={cardRef} style={styles.stripeCard} />
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
                Test card: <strong style={{ color: 'var(--text-main)' }}>4242 4242 4242 4242</strong> · Any future date · Any CVC
              </p>
            </div>
            <button onClick={handleConfirmPayment} disabled={loading} className="flat-btn" style={{ width: '100%' }}>
              {loading ? 'Processing…' : `Pay $${parseFloat(amount).toFixed(2)}`}
            </button>
          </div>
        )}

        <button className="flat-btn-outline" style={{ width: '100%', marginTop: '1rem', border: 'none' }} onClick={() => navigate(-1)}>← Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: 20,
    animation: 'fadeIn 0.3s ease-out',
  },
  card: {
    padding: '40px 36px',
    maxWidth: 460,
    width: '100%',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 8,
    margin: 0,
  },
  sub: {
    color: 'var(--text-muted)',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 1.6,
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'left',
    fontWeight: 500,
  },
  stripeCard: {
    padding: 14,
    background: '#f8fafc',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-none)',
    marginBottom: 12,
  },
};
