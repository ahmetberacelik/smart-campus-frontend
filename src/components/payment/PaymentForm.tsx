import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { Card, CardContent } from '@/components/ui/Card';
import './PaymentForm.css';

export interface PaymentFormData {
  amount: number;
  paymentMethod: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  minAmount?: number;
  maxAmount?: number;
  className?: string;
}

/**
 * Payment form component
 * Cüzdan yükleme için ödeme formu
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  minAmount = 10,
  maxAmount = 10000,
  className = '',
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const paymentMethods = [
    { value: 'credit_card', label: '💳 Kredi Kartı' },
    { value: 'debit_card', label: '💳 Banka Kartı' },
    { value: 'bank_transfer', label: '🏦 Banka Havalesi' },
    { value: 'mobile_payment', label: '📱 Mobil Ödeme' },
  ];

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < minAmount || numAmount > maxAmount) {
      return;
    }

    if (!paymentMethod) {
      return;
    }

    onSubmit({
      amount: numAmount,
      paymentMethod,
    });
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum >= minAmount && amountNum <= maxAmount;
  const isFormValid = isValidAmount && paymentMethod && !loading;

  return (
    <Card className={`payment-form ${className}`}>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="payment-form-group">
            <label className="payment-label">Tutar (₺)</label>
            <TextInput
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Tutar girin"
              min={minAmount}
              max={maxAmount}
              step="0.01"
              required
            />
            {amount && !isValidAmount && (
              <span className="payment-error">
                Tutar {minAmount}₺ - {maxAmount}₺ arasında olmalıdır
              </span>
            )}
          </div>

          <div className="quick-amounts">
            <label className="payment-label">Hızlı Seçim:</label>
            <div className="quick-amount-buttons">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  className={`quick-amount-btn ${amount === quickAmount.toString() ? 'active' : ''}`}
                  onClick={() => handleQuickAmount(quickAmount)}
                >
                  {quickAmount}₺
                </button>
              ))}
            </div>
          </div>

          <div className="payment-form-group">
            <label className="payment-label">Ödeme Yöntemi</label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: '', label: 'Ödeme Yöntemi Seçin' },
                ...paymentMethods,
              ]}
              required
            />
          </div>

          {amount && isValidAmount && (
            <div className="payment-summary">
              <div className="summary-row">
                <span>Yüklenecek Tutar:</span>
                <span className="summary-amount">{amountNum.toFixed(2)}₺</span>
              </div>
            </div>
          )}

          <div className="payment-actions">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                İptal
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isFormValid}
              fullWidth={!onCancel}
            >
              {loading ? 'Ödeme İşleniyor...' : 'Ödemeye Devam Et'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

