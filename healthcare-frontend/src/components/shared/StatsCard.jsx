import React from 'react';
import PropTypes from 'prop-types';

const StatsCard = ({ label, value, subtitle, icon, iconBg, iconColor, valueColor }) => {
  return (
    <div className="doc-stat-card">
      <div className="doc-stat-card__icon-row">
        <span className="doc-stat-card__label">{label}</span>
        <div
          className="doc-stat-card__icon"
          style={{ background: iconBg || 'var(--primary-light)', color: iconColor || 'var(--primary)' }}
        >
          {icon}
        </div>
      </div>
      <div className="doc-stat-card__value" style={{ color: valueColor || 'var(--primary)' }}>
        {value}
      </div>
      <span className="doc-stat-card__sub">{subtitle}</span>
    </div>
  );
};

StatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  iconBg: PropTypes.string,
  iconColor: PropTypes.string,
  valueColor: PropTypes.string,
};

export default StatsCard;
