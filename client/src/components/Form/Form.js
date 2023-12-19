import React, { Component } from 'react';
import { submitUrl } from '../../API';

import './Form.scss';
const validUrlRegex = RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/i);

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
}

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      errors: {
        url: ' ',
      },
      isFormValid: true,
      isModalOpen: false
    };
  }

  handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    let errors = this.state.errors;
    switch (name) {
      case 'url': 
        errors.url = 
        validUrlRegex.test(value)
            ? ''
            : 'The url seems to be invalid.';
      break;
      default:
        break;
    }
    
    this.setState({errors, [name]: value});
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    let isFormValid = this.state.isFormValid;
    if(validateForm(this.state.errors)) {
      this.setState({isFormValid: true});
      if (!/^https?:\/\//i.test(this.state.url)) {
        this.state.url = 'https://' + this.state.url;
      }
     
      try {
        const result = await submitUrl(this.state);
        this.setState({ isModalOpen: false });
        this.props.setModalOpen(this.state.isModalOpen);
      } catch (error) {
        // TODO: Add error handling
      }
    }else{
      this.setState({isFormValid: false});
    }
  }

  render() {
    const {errors} = this.state;
    const {isFormValid} = this.state;
    return (
        <div className='form'>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className='input-container'>
              <input className="form__input" type='text' name='url' onChange={this.handleChange} placeholder="url" noValidate />
              <label className="form__label" htmlFor="url">Website URL</label>
              {errors.url.length > 0 && 
                <span className='form__error'>{errors.url}</span>}
            </div>
            <div className='submit'>
              <button>Monit</button>
            </div>
            <div className="form__validation">
                {isFormValid === false &&
                  <div className="form__error form__error--centered">The url seems to be invalid.</div>
                }
              </div>
          </form>
        </div>
    );
  }
}

export default Form;