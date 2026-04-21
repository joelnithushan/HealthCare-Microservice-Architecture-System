import React from 'react';
import PropTypes from 'prop-types';
import { CreditCard, Wallet } from 'lucide-react';

const PaymentsTable = ({ payments, loading }) => {
  if (loading) {
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span className="pat-panel__title-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <CreditCard size={18} />
            </span>
            Recent Payments
          </h3>
        </div>
        <div className="pat-panel__body">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <div className="skeleton" style={{ width: '20%', height: '20px' }}></div>
              <div className="skeleton" style={{ width: '40%', height: '20px' }}></div>
              <div className="skeleton" style={{ width: '20%', height: '20px' }}></div>
              <div className="skeleton" style={{ width: '20%', height: '20px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pat-panel">
      <div className="pat-panel__header">
        <h3 className="pat-panel__title">
          <span className="pat-panel__title-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CreditCard size={18} />
          </span>
          Recent Payments
        </h3>
      </div>
      <div className="pat-panel__body pat-panel__body--no-pad">
        {payments.length === 0 ? (
          <div className="pat-empty-state">
            <div className="pat-empty-state__icon">
              <Wallet size={48} color="#15803d" />
            </div>
            <div className="pat-empty-state__text">No recent payments found</div>
            <div className="pat-empty-state__sub">Payment records will appear here after consultations</div>
          </div>
        ) : (
          <table className="pat-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 5).map((pay) => (
                <tr key={pay.id}>
                  <td>{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : '--/--/----'}</td>
                  <td style={{ fontWeight: 600 }}>{pay.description || 'Medical Consultation'}</td>
                  <td>${Number(pay.amount).toFixed(2)}</td>
                  <td>
                    <span className={`pat-badge ${pay.status === 'PAID' || pay.status === 'COMPLETED' || pay.status === 'SUCCESS' ? 'pat-badge--completed' : 'pat-badge--pending'}`}>
                      {pay.status || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

PaymentsTable.propTypes = {
  payments: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

export default PaymentsTable;
