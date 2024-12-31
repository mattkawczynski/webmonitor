import React from 'react';
import { deleteUrl } from '../../API';
import './DeleteUrl.scss';

const DeleteUrl = ({ id, handleRestRefresh }) => {
  async function handleDeleteUrl(urlId) {
    try {
      const result = await deleteUrl(urlId);
      handleRestRefresh(true);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <a onClick={() => handleDeleteUrl(id)}>
      <span className="material-symbols-outlined">
        remove_circle
      </span>
      Delete with data
    </a>
  );
};

export default DeleteUrl;