import React from 'react';
import PropTypes from 'prop-types';

const Panel = ({ 
  isOpen, 
  toggleOpen, 
  title, 
  children, 
  panelHeaderClass 
}) => (
  <div className="panel">
    <div
      className={`panel-header ${panelHeaderClass(isOpen)}`}
      onClick={toggleOpen}
    >
      <h3>{title}</h3>
      <button type="button" className="panel-toggle-btn">
        <span className={`arrow-icon ${isOpen ? 'arrow-down' : 'arrow-right'}`}></span>
      </button>
    </div>
    {isOpen && (
      <div className="panel-body">
        {children}
      </div>
    )}
  </div>
);

Panel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  panelHeaderClass: PropTypes.func.isRequired,
};

export default Panel;
