import React, { useState } from 'react';

export default function IBANTransferForm() {
  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState('');

  const handleIbanChange = (e) => {
    setIban(e.target.value);
  }

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  }

  return (
    <div>
      <h2>IBAN Transfer</h2>
      <div>
        <label htmlFor="iban">IBAN:</label>
        <input
          type="text"
          id="iban"
          value={iban}
          onChange={handleIbanChange}
        />
      </div>
      <div>
        <label htmlFor="amount">Amount:</label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>
    </div>
  );
}
