import React from "react";
import Form from 'react-bootstrap/Form';

const MainIcon = (
  <svg preserveAspectRatio="none" width="20" height="20" overflow="visible" style={{ display: 'block' }} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M14.4024 15.4295C12.8777 16.7211 10.9048 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 10.9027 16.7226 12.8738 15.4333 14.3979L19.5034 18.4681L18.4722 19.4993L14.4024 15.4295ZM16.0417 8.75C16.0417 12.7771 12.7771 16.0417 8.75 16.0417C4.72292 16.0417 1.45833 12.7771 1.45833 8.75C1.45833 4.72292 4.72292 1.45833 8.75 1.45833C12.7771 1.45833 16.0417 4.72292 16.0417 8.75Z" fill="#F8604A"/>
  </svg>
);

const BarsIcon = (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="11.2629" y="11.2998" width="1.54" height="4.4" rx="0.77" fill="#F8604A"/>
    <rect x="17.8625" y="12.3999" width="1.54" height="2.2" rx="0.77" fill="#F8604A"/>
    <rect x="14.5637" y="11.2998" width="1.54" height="4.4" rx="0.77" fill="#F8604A"/>
    <rect x="7.96411" y="11.2998" width="1.54" height="4.4" rx="0.77" fill="#F8604A"/>
    <rect x="4.66333" y="12.4" width="1.54" height="2.2" rx="0.77" fill="#F8604A"/>
  </svg>

);

const Input = ({ onInputFocus, value, onChange, onSend }) => {
  return (
    <div
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 28,
        boxShadow: '0px 4px 64px 0px rgba(0,0,0,0.1)',
        border: '0.5px solid #aaaaaa',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        width: '100%'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>{MainIcon}</span>
      <Form.Control
        type="text"
        placeholder="Ask Yazeka anything"
        value={value || ''}
        onChange={onChange}
        style={{
          border: 'none',
          boxShadow: 'none',
          background: 'transparent',
          fontSize: 16,
          height: 40,
          paddingLeft: 0,
          paddingRight: 0,
        }}
        onFocus={onInputFocus}
        onClick={onInputFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && onSend) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <span style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>{BarsIcon}</span>
    </div>
  );
};

export default Input; 