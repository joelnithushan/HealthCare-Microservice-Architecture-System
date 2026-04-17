import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import logo from '../../assets/logo.png';

const Sidebar = ({ navLinks, basePath }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="doc-sidebar">
      <div className="doc-sidebar__logo-wrap">
        <Link to={basePath}>
          <img src={logo} alt="Clinexa" className="doc-sidebar__logo" />
        </Link>
      </div>

      <nav className="doc-sidebar__nav">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`doc-sidebar__link ${isActive(link.path) ? 'doc-sidebar__link--active' : ''}`}
          >
            <span className="doc-sidebar__icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="doc-sidebar__footer">
        <button onClick={handleLogout} className="doc-sidebar__logout">
          <span></span>
          Logout
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  basePath: PropTypes.string.isRequired,
};

export default Sidebar;
