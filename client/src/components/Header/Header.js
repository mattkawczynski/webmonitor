import React, { useState } from 'react';
import {
  NavLink
} from "react-router-dom";
import Modal from 'react-modal';
import WsComponent from "../../utils/ws";
import { Form } from "../Form";
import './Header.scss'

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    backgroundColor: '#2f3647'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 9999,
  },
};

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setModalOpen = (isOpen) => {
    setIsModalOpen(isOpen);
  };
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav__container">
        <div className="nav__status">
          <WsComponent />
        </div>
        <ul className="nav__list">
          <li className="nav__item">
            <NavLink to="monitoring">
              <span className="material-symbols-outlined">
                monitoring
              </span>
              Monitoring
            </NavLink>
          </li>
          <li className="nav__item">
            <NavLink to="incidents">
              <span className="material-symbols-outlined">
                fmd_bad
              </span>
              Incidents
            </NavLink>
          </li>
          <li className="nav__item">
            <a onClick={handleOpenModal} className={isModalOpen ? 'active' : ''}>
              <span className="material-symbols-outlined">
                add_circle
              </span>
              Add new
            </a>
          </li>

          <li className="nav__item nav__item--bottom">
            <NavLink to="config">
              <span className="material-symbols-outlined">
                settings
              </span>
              Settings
            </NavLink>
          </li>
        </ul>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        style={customModalStyles}
        contentLabel="Add New Modal"
        ariaHideApp={false}
      >
        <div className="add-new-modal">
          <button className="add-new-modal__close" onClick={handleCloseModal}>
            &times;
          </button>
          <div className="add-new-modal__content">
            <Form setModalOpen={setModalOpen}/>
          </div>
        </div>
      </Modal> 

    </nav>
  );
};

export default Header;